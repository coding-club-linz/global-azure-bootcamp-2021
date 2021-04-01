//import { svg2png } from 'svg-png-converter'
const { svg2png } = require('svg-png-converter');
const fs = require('fs');
 
transform();

async function transform() {
  let outputBuffer = await svg2png({ 
    input: fs.readFileSync('./../youtube-thumbnails/azure-ama.svg'), 
    encoding: 'buffer', 
    format: 'png',
  })

  fs.writeFileSync("../youtube-thumbnails/images/azure-ama.png", outputBuffer);
}