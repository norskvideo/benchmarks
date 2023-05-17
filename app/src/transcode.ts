import fs from "fs";
import ladders from './ladders'
import yargs from "yargs";

import {
  create_norsk
  , srt_source
  , file_source
  , normalise_input
  , transcode
  , local_hls
} from './common'


import {
  Norsk,
  VideoEncodeRung
} from "@norskvideo/norsk-sdk";

type Arguments = {
  numInstances: number;
  load: number;
  ladder: string;
  file: string
}

let command: any = {
  command: "transcode",
  describe: "Runs the transcode benchmark",
  builder: {
    "ladder": {
      describe: "Which encode ladder to benchmark",
      demandOption: false,
      type: "string",
      default: "local",
    },
    "num-instances": {
      describe: "How many instances of Norsk are running and need configuring",
      demandOption: false,
      type: "number",
      default: 1,
    },
    "file": {
      describe: "A file source (TS or MP4) to read from",
      demandOption: true,
      type: "string",
      default: "",
    },
    "load": {
      describe: "How many jobs to run on each Norsk",
      demandOption: false,
      type: "number",
      default: 1,
    },
  },
  handler: transcode_main,
};

export default command;

async function transcode_main(args: yargs.ArgumentsCamelCase<Arguments>) {
  let streams: VideoEncodeRung[] = ladders[args.ladder] as VideoEncodeRung[];

  if (!streams) {
    console.log(`Unknown ladder ${args.ladder}`);
    return;
  }
  for (var n = 0; n < args.numInstances; n++) {
    for (var j = 0; j < args.load; j++) {
      let x = n + (j * args.numInstances);

      let norskPort = 6790 + (n * 100);
      let srtPort = 5001 + (j * 100);

      let norsk = await create_norsk(norskPort);
      
      let source = await file_source(norsk, args.file, `file-${x}`);

      let normalised = await normalise_input(norsk, source, `normalise-${x}`);
      let ladder = await transcode(norsk, normalised.video, streams, `transcode-${x}`);
      let output = local_hls(norsk, ladder, normalised.audio, streams, `output-${x}`);
    }
  }
}
