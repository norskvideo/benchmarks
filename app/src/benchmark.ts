import fs from "fs";
import yargs from "yargs";
import transcode from './transcode'
import compose from './compose'
import mixer from './mixer'

yargs
  .command(transcode)
  .command(compose)
  .command(mixer)
  .parse();

