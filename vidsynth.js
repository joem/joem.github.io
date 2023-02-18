let frameCount = 0;
let lastFrameTime = 0;

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Convert from the 0 to +1 range to the 0 to 255 range
function unitValToColorRange(unitValue) {
  return unitValue * 255;
}
// Convert from the -1 to +1 range to the 0 to 255 range
function BPUnitValToColorRange(unitValue) {
  return ((unitValue + 1) / 2) * 255;
}

function checkRouting() {
  //TODO: Have this iterate over a list of routing instead of having to do it all explicitly
  if (osc1RouteToRedCheckbox.checked) { osc1RouteToRed = 1; } else { osc1RouteToRed = 0; }
  if (osc2RouteToRedCheckbox.checked) { osc2RouteToRed = 1; } else { osc2RouteToRed = 0; }
  if (osc3RouteToRedCheckbox.checked) { osc3RouteToRed = 1; } else { osc3RouteToRed = 0; }
  if (osc1RouteToGreenCheckbox.checked) { osc1RouteToGreen = 1; } else { osc1RouteToGreen = 0; }
  if (osc2RouteToGreenCheckbox.checked) { osc2RouteToGreen = 1; } else { osc2RouteToGreen = 0; }
  if (osc3RouteToGreenCheckbox.checked) { osc3RouteToGreen = 1; } else { osc3RouteToGreen = 0; }
  if (osc1RouteToBlueCheckbox.checked) { osc1RouteToBlue = 1; } else { osc1RouteToBlue = 0; }
  if (osc2RouteToBlueCheckbox.checked) { osc2RouteToBlue = 1; } else { osc2RouteToBlue = 0; }
  if (osc3RouteToBlueCheckbox.checked) { osc3RouteToBlue = 1; } else { osc3RouteToBlue = 0; }
}

const canvas = document.getElementById("screen");

let osc1FreqSlider = document.getElementById('osc1FreqSlider');
let osc1FMSlider =   document.getElementById('osc1FMSlider');
let osc1PMSlider =   document.getElementById('osc1PMSlider');
let osc1RouteToRedCheckbox = document.getElementById('osc1RouteToRed');
let osc1RouteToRed;
osc1RouteToRedCheckbox.addEventListener('change', (event) => { checkRouting(); })
let osc1RouteToGreenCheckbox = document.getElementById('osc1RouteToGreen');
let osc1RouteToGreen;
osc1RouteToGreenCheckbox.addEventListener('change', (event) => { checkRouting(); })
let osc1RouteToBlueCheckbox = document.getElementById('osc1RouteToBlue');
let osc1RouteToBlue;
osc1RouteToBlueCheckbox.addEventListener('change', (event) => { checkRouting(); })

let osc2FreqSlider =   document.getElementById('osc2FreqSlider');
let osc2FMSlider = document.getElementById('osc2FMSlider');
let osc2PMSlider = document.getElementById('osc2PMSlider');
let osc2RouteToRedCheckbox = document.getElementById('osc2RouteToRed');
let osc2RouteToRed;
osc2RouteToRedCheckbox.addEventListener('change', (event) => { checkRouting(); })
let osc2RouteToGreenCheckbox = document.getElementById('osc2RouteToGreen');
let osc2RouteToGreen;
osc2RouteToGreenCheckbox.addEventListener('change', (event) => { checkRouting(); })
let osc2RouteToBlueCheckbox = document.getElementById('osc2RouteToBlue');
let osc2RouteToBlue;
osc2RouteToBlueCheckbox.addEventListener('change', (event) => { checkRouting(); })

let osc3FreqSlider =   document.getElementById('osc3FreqSlider');
let osc3FMSlider = document.getElementById('osc3FMSlider');
let osc3PMSlider = document.getElementById('osc3PMSlider');
let osc3RouteToRedCheckbox = document.getElementById('osc3RouteToRed');
let osc3RouteToRed;
osc3RouteToRedCheckbox.addEventListener('change', (event) => { checkRouting(); })
let osc3RouteToGreenCheckbox = document.getElementById('osc3RouteToGreen');
let osc3RouteToGreen;
osc3RouteToGreenCheckbox.addEventListener('change', (event) => { checkRouting(); })
let osc3RouteToBlueCheckbox = document.getElementById('osc3RouteToBlue');
let osc3RouteToBlue;
osc3RouteToBlueCheckbox.addEventListener('change', (event) => { checkRouting(); })

