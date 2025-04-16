let vars = [250, 250, 125, 125];
var counter = 0;
var currentTime = 0;

let triOsc;
let triEnv;

let tempo = 0;
let tempoSlider;
let button, mySelect;
let randFreq = 100;

let sets = [
  [300, 400, 500, 600],
  [300, 450, 500, 675]
];

let oscs = [];
let envs = [];
let index = 0;
let lastTime = 0;

let lastChordChange = 0; // Timer for chord (set) change
let currentSet = 0;

function setup() {
  createCanvas(700, 700);
  background(0);
  
  // GUI objects
  tempoSlider = createSlider(0, 300);
  tempoSlider.position(30, 30);
  
  button = createButton("random frequency");
  button.position(30, 60);
  button.mousePressed(doTheThing);
  
  fill(255);
  text("TEMPO", 170, 45);
  
  mySelect = createSelect();
  mySelect.position(30, 90);
  mySelect.option('triangle');
  mySelect.option('square');
  
  // First pattern oscillator & envelope
  triOsc = new p5.Oscillator('triangle');
  triOsc.freq(300);
  triOsc.amp(0);
  triOsc.start();
  
  triEnv = new p5.Envelope(0.01, 0.9, 0.1, 0);
  
  // Second pattern oscillators & envelopes
  for (let i = 0; i < sets[0].length; i++) {
    let osc = new p5.Oscillator('triangle');
    osc.freq(sets[0][i]);
    osc.amp(0);
    osc.start();
    oscs.push(osc);
    
    let env = new p5.Envelope(1.0, 0.1, 2, 2);
    envs.push(env);
  }
}

function draw() {
  tempo = tempoSlider.value();
  console.log(mySelect.selected());
  
  if (millis() > currentTime + vars[counter] - tempo) {
    currentTime = millis();
    counter++;
    triOsc.freq(randFreq);
    triEnv.play(triOsc);
    if (counter > 3) {
      counter = 0;
    }
  }
  
  // Second musical pattern: note triggering (delay mapped from tempo)
  let secondDelay = map(tempo, 0, 300, 300, 150);
  if (millis() - lastTime > secondDelay) {
    lastTime = millis();
    envs[index].play(oscs[index]);
    index = (index + 1) % oscs.length;
  }
  
  // Chord set alternation based on tempo:
 
  let chordChangeDelay = map(tempo, 0, 300, 2600, 100);
  if (millis() - lastChordChange > chordChangeDelay) {
    lastChordChange = millis();
    currentSet = (currentSet + 1) % sets.length;
    for (let i = 0; i < oscs.length; i++) {
      oscs[i].freq(sets[currentSet][i]);
    }
  }
}

function doTheThing() {
  console.log("pressed");
  randFreq = random(80, 400);
}
