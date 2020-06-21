import { createRenderer } from './glsl.js';

const shader = `
precision mediump float;
uniform float time;
uniform vec2  resolution;
uniform float glowiness;
uniform vec3 colour;

void main(void){
    vec3 destColor = colour;
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    float gradual_onset = min(time, 5.0) / 5.0;
    float l = 0.05 / abs(length(p) - 0.5) * glowiness * gradual_onset;
    gl_FragColor = vec4(l*destColor, 1.0);
}`;

const { canvas, draw } = createRenderer(shader);
canvas.id = 'animation-canvas';
document.body.appendChild(canvas);

const dampened = speed => {
  let target = 0;
  let value = 0;
  return {
    setTarget: t => target = t,
    getValue: v => value,
    update: () => value += (target - value) * speed,
  };
};

const dampeningFactor = 0.08;
const MouseX = dampened(dampeningFactor);
const MouseY = dampened(dampeningFactor);
const Glowiness = dampened(dampeningFactor);

const onWindowResize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

const onMouseMove = event => {
  MouseX.setTarget(event.clientX / window.innerWidth);
  MouseY.setTarget(1 - event.clientY / window.innerHeight);
}

onWindowResize();
window.addEventListener('resize', onWindowResize, false);
document.body.addEventListener('mousemove', onMouseMove, false);

let animationStartTime = 0;

const animate = time => {
  requestAnimationFrame(animate);

  MouseX.update();
  MouseY.update();
  Glowiness.update();

  draw(time - animationStartTime, MouseX.getValue(), MouseY.getValue(), canvas.width, canvas.height, Glowiness.getValue());
}

export const startAnimating = () => {
  animationStartTime = performance.now();

  canvas.animate([
    { opacity: 0 },
    { opacity: 1 },
  ], {
    fill: 'forwards',
    duration: 6000,
  });
  requestAnimationFrame(animate);
};

export const setGlowiness = target => Glowiness.setTarget(target);
