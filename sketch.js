
let panelImg;
const labels = ['Drive','Output','Cutoff','Resonance'];

// Splash flag
let splash = true;

// Knob & calibration state
let calibrationStep = 0;
let knobCenters = [];
let knobImgs = [];
let knobAngles = [0,0,0,0];
let knobOffsets = [0,0,0,0];
let draggingKnob = -1;

const knobW       = 150;
const marginSmall = 30;  // for Drive, Output, Resonance
const marginLarge = 80;  // for Cutoff
let knobDs = [], knobMs = [];

// Audio nodes
let osc, filterLP, driveFX, outputGain;

// “View Code” link
let codeLink;

function preload(){
  panelImg = loadImage('Moog ladder filter module.webp');
}

// Random-pitch scheduler
function scheduleRandomPitch() {
  let newFreq = random(200, 1200);
  let glide   = random(0.1, 0.5);
  osc.freq(newFreq, glide);
  setTimeout(scheduleRandomPitch, random(200, 1500));
}

function setup(){
  createCanvas(panelImg.width, panelImg.height);
  textFont('monospace');
  textAlign(CENTER, CENTER);
  imageMode(CORNER);

  // Prepare audio graph (don’t start yet)
  osc        = new p5.Oscillator('sawtooth');
  filterLP   = new p5.LowPass();
  driveFX    = new p5.Distortion();
  outputGain = new p5.Gain();
  osc.disconnect();
  osc.connect(filterLP);
  filterLP.disconnect();
  driveFX.process(filterLP, 0, '4x');
  driveFX.connect(outputGain);
  outputGain.connect();

  // Create the “View Code” link centered under the overlay text
  codeLink = createA(
    'https://editor.p5js.org/Kafoona/sketches/ZjYr2nQzx',
    'View Code',
    '_blank'
  );
  codeLink.style('font-size','16px');
  codeLink.position(
    width/2 - codeLink.elt.offsetWidth/2,
    height/2 + 45
  );
  // Prevent clicking the link from dismissing the splash
  codeLink.elt.addEventListener('mousedown', e => e.stopPropagation());
}

function draw(){
  background(30);
  image(panelImg, 0, 0);

  // 1) Info overlay
  if (splash){
    noStroke();
    fill(0, 200);
    rect(0, 0, width, height);

    fill(255);
    textSize(30);
    text(
      "Moog Synth Panel\nClick anywhere to start calibration\n calibrate by Clicking in order the center of Drive, Output,\n Cutoff, and Resonance knobs",
      width/2, height/2 - 20
    );

    // link is visible automatically
    return;
  }

  // 2) Calibration mode
  if (calibrationStep < 4){
    fill(255);
    textSize(20);
    text(
      `Click the CENTER of the ${labels[calibrationStep]} knob`,
      width/2, 30
    );
    stroke(255,0,0);
    line(mouseX-10, mouseY, mouseX+10, mouseY);
    line(mouseX, mouseY-10, mouseX, mouseY+10);
    noStroke();
    return;
  }

  // 3) Crop knobs once
  if (knobImgs.length === 0){
    for (let i = 0; i < 4; i++){
      let m = (i === 2 ? marginLarge : marginSmall);
      let d = knobW + m*2;
      knobMs[i] = m;
      knobDs[i] = d;
      let c = knobCenters[i];
      knobImgs[i] = panelImg.get(
        c.x - d/2, c.y - d/2,
        d, d
      );
    }
  }

  // 4) Draw & update knobs
  for (let i = 0; i < 4; i++){
    let { x, y } = knobCenters[i], d = knobDs[i];

    if (draggingKnob === i){
      let a = atan2(mouseY - y, mouseX - x);
      knobAngles[i] = constrain(a - knobOffsets[i], -0.75*PI, 0.75*PI);
    }

    push();
      translate(x, y);
      rotate(knobAngles[i]);
      imageMode(CENTER);
      image(knobImgs[i], 0, 0, d, d);
    pop();

    push();
      translate(x, y);
      rotate(knobAngles[i]);
      stroke(255,0,0);
      strokeWeight(3);
      line(0, -knobW/2, 0, -knobW/2 + 15);
      noStroke();
    pop();
  }

  // 5) Map to audio
  const norm = a => map(a, -0.75*PI, 0.75*PI, 0, 1, true);
  let drvVal    = norm(knobAngles[0]) * 0.9;
  let outVal    = norm(knobAngles[1]);
  let cutoffVal = lerp(100, 15000, norm(knobAngles[2]));
  let resVal    = lerp(0.1, 40, norm(knobAngles[3]));
  let jit       = map(noise(millis()*0.002), 0, 1, -10, 10);

  driveFX.process(filterLP, drvVal, '4x');
  outputGain.amp(outVal);
  filterLP.freq(constrain(cutoffVal + jit, 100, 15000));
  filterLP.res(resVal);
}

function mousePressed(){
  // Dismiss splash on any click *except* on the link (that’s blocked already)
  if (splash){
    splash = false;
    codeLink.hide();
    userStartAudio();
    osc.start();
    scheduleRandomPitch();
    return;
  }

  // Calibration clicks
  if (calibrationStep < 4){
    knobCenters.push({ x: mouseX, y: mouseY });
    calibrationStep++;
    return;
  }

  // Start dragging a knob
  for (let i = 0; i < 4; i++){
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

