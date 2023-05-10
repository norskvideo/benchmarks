
import { VideoEncodeLadderRung } from "@id3asnorsk/norsk-sdk";


export default [
  ({
    name: "high",
    width: 1280,
    height: 720,
    frameRate: { frames: 25, seconds: 1 },
    codec: {
      type: "x264",
      bitrateMode: { value: 8000000, mode: "abr" },
      keyFrameIntervalMax: 50,
      keyFrameIntervalMin: 50,
      bframes: 0,
      sceneCut: 0,
      profile: "high",
      level: 4.1,
      preset: "veryfast",
      tune: "zerolatency",
    },
  }),
  ({
    name: "medium",
    width: 320,
    height: 240,
    frameRate: { frames: 25, seconds: 1 },
    codec: {
      type: "x264",
      bitrateMode: { value: 250000, mode: "abr" },
      keyFrameIntervalMax: 50,
      keyFrameIntervalMin: 50,
      bframes: 0,
      sceneCut: 0,
      tune: "zerolatency",
    },
  }),
  ({
    name: "low",
    width: 160,
    height: 120,
    frameRate: { frames: 25, seconds: 1 },
    codec: {
      type: "x264",
      bitrateMode: { value: 150000, mode: "abr" },
      keyFrameIntervalMax: 50,
      keyFrameIntervalMin: 50,
      bframes: 0,
      sceneCut: 0,
      tune: "zerolatency",
    },
  }),
] as VideoEncodeLadderRung[];
