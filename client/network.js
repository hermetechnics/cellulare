import { createRenderer } from './glsl.js';

const shader = `
// The Universe Within - by Martijn Steinrucken aka BigWings 2018
// Email:countfrolic@gmail.com Twitter:@The_ArtOfCode
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// After listening to an interview with Michael Pollan on the Joe Rogan
// podcast I got interested in mystic experiences that people seem to
// have when using certain psycoactive substances.
//
// For best results, watch fullscreen, with music, in a dark room.
//
// I had an unused 'blockchain effect' lying around and used it as
// a base for this effect. Uncomment the SIMPLE define to see where
// this came from.
//
// Use the mouse to get some 3d parallax.

#define S(a, b, t) smoothstep(a, b, t)
#define NUM_LAYERS 4.

//#define SIMPLE

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;

float N21(vec2 p) {
	vec3 a = fract(vec3(p.xyx) * vec3(213.897, 653.453, 253.098));
    a += dot(a, a.yzx + 79.76);
    return fract((a.x + a.y) * a.z);
}

vec2 GetPos(vec2 id, vec2 offs, float t) {
    float n = N21(id+offs);
    float n1 = fract(n*10.);
    float n2 = fract(n*100.);
    float a = t+n;
    return offs + vec2(sin(a*n1), cos(a*n2))*.4;
}

float GetT(vec2 ro, vec2 rd, vec2 p) {
	return dot(p-ro, rd);
}

float LineDist(vec3 a, vec3 b, vec3 p) {
	return length(cross(b-a, p-a))/length(p-a);
}

float df_line( in vec2 a, in vec2 b, in vec2 p)
{
    vec2 pa = p - a, ba = b - a;
	float h = clamp(dot(pa,ba) / dot(ba,ba), 0., 1.);
	return length(pa - ba * h);
}

float line(vec2 a, vec2 b, vec2 uv) {
    float r1 = .04;
    float r2 = .01;

    float d = df_line(a, b, uv);
    float d2 = length(a-b);
    float fade = S(1.5, .5, d2);

    fade += S(.05, .02, abs(d2-.75));
    return S(r1, r2, d)*fade;
}

float NetLayer(vec2 st, float n, float t) {
    vec2 id = floor(st)+n;

    st = fract(st)-.5;

    vec2 p[9];
    for (int i=0; i<9; i++) {
	float x = mod(float(i), 3.) - 1.;
	float y = mod(floor(float(i) / 3.), 3.) - 1.;
	p[i] = GetPos(id, vec2(x, y), t);
    }

    float m = 0.;
    float sparkle = 0.;

    for(int i=0; i<9; i++) {
        m += line(p[4], p[i], st);

        float d = length(st-p[i]);

        float s = (.005/(d*d));
        s *= S(1., .7, d);
        float pulse = sin((fract(p[i].x)+fract(p[i].y)+t)*5.)*.4+.6;
        pulse = pow(pulse, 20.);

        s *= pulse;
        sparkle += s;
    }

    m += line(p[1], p[3], st);
	m += line(p[1], p[5], st);
    m += line(p[7], p[5], st);
    m += line(p[7], p[3], st);

    float sPhase = (sin(t+n)+sin(t*.1))*.25+.5;
    sPhase += pow(sin(t*.1)*.5+.5, 50.)*5.;
    m += sparkle*sPhase;//(*.5+.5);

    return m;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - resolution.xy * .5) / resolution.y;
	  vec2 M = mouse.xy/resolution.xy-.5;

    float t = time*.1;

    float s = sin(t);
    float c = cos(t);
    mat2 rot = mat2(c, -s, s, c);
    vec2 st = uv*rot;
	   M *= rot*2.;

    float m = 0.;
    for(float i=0.; i<1.; i+=1./NUM_LAYERS) {
        float z = fract(t+i);
        float size = mix(15., 1., z);
        float fade = S(0., .6, z)*S(1., .8, z);

        m += fade * NetLayer(st*size-M*z, i, time);
    }


  float glow = -uv.y*1.*2.;

  vec3 baseCol = vec3(s, cos(t*.4), -sin(t*.24))*.4+.6;
  vec3 col = baseCol*m;
  col += baseCol*glow;

  #ifdef SIMPLE
  uv *= 10.;
  col = vec3(1)*NetLayer(uv, 0., time);
  uv = fract(uv);
  //if(uv.x>.98 || uv.y>.98) col += 1.;
  #else
  col *= 1.-dot(uv,uv);
  t = mod(time, 230.);
  col *= S(0., 20., t)*S(224., 200., t);
  #endif

  gl_FragColor = vec4(col,1);
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
let MouseX = dampened(dampeningFactor);
let MouseY = dampened(dampeningFactor);

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

const animate = time => {
  requestAnimationFrame(animate);

  MouseX.update();
  MouseY.update();

  draw(time, MouseX.getValue(), MouseY.getValue(), canvas.width, canvas.height);
}

export const startAnimating = () => requestAnimationFrame(animate);
