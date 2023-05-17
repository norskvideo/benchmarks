import ladders from './ladders'
import yargs from "yargs";

import {
  create_norsk
  , srt_source
  , normalise_input
  , transcode
  , local_hls
  , video_to_pin
} from './common'


import {
  VideoComposeSettings,
  ComposePart,
  VideoEncodeRung,
} from "@norskvideo/norsk-sdk";

type Arguments = {
  numInstances: number;
  load: number;
  ladder: string;
  overlaySize: number;
}

let command: any = {
  command: "compose",
  describe: "Runs the compose benchmark",
  builder: {
    "num-instances": {
      describe: "How many instances of Norsk are running and need configuring",
      demandOption: false,
      type: "number",
      default: 1,
    },
    "load": {
      describe: "How many jobs to run on each Norsk",
      demandOption: false,
      type: "number",
      default: 1,
    },
    "ladder": {
      describe: "Which encode ladder to benchmark",
      demandOption: false,
      type: "string",
      default: "local",
    },
    "overlay-size": {
      describe: "How big the overlay is as a percentage of width/height (50% would mean covering 25% of the pixels for example)",
      demandOption: false,
      type: "number",
      default: 0.25
    },
    "norsk": {
      describe: "Where to find norsk",
      demandOption: false,
      type: "number",
      default: 6790,
    },
    "start-index": {
      describe: "Offset for calculating where ports for IO start",
      demandOption: false,
      type: "number",
      default: 0,
    }
  },
  handler: compose_main,
};

export default command;

async function compose_main(args: yargs.ArgumentsCamelCase<Arguments>) {
  let streams: VideoEncodeRung[] = ladders[args.ladder] as VideoEncodeRung[];
  if (!streams) {
    console.log(`Unknown ladder ${args.ladder}`);
    return;
  }
  for (var n = 0; n < args.numInstances; n++) {
    for (var j = 0; j < args.load; j++) {
      let x = n + (j * args.numInstances);

      let norskPort = 6790 + (n * 100);
      let srtPort1 = 5001 + (j * 100);
      let srtPort2 = 5002 + (j * 100);

      let norsk = await create_norsk(norskPort);
      let source1 = await srt_source(norsk, srtPort1, `background-${x}`);
      let source2 = await srt_source(norsk, srtPort2, `overlay-${x}`);
      let normalised1 = await normalise_input(norsk, source1, `background-${x}`);
      let normalised2 = await normalise_input(norsk, source2, `overlay-${x}`);

      const background: ComposePart<"background"> = {
        pin: "background",
        opacity: 1.0,
        zIndex: 0,
        sourceRect: { x: 0, y: 0, width: 100, height: 100 },
        destRect: { x: 0, y: 0, width: 100, height: 100 },
      };
      const overlay: ComposePart<"overlay"> = {
        pin: "overlay",
        opacity: 1.0,
        zIndex: 1,
        sourceRect: { x: 0, y: 0, width: 100, height: 100 },
        destRect: { x: 0, y: 0, width: Math.floor(100 * args.overlaySize), height: Math.floor(100 * args.overlaySize) }
      };

      const parts = [background, overlay];

      const composeSettings: VideoComposeSettings<"background" | "overlay"> = {
        id: `compose-${x}`,
        referenceStream: background.pin,
        outputResolution: { width: streams[0].width, height: streams[0].height },
        referenceResolution: { width: 100, height: 100 },
        outputPixelFormat: "rgba",
        parts,
      };

      let compose = await norsk.processor.transform.videoCompose(composeSettings);

      compose.subscribeToPins([
        { source: normalised1.video, sourceSelector: video_to_pin(background.pin) },
        { source: normalised2.video, sourceSelector: video_to_pin(overlay.pin) },
      ]);

      let ladder = await transcode(norsk, compose, streams, `transcode-${x}`);
      let output = local_hls(norsk, ladder, normalised1.audio, streams, `output-${x}`);
    }
  }
}




