export default [
  {
    name: "high",
    width: 3840,
    height: 2160,
    frameRate: { frames: 30, seconds: 1 },
    codec: {
      type: "x264",
      bitrateMode: { value: 20000000, mode: "abr" },
      keyFrameIntervalMax: 60,
      keyFrameIntervalMin: 60,
      bframes: 0,
      sceneCut: 0,
      profile: "main",
      level: 4.1,
      preset: "ultrafast",
      tune: "zerolatency",
      threads: 5
    },
  },
  {
    name: "medium",
    width: 1920,
    height: 1080,
    frameRate: { frames: 30, seconds: 1 },
    codec: {
      type: "x264",
      bitrateMode: { value: 7000000, mode: "abr" },
      keyFrameIntervalMax: 60,
      keyFrameIntervalMin: 60,
      bframes: 0,
      sceneCut: 0,
      profile: "main",
      level: 4.1,
      preset: "ultrafast",
      tune: "zerolatency",
      threads: 5
    },
  },
  {
    name: "low",
    width: 1280,
    height: 720,
    frameRate: { frames: 30, seconds: 1 },
    codec: {
      type: "x264",
      bitrateMode: { value: 4000000, mode: "abr" },
      keyFrameIntervalMax: 60,
      keyFrameIntervalMin: 60,
      bframes: 0,
      sceneCut: 0,
      profile: "main",
      level: 4.1,
      preset: "ultrafast",
      tune: "zerolatency",
      threads: 5
    },
  },
];

