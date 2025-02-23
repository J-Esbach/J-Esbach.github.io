class MünzenItem {
  constructor({x, y}) {
    this.radius = 10;
    this.radius2 = this.radius/1.5;
    this.rounded = 5;
    this.pointR = Math.sqrt( (-10 * -10) + (-10 * -10) ); 
    this.position = {
      x: x,
      y: y,
    };
    this.points = {
      top: this.position.y - this.pointR,
      bottom: this.position.y + this.pointR,
      left: this.position.x - this.pointR,
      right: this.position.x + this.pointR,
    };
    this.itemLook = '#F2A6A6'; 
    this.strokeLook = '#F18791';
    this.collected = false; 
  }
  
  show() {
    push();
    fill(this.itemLook);
    noStroke();
    translate(this.position.x, this.position.y+5);
    angleMode(DEGREES);
    rotate(45);
    rectMode(RADIUS);
    rect(0, 0, this.radius, this.radius, this.rounded);
    stroke(this.strokeLook);
    strokeWeight(2.5); 
    noFill();
    rect(0, 0, this.radius2, this.radius2, this.rounded -2);
    strokeWeight(5);
    point(0, 0);
    pop();
  }  
}

//---------------------------------------------------------------------------------------------

class SchlüsselItem {
  constructor({x, y}) {
    this.radius = 10;
    this.position = {
      x: x,
      y: y,
    };
    this.sides = {
      top: this.position.y - this.radius,
      bottom: this.position.y + this.radius,
      left: this.position.x - (2.5 * this.radius),
      right: this.position.x + ((2 * this.radius) + 2),
    };
    this.itemLook = 'yellow';
    this.collected = false;
  }

  show() {
    push();
    translate(this.position.x, this.position.y);
    scale(0.7,0.7);
    angleMode(DEGREES);
    rotate(-40);
    strokeWeight(3);
    stroke(this.itemLook);
    noFill();
    circle(this.radius, 0, 2 * this.radius);
    strokeWeight(3);
    line(- (2.5 * this.radius), -1, 0, -1);
    line(- (2.3 * this.radius), -1, - (2.3 * this.radius), this.radius - 2);
    line(- (1.5 * this.radius), -1, - (1.5 * this.radius), this.radius - 2);
    line(-2, -3, -2, 2);
    strokeWeight(5);
    point(this.radius, 0);
    point((2 * this.radius) + 2, 0);
    pop();
  }
}

//--------------------------------------------------------------------------------------------

class Portal {
  constructor({x, y}) {
    this.rMax = 70;
    this.position = {
      x: x,
      y: y,
    }
    this.sides = {
      top: this.position.y - this.rMax,
      bottom: this.position.y + this.rMax,
      left: this.position.x - this.rMax,
      right: this.position.x + this.rMax,
    };
    this.rimLook = '#565cb0'; 
    this.rimBlock = '#373B73';
    this.locked = '#f54e75'; 
    this.inaktive = '#9497c7'; 
    this.aktive = '#caff70';
    this.portalLook = '#9497c7';
  }
  
  inaktiv() {
    push();
    translate(this.position.x, this.position.y);
    strokeWeight(5);
    stroke(this.rimLook);
    fill(this.inaktive);
    circle(0, 0, this.rMax);
    noFill();
    stroke(this.locked);
    strokeWeight(1);
    circle(0, 0, this.rMax - 5);  
    noStroke();
    for(let r = 7; r >= 0; r -= 1) {
      angleMode(DEGREES);
      rotate(45);
      fill(this.rimLook);
      quad(-5, -this.rMax/2 + 6, -7, -this.rMax/2 - 6, 7, -this.rMax/2 - 6, 5, -this.rMax/2 + 6);
      fill(this.locked);
      circle(0, -this.rMax/2, 5);
    }
    push();
    scale(0.8,0.8);
    fill(this.rimBlock);
    circle(0, -5, 10);
    triangle(0, -10, 5, 10, -5, 10);
    pop();
    pop();
  }

  aktiv() {
    push();
    translate(this.position.x, this.position.y);
    strokeWeight(5);
    stroke(this.rimLook);
    fill(this.portalLook);
    circle(0, 0, this.rMax);
    noFill();
    strokeWeight(2);
    stroke(this.aktive);
    for(let a = this.rMax - 10; a >= 0; a -= 10) {
      arc(
        0, 0,
        a, a,
        50 * random(0, 360),
        50 * random(0, 360),
        OPEN
      );
    }
    noStroke();
    for(let r = 7; r >= 0; r -= 1) {
      angleMode(DEGREES);
      rotate(45);
      fill(this.rimLook);
      quad(-5, -this.rMax/2 + 6, -7, -this.rMax/2 - 6, 7, -this.rMax/2 - 6, 5, -this.rMax/2 + 6);
      fill(this.aktive);
      circle(0, -this.rMax/2, 5);
    }
    pop();
  }
}