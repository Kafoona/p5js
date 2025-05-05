
let panelImg;
const labels = ['Drive','Output','Cutoff','Resonance'];
let splash = true;            // info splash overlay
let calibrationStep = 0;      // counts 0…4
let knobCenters = [];         // will hold {x,y} for each knob
let knobImgs = [];            // the cropped knob images
let knobAngles = [0,0,0,0];
let knobOffsets = [0,0,0,0];
let draggingKnob = -1;

const knobW       = 150;
const marginSmall = 30;       // for Drive, Output, Resonance
const marginLarge = 80;       // for Cutoff
let knobDs        = [];       // actual crop size per knob
let knobMs        = [];       // margin per knob

// — Audio Nodes —
let osc, filterLP, driveFX, outputGain;

function preload(){
  panelImg = loadImage('Moog ladder filter module.webp');
}

// — Random-pitch scheduler —
function scheduleRandomPitch() {

  let newFreq = random(200, 1200);

  let glide   = random(0.1, 0.5);

  osc.freq(newFreq, glide);
  // schedule next change after 500–1500 ms
  setTimeout(scheduleRandomPitch, random(200, 1500));
}

function setup(){
  createCanvas(panelImg.width, panelImg.height);
  textFont('monospace');
  textAlign(CENTER, CENTER);
  imageMode(CORNER);

  // Audio setup
  osc        = new p5.Oscillator('sawtooth');
  filterLP   = new p5.LowPass();
  driveFX    = new p5.Distortion();
  outputGain = new p5.Gain();

  // start oscillator
  osc.start();
  // begin wandering pitch
  scheduleRandomPitch();

  // route osc → filter → drive → gain → master
  osc.disconnect();
  osc.connect(filterLP);
  filterLP.disconnect();
  driveFX.process(filterLP, 0, '4x');
  driveFX.connect(outputGain);
  outputGain.connect();
}

function draw(){
  background(30);
  image(panelImg, 0, 0);

  // 1) Show splash overlay
  if (splash){
    noStroke();
    fill(0, 200);
    rect(0, 0, width, height);
    fill(255);
    textSize(35);
    text("Moog Synth Panel\nClick the center of Drive, Output, Cutoff, and\nResonance knobs to calibrate", width/2, height/2);
    return;
  }

  // 2) Calibration mode
  if (calibrationStep < 4){
    fill(255);
    textSize(20);
    text(`Click the CENTER of the ${labels[calibrationStep]} knob`, width/2, 30);
    stroke(255,0,0);
    line(mouseX-10, mouseY, mouseX+10, mouseY);
    line(mouseX, mouseY-10, mouseX, mouseY+10);
    noStroke();
    return;
  }

  // 3) Crop each knob once using per-knob margins
  if (knobImgs.length === 0){
    for (let i = 0; i < knobCenters.length; i++){
      let m = (i === 2 ? marginLarge : marginSmall);
      let d = knobW + m*2;
      knobMs[i] = m;
      knobDs[i] = d;
      let c = knobCenters[i];
      knobImgs[i] = panelImg.get(
        c.x - d/2,
        c.y - d/2,
        d, d
      );
    }
  }

  // 4) Draw & update each knob
  for (let i = 0; i < knobCenters.length; i++){
    let { x, y } = knobCenters[i];
    let d = knobDs[i];

    // update rotation if dragging
    if (draggingKnob === i){
      let a = atan2(mouseY - y, mouseX - x);
      knobAngles[i] = constrain(a - knobOffsets[i], -0.75*PI, 0.75*PI);
    }

    // draw the rotated knob image
    push();
      translate(x, y);
      rotate(knobAngles[i]);
      imageMode(CENTER);
      image(knobImgs[i], 0, 0, d, d);
    pop();

    // red marker at true knob radius (–knobW/2)
    push();
      translate(x, y);
      rotate(knobAngles[i]);
      stroke(255,0,0);
      strokeWeight(3);
      let markerY = -knobW/2;
      line(0, markerY, 0, markerY + 15);
      noStroke();
    pop();
  }

  // 5) Map knobAngles → audio parameters
  const norm = a => map(a, -0.75*PI, 0.75*PI, 0, 1, true);
  let drvVal    = norm(knobAngles[0]) * 0.9;
  let outVal    = norm(knobAngles[1]) * 1.0;
  let cutoffVal = lerp(100, 15000, norm(knobAngles[2]));
  let resVal    = lerp(0.1, 40, norm(knobAngles[3]));


  let jit = map(noise(millis()*0.002), 0, 1, -10, 10);

  driveFX.process(filterLP, drvVal, '4x');
  outputGain.amp(outVal);
  filterLP.freq(constrain(cutoffVal + jit, 100, 15000));
  filterLP.res(resVal);
}

function mousePressed(){

  if (splash){
    splash = false;
    return;
  }

  if (calibrationStep < labels.length){
    knobCenters.push({ x: mouseX, y: mouseY });
    calibrationStep++;
    return;
  }

  for (let i = 0; i < knobCenters.length; i++){
    let { x, y } = knobCenters[i];
    if (dist(mouseX, mouseY, x, y) < knobDs[i]/2){
      draggingKnob = i;
      let a = atan2(mouseY - y, mouseX - x);
      knobOffsets[i] = a - knobAngles[i];
      break;
    }
  }
}

function mouseReleased(){
  draggingKnob = -1;
}