let lfo1slider =   document.getElementById('lfo1slider');
let lfo1AmpSlider = document.getElementById('lfo1AmpSlider');
let osc1sliderVal;
let osc2sliderVal;
let osc3sliderVal;
let osc1PMSliderVal;
let osc2PMSliderVal;
let osc3PMSliderVal;
let lfo1sliderVal;
let lfo1AmpSliderVal;
const WIDTH = 400;
const HEIGHT = 300;
let lfo1;
let sBuffer = new Array(WIDTH*HEIGHT*4);
let imageData;
let osc1primary = 0;
let osc1secondary = 0;
let osc2primary = 0;
let osc2secondary = 0;
let osc3primary = 0;
let osc3secondary = 0;
let osc3tertiary = 0;

//function draw() {
function draw(elapsedTime) {
  // const canvas = document.getElementById("screen");
  if (canvas.getContext) {
    // calculate the delta since the last frame
    var delta = elapsedTime - (lastFrameTime || 0);
    // queue up an rAF draw call
    window.requestAnimationFrame(draw);
    // if we don't already have a first frame, and the delta is less
    // than 33ms (30fps in this case) then don't do anything and return
    if (lastFrameTime && delta < 33) {
      return;
    }
    // else we have a frame we want to draw at 30fps...
    // capture last frame draw time so we can work out a delta next time.
    lastFrameTime = elapsedTime;
    // now do the frame update and render work below

    // const ctx = canvas.getContext("2d");
    const ctx = canvas.getContext("2d", { alpha: false }); // no alpha makes it a little faster

    osc1sliderVal = Number(osc1FreqSlider.value);
    osc2sliderVal = Number(osc2FreqSlider.value);
    osc3sliderVal = Number(osc3FreqSlider.value);
    osc1PMSliderVal = Number(osc1PMSlider.value);
    osc2PMSliderVal = Number(osc2PMSlider.value);
    osc3PMSliderVal = Number(osc3PMSlider.value);
    lfo1sliderVal = Number(lfo1slider.value);
    lfo1AmpSliderVal = Number(lfo1AmpSlider.value);
    lfo1 = -Math.cos(frameCount * lfo1sliderVal * 2 * Math.PI / 60) * lfo1AmpSliderVal; // lfo at 1 Hz

    imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    sBuffer = imageData.data;

    //TODO: Make the osc values calc'd using functions!
    //      - pass them the ramps (and/or index?) and let them calc it that way
    //      - or is there some anonymous function thing that would work? feels like maybe?

    //TODO: add controls for offsetting the values up or down (to adjust the width of bars)
    //TODO: add the phase controls
    //TODO: make the routing work (and mixing)
    //TODO: Turn routing into a matrix mixer, so you can set amounts!
    //TODO: make FM'ing work
    //TODO: add more oscillators?
    //TODO: make the oscillators instances (classes, prototypes, whatever...)
    //TODO: figure out scrolling oscillators
    //TODO: make the sync changeable on the fly
    //TODO: make it work full-browser with the controls on top, like hydra
    //TODO: add LFOs that can modulate things over time
    //TODO: Add other waveforms, in particular triangle wave
    //TODO: Maybe add a dedicated modulator per oscillator?
    for (var index=0; index<WIDTH*HEIGHT*4; index+=4) {
      // Calculate the values used by the oscillators
      //sBuffer[i] = 0;
      let line = Math.floor((index) / (WIDTH * 4.0)); // from 0 to WIDTH
      let vRamp = line / HEIGHT; // from 0 to 1 //TODO: Make this go from -1 to +1 ???
      //let lineNorm = 2 * Math.PI * line / HEIGHT; // normalized from 0 to 2*Pi
      let lineNorm = 2 * Math.PI * vRamp; // normalized from 0 to 2*Pi
      let column = (index / 4) % WIDTH; // from 0 to HEIGHT
      let hRamp = column / WIDTH; // 0 to 1 //TODO: Make this go from -1 to +1 ???
      //let columnNorm = 2 * Math.PI * column / WIDTH; // normalized from 0 to 2*Pi
      let columnNorm = 2 * Math.PI * hRamp; // normalized from 0 to 2*Pi
      let free = index/400.0;

      // Calculate the oscillators

      osc1primary = columnNorm;
      osc1secondary = lfo1;
      let osc1 = -Math.cos(osc1primary * (osc1sliderVal + osc1secondary));

      osc2primary = lineNorm;
      let osc2 = -Math.cos(osc2primary * (osc2sliderVal + osc2secondary));
      osc3primary = columnNorm;
      osc3tertiary = osc2;
      //let osc3 = -Math.cos(osc3primary * (osc3sliderVal + osc3secondary));
      let osc3 = -Math.cos(osc3primary * (osc3sliderVal + osc3secondary) + (osc3tertiary * osc3PMSliderVal));

      //   `f(x) = a * sin(b * (x + c)) + d`
      //   a ampl
      //   b freq
      //   c phase
      //   d vertical shift

      // let vOsc1 = -Math.cos(columnNorm * osc1sliderVal);
      // let vOsc1fm = -Math.cos(columnNorm * (osc1sliderVal + lfo1));
      // let hOsc1 = -Math.cos(lineNorm * osc1sliderVal);
      // let hOsc1fm = -Math.cos(lineNorm * (osc1sliderVal + lfo1));
      // let hrOsc1 = ((index * osc1sliderVal / 4) % WIDTH) / WIDTH; //TODO fix this?
      //let freeOsc1 = -Math.cos(free * (osc1sliderVal/Math.PI));
      let freeOsc1 = -Math.cos(free * osc1sliderVal);
      //let freeOsc1 = -Math.cos(free * (4 * Math.PI - 0.2));
      // interesting slider values for use with free: 1.58, 3.13, 6.24
      // They're all near powers of Pi (or powers of Pi/2) (or multiples of Pi or Pi/2?).
      // As the power/multiple goes up, the useable deviation from that value grows.
      // Around Pi, only deviations of up to +/-0.3 are interesting, but near 4*Pi you can go further.
      // TODO: Can I make a function to use with the free osc that gives more control near the multiples/powers of Pi? I'm thinking maybe an arctan or something?
      //let vOsc2 = -Math.cos(columnNorm * osc2sliderVal);
      //let hOsc2 = -Math.cos(lineNorm * osc2sliderVal);
      //let vOsc3 = -Math.cos(columnNorm * osc3sliderVal);
      //let vOsc3 = (vOsc1 * hOsc2) / 2; // interesting!
      //let vOsc3 = (vOsc1 + hOsc2) / 2; // interesting!
      //let vOsc3 = -Math.cos(columnNorm * osc3sliderVal + (hOsc2*4)); // phase modulating!
      //let hOsc3 = -Math.cos(lineNorm * osc3sliderVal);

      // Fill the canvas
      let red = ((osc1 * osc1RouteToRed) + (osc2 * osc2RouteToRed) + (osc3 * osc3RouteToRed))/(osc1RouteToRed + osc2RouteToRed + osc3RouteToRed);
      let green = ((osc1 * osc1RouteToGreen) + (osc2 * osc2RouteToGreen) + (osc3 * osc3RouteToGreen))/(osc1RouteToGreen + osc2RouteToGreen + osc3RouteToGreen);
      let blue = ((osc1 * osc1RouteToBlue) + (osc2 * osc2RouteToBlue) + (osc3 * osc3RouteToBlue))/(osc1RouteToBlue + osc2RouteToBlue + osc3RouteToBlue);
      //sBuffer[index+0] = BPUnitValToColorRange(vOsc1); // red
      //sBuffer[index+0] = BPUnitValToColorRange(vOsc1fm); // red
      //sBuffer[index+0] = BPUnitValToColorRange(osc1); // red
      sBuffer[index+0] = BPUnitValToColorRange(red); // red
      //sBuffer[index+0] = BPUnitValToColorRange(freeOsc1); // red
      //sBuffer[index+0] = BPUnitValToColorRange(lfo1); // red
      //sBuffer[index+0] = unitValToColorRange(hRamp); // red //TODO: Figure out better way to handle
      //sBuffer[index+1] = BPUnitValToColorRange(hOsc2); // green
      //sBuffer[index+1] = BPUnitValToColorRange(osc2); // green
      sBuffer[index+1] = BPUnitValToColorRange(green); // green
      //sBuffer[index+2] = BPUnitValToColorRange(vOsc3); // blue
      //sBuffer[index+2] = BPUnitValToColorRange(osc3); // blue
      sBuffer[index+2] = BPUnitValToColorRange(blue); // blue
      sBuffer[index+3] = 255; // alpha
    }

    ctx.putImageData(imageData, 0, 0);
  }
  frameCount++;
  //console.log(frameCount); //DEBUG
}

//draw(); // calls it once
checkRouting();
window.requestAnimationFrame(draw);
//window.requestAnimationFrame(draw); // calls it every frame (note: same line should be uncommented in draw() also!
//let nIntervId = setInterval(draw, 100); // calls it every specified interval

