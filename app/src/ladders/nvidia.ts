export default [
  {
    name: "high",
    width: 3840,
    height: 2160,
    gopLength: 48,
    rateControl: {
      mode: "vbr",
      averageBitrate: 10000000,
      maxBitrate: 10000000,
    },
    codec: {
      type: "nv-h264",
      idrInterval: 48
    },
  },
  {
    name: "medium",
    width: 1920,
    height: 1080,
    gopLength: 48,
    rateControl: {
      mode: "vbr",
      averageBitrate: 7000000,
      maxBitrate: 7000000,
    },
    codec: {
      type: "nv-hevc",
      idrInterval: 48
    },
  },
  {
    name: "low",
    width: 1280,
    height: 720,
    rateControl: {
      mode: "vbr",
      averageBitrate: 4000000,
      maxBitrate: 4000000,
    },
    gopLength: 48,
    codec: {
      type: "nv-hevc",
      idrInterval: 48
    },
  },
//  {
//    name: "software-high",
//    width: 1920,
//    height: 1080,
//    frameRate: { frames: 30, seconds: 1 },
//    codec: {
//      type: "x264",
//      bitrateMode: { value: 7000000, mode: "abr" },
//      keyFrameIntervalMax: 60,
//      keyFrameIntervalMin: 60,
//      bframes: 3,
//      sceneCut: 0,
//      profile: "high",
//      level: 4.1,
//      preset: "ultrafast",
//      tune: "zerolatency",
//    },
//  },
//  {
//    name: "software-medium",
//    width: 1280,
//    height: 720,
//    frameRate: { frames: 30, seconds: 1 },
//    codec: {
//      type: "x264",
//      bitrateMode: { value: 4000000, mode: "abr" },
//      keyFrameIntervalMax: 60,
//      keyFrameIntervalMin: 60,
//      bframes: 3,
//      sceneCut: 0,
//      profile: "high",
//      level: 4.1,
//      preset: "ultrafast",
//      tune: "zerolatency",
//    },
//  },
//  {
//    name: "software-low",
//    width: 960,
//    height: 540,
//    frameRate: { frames: 30, seconds: 1 },
//    codec: {
//      type: "x264",
//      bitrateMode: { value: 2000000, mode: "abr" },
//      keyFrameIntervalMax: 60,
//      keyFrameIntervalMin: 60,
//      bframes: 3,
//      sceneCut: 0,
//      profile: "high",
//      level: 4.1,
//      preset: "ultrafast",
//      tune: "zerolatency",
//    },
//  },
];
