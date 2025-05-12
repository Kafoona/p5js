// class Splash {

//  constructor() {
   
//   this.splashBorder = 100;
//   fill(255);
//   stroke(255, 0, 0)
//   rect(this.splashBorder, this.splashBorder, windowWidth-this.splashBorder*2, windowHeight-this.splashBorder*2);
//   // draw a rectangle like this in a 3D enviornment
//   // rect(this.splashBorder-(windowWidth/2), this.splashBorder-(windowHeight/2), windowWidth-this.splashBorder*2, windowHeight-this.splashBorder*2);
//   fill(0, 0, 222);
//   strokeWeight(3)
   
//   line(windowWidth-this.splashBorder-40, this.splashBorder+20,windowWidth-this.splashBorder-20, this.splashBorder+40)
//    line(windowWidth-this.splashBorder-20, this.splashBorder+20,windowWidth-this.splashBorder-40, this.splashBorder+40)
   
//   this.title = createDiv("My Project Title");
//   this.title.style('color:deeppink');
//   this.title.style('font-family: Arial, Helvetica, sans-serif');
//   this.title.position(this.splashBorder+20, this.splashBorder+20);
  
//   this.name = createDiv("My Name");
//   this.name.position(this.splashBorder+20, this.splashBorder+60);
  
//   this.info = createDiv("You can read a bunch of stuff about my project here because I've been working very hard in this class and I have so much to say about my project, the way it works, and why I made it. It's such an incredable joy to be coding in p5js and also so amazing to be learning from such a skilled teacher like Bryan Jacobs. <p> I could go on and on and on. <p> <a href=https://editor.p5js.org/bcjacobs/sketches/IhHSvjyZJ>view code</a>");
  
//   this.info.position(this.splashBorder+20, this.splashBorder+100);
//   this.info.size(windowWidth-this.splashBorder*2-50, windowHeight-this.splashBorder*2-50)
   

  
// }
  
//   update(){
//        if(mouseX > windowWidth-this.splashBorder-40 && 
//           mouseX < windowWidth-this.splashBorder-20 
//           && mouseY < this.splashBorder+40 
//           && mouseY > this.splashBorder+20
//      ){
//      return true
//    }
//   }
 
//   hide(){
//     this.title.remove()
//     this.name.remove()
//     this.info.remove()
//   }
// }

class Splash {
  constructor() {
    this.splashBorder = 100;
    fill(255);
    stroke(255, 0, 0);
    rect(this.splashBorder, this.splashBorder,
         windowWidth - this.splashBorder*2,
         windowHeight - this.splashBorder*2);
    stroke(0, 0, 222);
    strokeWeight(3);
    let x1 = windowWidth - this.splashBorder - 40,
        y1 = this.splashBorder + 20;
    line(x1, y1, x1+20, y1+20);
    line(x1+20, y1, x1, y1+20);
    noStroke();

    this.title = createDiv("Moog Synth Panel");
    this.title.style('color','deeppink');
    this.title.position(this.splashBorder+20, this.splashBorder+20);

    // create a div with an <a> inside
    this.info = createDiv(
      "Click anywhere to start calibration: Click the center of Drive, Output, Cutoff, and\nResonance knobs to calibrate" +
      "<p><a href='https://editor.p5js.org/Kafoona/sketches/ZjYr2nQzx' " +
      "target='_blank'>View Code</a>"
    );
    this.info.position(this.splashBorder+20, this.splashBorder+60);
    this.info.size(
      windowWidth - this.splashBorder*2 - 40,
      100
    );

    // grab the <a> element for hit‐testing
    this.linkElt = this.info.elt.querySelector('a');
  }

  update() {
    // if click was on the link itself, do NOT dismiss:
    if (this.linkElt) {
      const bb = this.linkElt.getBoundingClientRect();
      if (
        mouseX >= bb.left &&
        mouseX <= bb.right &&
        mouseY >= bb.top &&
        mouseY <= bb.bottom
      ) {
        return false;
      }
    }
    // elsewhere, dismiss on click:
    return true;
  }

  hide() {
    this.title.remove();
    this.info.remove();
  }
}
