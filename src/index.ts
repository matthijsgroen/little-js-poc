"use strict";
import {
  EngineObject,
  vec2,
  randColor,
  engineInit,
  setCameraPos,
  setCanvasFixedSize,
  cameraPos,
  drawRect,
  Color,
  mousePos,
  clamp,
  drawTextScreen,
  mainCanvasSize,
  Sound,
  mouseWasPressed,
  ParticleEmitter,
  PI,
  max,
  min,
} from "./littlejs/littlejs.esm";

/*
    LittleJS Empty Project Example
*/

const levelSize = vec2(38, 20); // size of play area
let ball; // keep track of ball object
let paddle;
let score = 0; // start score at 0

const soundBounce = new Sound(
  [, , 1e3, , 0.03, 0.02, 1, 2, , , 940, 0.03, , , , , 0.2, 0.6, , 0.06],
  0
);
const soundBreak = new Sound(
  [, , 90, , 0.01, 0.03, 4, , , , , , , 9, 50, 0.2, , 0.2, 0.01],
  0
);
const soundStart = new Sound([
  ,
  0,
  500,
  ,
  0.04,
  0.3,
  1,
  2,
  ,
  ,
  570,
  0.02,
  0.02,
  ,
  ,
  ,
  0.04,
]);

class Paddle extends EngineObject {
  constructor() {
    super(vec2(0, 1), vec2(6, 0.5)); // set object position and size
    this.setCollision(); // make object collide
    this.mass = 0; // make object have static physics
  }

  update() {
    this.pos.x = mousePos.x; // move paddle to mouse
    // clamp paddle to level size
    this.pos.x = clamp(
      this.pos.x,
      this.size.x / 2,
      levelSize.x - this.size.x / 2
    );
  }
}

class Wall extends EngineObject {
  constructor(pos, size) {
    super(pos, size); // set object position and size

    this.setCollision(); // make object collide
    this.mass = 0; // make object have static physics
    this.color = new Color(0, 0, 0, 0); // make object invisible
  }
}

class Ball extends EngineObject {
  constructor(pos) {
    super(pos, vec2(0.5)); // set object position and size

    this.velocity = vec2(-0.1, -0.1); // give ball some movement
    this.setCollision(); // make object collide
    this.elasticity = 1; // make object bounce
  }

  collideWithObject(o) {
    // prevent colliding with paddle if moving upwards
    if (o == paddle && this.velocity.y > 0) return false;

    const speed = min(1.04 * this.velocity.length(), 0.5);
    soundBounce.play(this.pos, 1, speed); // play bounce sound with pitch scaled by speed
    this.velocity = this.velocity.normalize(speed);

    if (o == paddle) {
      // control bounce angle when ball collides with paddle
      const deltaX = this.pos.x - o.pos.x;
      this.velocity = this.velocity.rotate(0.3 * deltaX);

      // make sure ball is moving upwards with a minimum speed
      this.velocity.y = max(-this.velocity.y, 0.2);

      // prevent default collision code
      return false;
    }
    // speed up the ball

    return true; // allow object to collide
  }
}

class Brick extends EngineObject {
  constructor(pos, size) {
    super(pos, size);

    this.setCollision(); // make object collide
    this.mass = 0; // make object have static physics
  }

  collideWithObject(o) {
    this.destroy(); // destroy block when hit
    ++score; // award a point for each brick broke
    soundBreak.play(this.pos); // play brick break sound
    // create explosion effect
    const color = this.color;
    new ParticleEmitter(
      this.pos,
      0, // pos, angle
      this.size,
      0.1,
      200,
      PI, // emitSize, emitTime, emitRate, emiteCone
      -1,
      vec2(16), // tileIndex, tileSize
      color,
      color, // colorStartA, colorStartB
      color.scale(1, 0),
      color.scale(1, 0), // colorEndA, colorEndB
      0.2,
      0.5,
      1,
      0.1,
      0.1, // time, sizeStart, sizeEnd, speed, angleSpeed
      0.99,
      0.95,
      0.4,
      PI, // damping, angleDamping, gravityScale, cone
      0.1,
      0.5,
      0,
      1 // fadeRate, randomness, collide, additive
    );
    return true;
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  // called once after the engine starts up
  // setup the game

  // create bricks
  for (let x = 2; x <= levelSize.x - 2; x += 2)
    for (let y = 12; y <= levelSize.y - 2; y += 1) {
      const brick = new Brick(vec2(x, y), vec2(2, 1)); // create a brick
      brick.color = randColor(); // give brick a random color
    }

  paddle = new Paddle();

  setCameraPos(levelSize.scale(0.5)); // center camera in level
  setCanvasFixedSize(vec2(1280, 720)); // use a 720p fixed size canvas

  // create walls
  new Wall(vec2(-0.5, levelSize.y / 2), vec2(1, 100)); // left
  new Wall(vec2(levelSize.x + 0.5, levelSize.y / 2), vec2(1, 100)); // right
  new Wall(vec2(levelSize.x / 2, levelSize.y + 0.5), vec2(100, 1)); // top
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  // called every frame at 60 frames per second
  // handle input and update the game state
  if (!ball || ball.pos.y < -1) {
    // destroy old ball
    if (ball) ball.destroy();
    ball = 0;
  }
  if (!ball && mouseWasPressed(0)) {
    // if there is no ball and left mouse is pressed
    ball = new Ball(cameraPos); // create the ball
    soundStart.play(); // play start sound
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {
  // called after physics and objects are updated
  // setup camera and prepare for render
}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {
  // called before objects are rendered
  // draw any background effects that appear behind objects
  drawRect(cameraPos, vec2(100), new Color(0.5, 0.5, 0.5)); // draw background
  drawRect(cameraPos, levelSize, new Color(0.1, 0.1, 0.1)); // draw level boundary
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
  // called after objects are rendered
  // draw effects or hud that appear above all objects
  // drawTextScreen("Hello World!", mainCanvasSize.scale(0.5), 80);
  drawTextScreen("Score " + score, vec2(mainCanvasSize.x / 2, 70), 50); // show score
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(
  gameInit,
  gameUpdate,
  gameUpdatePost,
  gameRender,
  gameRenderPost,
  "tiles.png"
);
