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

// not sure if we need this
function sineToSquare(sineIn) {
  if(sineIn > 0) {
    return 1;
  } else {
    return -1;
  }
}

class OutputChannel {
  constructor() {
    this.sources = new Set();
  }

  addSource(source) {
    this.sources.add(source);
  }

  removeSource(source) {
    this.sources.delete(source);
  }

  // this simply adds all the sources
  raw() {
    return sources.reduce((sum, current) => sum + current.val(), 0);
  }

  // convert the sum of the sources to be between 0 and 255
  toByte() {
    return (((this.raw()/this.sources.length) + 1) / 2) * 255;
  }

}


class Oscillator {
  constructor(waveType, syncType, uiName) {
    // this.name = name; // invokes the setter
    this.fmSources = new Set();
    this.pmSources = new Set();
    this.waveType = "";
    this.setWave(waveType);
    this.syncType = "";
    this.setSync(syncType);
    //TODO: set this.freqSlider, this.fmSlider, and this.pmSlider correctly somehow!
    this.freqSliderVal = 1; //DEBUG FIXME
    this.fmSliderVal = 0; //DEBUG FIXME
    this.pmSliderVal = 0; //DEBUG FIXME
    this.primary = 0;
    this.secondary = 0;
    this.tertiary = 0;
    this.ui = new OscillatorUI(uiName);
  }

  updateFromUI() {
    this.freqSliderVal = Number(this.ui.freqSlider.value);
    this.fmSliderVal = Number(this.ui.fmSlider.value);
    this.pmSliderVal = Number(this.ui.pmSlider.value);
    this.routeToRedCheckbox = document.getElementById(`${this.baseName}-route-to-red`);
    this.routeToGreenCheckbox = document.getElementById(`${this.baseName}-route-to-green`);
    this.routeToBlueCheckbox = document.getElementById(`${this.baseName}-route-to-blue`);
  }

  // val() {
  // }

  setWave(type) {
    switch (type.toLowerCase()) {
      case 'sine':
        this.waveType = "sine";
        this.val = () => -Math.cos(this.primary * (this.freqSliderVal + this.secondary) + (this.tertiary * this.pmSliderVal));
        break;
      case 'triangle':
        this.waveType = "triangle";
        this.val = () => 2 / Math.PI * Math.asin(Math.sin(2 * Math.PI * this.primary * this.freqSliderVal / 9));
        break;
      case 'square':
        this.waveType = "square";
        this.val = () => Math.sign(-Math.cos(this.primary * (this.freqSliderVal + this.secondary) + (this.tertiary * this.pmSliderVal)));
        break;
      default:
        throw new SyntaxError("Invalid Oscillator wave type");
    }
  }

  setSync(type) {
    switch (type.toLowerCase()) {
      case 'h':
      case 'horizontal':
        this.syncType = "horizontal";
        // this.val = () => -Math.cos(lineNorm * this.freqSliderVal);
        this.primary = () => lineNorm;
        // this.primary = lineNorm;
        break;
      case 'v':
      case 'vertical':
        this.syncType = "vertical";
        // this.val = () => -Math.cos(columnNorm * this.freqSliderVal);
        this.primary = () => columnNorm;
        // this.primary = columnNorm;
        break;
      case 'f':
      case 'free':
        this.syncType = "free";
        // this.val = () => -Math.cos(free * this.freqSliderVal);
        this.primary = () => free;
        // this.primary = free;
        // interesting slider values for use with free: 1.58, 3.13, 6.24
        // They're all near powers of Pi (or powers of Pi/2) (or multiples of Pi or Pi/2?).
        // As the power/multiple goes up, the useable deviation from that value grows.
        // Around Pi, only deviations of up to +/-0.3 are interesting, but near 4*Pi you can go further.
        // TODO: Can I make a function to use with the free osc that gives more control near the multiples/powers of Pi? I'm thinking maybe an arctan or something?
        break;
      case 'l':
      case 'lfo':
        this.syncType = "lfo";
        //TODO: update the function too?
        break;
      default:
        throw new SyntaxError("Invalid Oscillator sync type");
    }
  }

  addFM(source) {
    this.fmSources.add(source);
  }

  removeFM(source) {
    this.fmSources.delete(source);
  }

  addPM(source) {
    this.pmSources.add(source);
  }

  removePM(source) {
    this.pmSources.delete(source);
  }

}


