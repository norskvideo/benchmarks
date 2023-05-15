interface Ladder {
  [key: string]: VideoEncodeLadderRung[] 
}

const ladder: Ladder = {};

require('fs')
  .readdirSync(__dirname)
  .forEach((file: string) => {
    const name = file.replace(/\.js$/, '');
    if(name == 'index.js') { return; }
    if(name.endsWith(".d.ts")) { return; }
    if(name.endsWith(".map")) { return; }
    ladder[name] = require(`./${file}`).default;
  });

import {
  VideoEncodeLadderRung
} from "@norskvideo/norsk-sdk";


export default ladder;
