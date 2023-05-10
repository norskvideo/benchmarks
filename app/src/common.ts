import {
  Norsk,
  audioStreamKeys,
  videoStreamKeys,
  SrtInputSettings,
  SourceMediaNode,
  PinToKey,
  StreamMetadata,
  VideoEncodeLadderRung,
} from "@id3asnorsk/norsk-sdk";

export function base_url(port: number): string {
  let url = `${process.env.NORSK_HOST || "localhost"}:${port}`;
  console.log(`connecting to ${url}`);
  return url;
}

export async function create_norsk(port: number): Promise<Norsk> {
  return await Norsk.connect({
    url: base_url(port),
    onShutdown: () => {
      console.log("Norsk has shutdown");
      process.exit(1)
    }
  });
}

export async function srt_source(norsk: Norsk, port: number, sourceName: string) {
  let settings: SrtInputSettings = {
    id: `srt_input-${sourceName}`,
    ip: "0.0.0.0",
    port: port,
    mode: "listener",
    sourceName
  };
  return norsk.input.srt(settings);
}


export async function normalise_input(norsk: Norsk, input: SourceMediaNode, sourceName: string) {
  let videoStreamKeyConfig = {
    id: `video_stream_key-${sourceName}`,
    streamKey: { programNumber: 1, renditionName: "video", streamId: 256, sourceName }
  };

  let audioStreamKeyConfig = {
    id: `audio_stream_key-${sourceName}`,
    streamKey: { programNumber: 1, renditionName: "audio", streamId: 257, sourceName }
  };

  let videoInput = await norsk.processor.transform.streamKeyOverride(videoStreamKeyConfig);
  let audioInput = await norsk.processor.transform.streamKeyOverride(audioStreamKeyConfig);

  videoInput.subscribe([{ source: input, sourceSelector: select_video }]);
  audioInput.subscribe([{ source: input, sourceSelector: select_audio }]);

  return {
    video: videoInput
  , audio: audioInput
  };
}


export function ladder_item(desiredRendition: string) {
  return (streams: StreamMetadata[]) => {
    const video = videoStreamKeys(streams);
    if (video.length == streams.length) {
      return video.filter(
        (k) => k.renditionName == desiredRendition
      );
    }
    return [];
  };
}

export async function transcode(norsk: Norsk, input: SourceMediaNode, rungs: VideoEncodeLadderRung[], name: string) {
  let ladder = await norsk.processor.transform.videoEncodeLadder({
    id: `ladder-${name}`,
    rungs,
  });
  ladder.subscribe([{ source: input, sourceSelector: select_video }]);
  return ladder;
}

export async function local_hls(norsk: Norsk, video: SourceMediaNode | null, audio: SourceMediaNode, streams: VideoEncodeLadderRung[], name: string) {
  let delayOutputMs = 500.0;
  let masterPlaylistSettings = { id: `master-${name}`, playlistName: `master-${name}`, destinations: [{ type: "local" as const, retentionPeriodSeconds: 60 }] };
  let masterOutput = await norsk.output.hlsMaster(masterPlaylistSettings);

  let hlsVideoSettings = streams.map((s) => {
    return {
      id: `video-${s.name}-${name}`,
      partDurationSeconds: 1.0,
      segmentDurationSeconds: 4.0,
      delayOutputMs,
      destinations: [],
    };
  });

  let hlsAudioSettings = {
    id: `audio-${name}`,
    partDurationSeconds: 1.0,
    segmentDurationSeconds: 4.0,
    delayOutputMs,
    destinations: [{ type: "local" as const, retentionPeriodSeconds: 60 }],
  };

  if (video) {
    let videoOutputs = await Promise.all(hlsVideoSettings
      .map((v, i) => { return { v, s: streams[i] }; }) // lol, js doesn't have a 'zip'? wtf
      .map(async ({ v, s }) => {


        let videoStreamKeyConfig = {
          id: `output-video-${name}-${s.name}`,
          streamKey: { programNumber: 1, renditionName: `${name}-${s.name}`, streamId: 256, sourceName: name }
        };

        let mappedVideo = await norsk.processor.transform.streamKeyOverride(videoStreamKeyConfig);
        mappedVideo.subscribe([
          { source: video, sourceSelector: ladder_item(`${s.name}`) },
        ]);

        let node = await norsk.output.hlsVideo(v);
        node.subscribe([
          { source: mappedVideo, sourceSelector: select_video },
        ]);
        return node;
      }));
  }

  let audioOutput = await norsk.output.hlsAudio(hlsAudioSettings);

  audioOutput.subscribe([
    { source: audio, sourceSelector: select_audio },
  ]);

  masterOutput.subscribe(
    (video ? hlsVideoSettings.map((v) => { return { source: video, sourceSelector: ladder_item(v.id) }; }) : []).concat(
      [
        { source: audio, sourceSelector: select_audio },
      ]));
}

export function video_to_pin<Pins extends string>(pin: Pins) {
  return (streams: StreamMetadata[]): PinToKey<Pins> => {
    const video = videoStreamKeys(streams);
    if (video.length == 1) {
      // I want to do this, but it loses the types
      //       return { [pin]: video };
      let o: PinToKey<Pins> = {};
      o[pin] = video;
      return o;
    }
    return undefined;
  };
};


export function select_video(streams: StreamMetadata[]) {
  return videoStreamKeys(streams);
}

export function select_audio(streams: StreamMetadata[]) {
  return audioStreamKeys(streams);
}
