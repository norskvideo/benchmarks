import fs from "fs";
import ladders from "./ladders";
import yargs from "yargs";

import {
  Norsk,
  SourceMediaNode,
  RtpInputSettings,
  AudioMatrixMixerSettings,
  ChannelName,
} from "@id3asnorsk/norsk-sdk";

import { select_audio } from "./common";

import { create_norsk, local_hls } from "./common";

type Arguments = {
  numInstances: number;
  load: number;
};

let command: any = {
  command: "mixer",
  describe: "Runs the mier benchmark",
  builder: {
    "num-instances": {
      describe: "How many instances of Norsk are running and need configuring",
      demandOption: false,
      type: "number",
      default: 1,
    },
    load: {
      describe: "How many jobs to run on each Norsk",
      demandOption: false,
      type: "number",
      default: 1,
    },
  },
  handler: mixer_main,
};

export default command;

async function mixer_main(args: yargs.ArgumentsCamelCase<Arguments>) {
  for (var n = 0; n < args.numInstances; n++) {
    for (var j = 0; j < args.load; j++) {
      let x = n + j * args.numInstances;

      let norskPort = 6790 + n * 100;
      let rtpPort = 5001 + x * 100;

      let norsk = await create_norsk(norskPort);
      let source = await rtp_source(norsk, rtpPort, `source-${x}`);
      let mixer = await matrix_mixer(norsk, source, `mixer-${x}`);
      let hls = await local_hls(norsk, null, mixer, [], `output-${x}`);
    }
  }
}

async function rtp_source(
  norsk: Norsk,
  port: number,
  name: string
): Promise<SourceMediaNode> {
  let rtpInput: RtpInputSettings = {
    id: name,
    onError: (err) => console.log("RTP INGEST ERR", err),
    sourceName: "rtp1",
    streams: [
      {
        ip: "0.0.0.0",
        rtpPort: port,
        rtcpPort: port + 1,
        iface: "any",
        streamId: 1,
        streamType: {
          kind: "linearpcm",
          bitDepth: 24,
          sampleRate: 48000,
          channelLayout: new Array<ChannelName>(32).fill("unknown"),
        },
      },
    ],
  };
  return norsk.input.rtp(rtpInput);
}

async function matrix_mixer(
  norsk: Norsk,
  input: SourceMediaNode,
  name: string
) {
  // Matrix mixer, downmix to 5.1
  let channelGains = new Array(6).fill(0).map(() => new Array(32).fill(null));
  channelGains[0][0] = 0.0;
  channelGains[1][1] = 0.0;
  channelGains[2][2] = 0.0;
  channelGains[3][3] = 0.0;
  channelGains[4][4] = 0.0;
  channelGains[5][5] = 0.0;
  let matrixMixerSettings: AudioMatrixMixerSettings = {
    id: name,
    onError: (err) => console.log("MIXER ERROR", err),
    outputChannelLayout: "5.1",
    channelGains,
  };

  let matrixMixer = await norsk.processor.transform.audioMatrixMixer(
    matrixMixerSettings
  );
  matrixMixer.subscribe([{ source: input, sourceSelector: select_audio }]);
  return matrixMixer;
}