class OscillatorUI {
  constructor(baseName) {
    //TODO: Check basename before setting and throw error if it's bad
    this._baseName = baseName;
    // this.freqSlider = document.getElementById(`${this.baseName}FreqSlider`);
    this.freqSlider = document.getElementById(`${this.baseName}-freq-slider`);
    this.fmSlider =   document.getElementById(`${this.baseName}-fm-slider`);
    this.pmSlider =   document.getElementById(`${this.baseName}-pm-slider`);

    this.routeToRedCheckbox = document.getElementById(`${this.baseName}-route-to-red`);
    this.routeToGreenCheckbox = document.getElementById(`${this.baseName}-route-to-green`);
    this.routeToBlueCheckbox = document.getElementById(`${this.baseName}-route-to-blue`);

    this.routeToRed = 0; //TODO: This shouldn't be a UI property
    this.routeToGreen = 0; //TODO: This shouldn't be a UI property
    this.routeToBlue = 0; //TODO: This shouldn't be a UI property
    this.routeToRedCheckbox.addEventListener('change', (event) => { this.checkRouting(); })
    this.routeToGreenCheckbox.addEventListener('change', (event) => { this.checkRouting(); })
    this.routeToBlueCheckbox.addEventListener('change', (event) => { this.checkRouting(); })
    this.checkRouting();
  }

  //TODO: Since routeToRed, routeToGreen, and routeToBlue shouldn't be UI
  // properties, this should change them where they're actually supposed to be
  // (in other words, this function shouldn't be here, but with the oscillator obj or the routing obj
  checkRouting() {
    if (this.routeToRedCheckbox.checked) { this.routeToRed = 1; } else { this.routeToRed = 0; }
    if (this.routeToGreenCheckbox.checked) { this.routeToGreen = 1; } else { this.routeToGreen = 0; }
    if (this.routeToBlueCheckbox.checked) { this.routeToBlue = 1; } else { this.routeToBlue = 0; }
  }

  get baseName() {
    return this._baseName;
  }

}


const canvas = document.getElementById("screen");

let osc1ui = new OscillatorUI("osc1");
let osc2ui = new OscillatorUI("osc2");
let osc3ui = new OscillatorUI("osc3");

let lfo1slider =   document.getElementById('lfo1-freq-slider');
let lfo1AmpSlider = document.getElementById('lfo1-amp-slider');
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


// let osc4 = new Oscillator("sine", "horizontal");
// let osc1 = new Oscillator("sine", "horizontal");

let osc1 = () => -Math.cos(osc1primary * (osc1sliderVal + osc1secondary));
// let osc1 = {};
// let osc1.val = () => -Math.cos(osc1primary * (osc1sliderVal + osc1secondary));

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

    // osc1sliderVal = Number(osc1FreqSlider.value);
    osc1sliderVal = Number(osc1ui.freqSlider.value);
    osc2sliderVal = Number(osc2ui.freqSlider.value);
    osc3sliderVal = Number(osc3ui.freqSlider.value);
    // osc1PMSliderVal = Number(osc1PMSlider.value);
    osc1PMSliderVal = Number(osc1ui.pmSlider.value);
    osc2PMSliderVal = Number(osc2ui.pmSlider.value);
    osc3PMSliderVal = Number(osc3ui.pmSlider.value);
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
      // let osc1 = -Math.cos(osc1primary * (osc1sliderVal + osc1secondary));
      // this.val = () => -Math.cos(this.primary * (this.freqSlider + this.secondary) + (this.tertiary * osc3PMSliderVal));
      // let osc1 = () => -Math.cos(osc1primary * (osc1sliderVal + osc1secondary));

      osc2primary = lineNorm;
      // let osc2 = -Math.cos(osc2primary * (osc2sliderVal + osc2secondary));
      // p = 9 is pretty good, I guess
      // let osc2 = 2/Math.PI * Math.asin(Math.sin(2*Math.PI*osc2primary*osc2sliderVal/p));
      // Triangle wave!
      let osc2 = 2 / Math.PI * Math.asin(Math.sin(2 * Math.PI * osc2primary * osc2sliderVal / 9));

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
      // let red = ((osc1 * osc1RouteToRed) + (osc2 * osc2RouteToRed) + (osc3 * osc3RouteToRed))/(osc1RouteToRed + osc2RouteToRed + osc3RouteToRed);
      let red = ((osc1() * osc1ui.routeToRed) + (osc2 * osc2ui.routeToRed) + (osc3 * osc3ui.routeToRed))/(osc1ui.routeToRed + osc2ui.routeToRed + osc3ui.routeToRed);
      let green = ((osc1() * osc1ui.routeToGreen) + (osc2 * osc2ui.routeToGreen) + (osc3 * osc3ui.routeToGreen))/(osc1ui.routeToGreen + osc2ui.routeToGreen + osc3ui.routeToGreen);
      let blue = ((osc1() * osc1ui.routeToBlue) + (osc2 * osc2ui.routeToBlue) + (osc3 * osc3ui.routeToBlue))/(osc1ui.routeToBlue + osc2ui.routeToBlue + osc3ui.routeToBlue);
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
// checkRouting();
window.requestAnimationFrame(draw);
//window.requestAnimationFrame(draw); // calls it every frame (note: same line should be uncommented in draw() also!
//let nIntervId = setInterval(draw, 100); // calls it every specified interval

