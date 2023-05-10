
import high_ultrafast from './high-ultrafast'
import nvidia from './nvidia'
import local from './local'


import {
  VideoEncodeLadderRung
} from "@id3asnorsk/norsk-sdk";

interface Ladder {
  [key: string]: VideoEncodeLadderRung[] 
}

let ladder: Ladder = {
  "high-ultrafast": high_ultrafast as VideoEncodeLadderRung[],
  "nvidia": nvidia as VideoEncodeLadderRung[],
  "local": local as VideoEncodeLadderRung[],
}


export default ladder;
