import { microphoneStreamConfig } from './config.js';
import { createBeatDetector } from './beat-detection.js';

// The following 2nd order functions first take an audio context + any required audio nodes
// and return functions which apply operations to the context/nodes
const loadSample = audioContext => async ([ name, url ]) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load sample ${name} from ${url}`);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);
  console.info(`Loaded sample: ${name}`);
  return { name, url, buffer };
};

const loadSamples = audioContext => async (samples = {}) => {
  const objects = await Promise.all(Object.entries(samples).map(loadSample(audioContext)));
  // transform into a dictionary
  const loaded = {};
  objects.forEach(({ name, ...data }) => loaded[name] = data);

  return loaded;
};

const playSample = (audioContext, outputNode) => (sample, time = 0, pan = 0, gain = 1) => {
  const { buffer, name } = sample;
  const source = new AudioBufferSourceNode(audioContext, { buffer });
  const bus = new GainNode(audioContext, { gain });
  const panner = new StereoPannerNode(audioContext, { pan });

  source
      .connect(panner)
      .connect(bus)
      .connect(outputNode);
  source.start(audioContext.currentTime + time);

  return new Promise((resolve) => source.addEventListener('ended', () => {
    source.disconnect();
    panner.disconnect();
    resolve();
  }));
};

const setGain = (audioContext, gainNode) => (gain, time = 0) => {
  gainNode.gain.setValueAtTime(gain, audioContext.currentTime + time);
};

const getMicrophoneInput = async audioContext => {
  const mediaStream = await navigator.mediaDevices.getUserMedia(microphoneStreamConfig);
  const source = new MediaStreamAudioSourceNode(audioContext, { mediaStream });
  return source;
};

/**
 * Initialises the audio context and returns an object
 * with several functions to control the audio engine.
 *
 * Must be triggered by a user interaction (mouse click, keyboard input)
 */
export const createAudioEngine = async ({ onBeatDetect }) => {
  const audioContext = new AudioContext();
  // this node provides the master volume control
  const master = new GainNode(audioContext, { gain: 1 });
  const compressor = new DynamicsCompressorNode(audioContext);

  compressor
    .connect(master)
    .connect(audioContext.destination);

  const detector = createBeatDetector(audioContext, onBeatDetect);
  const microphone = await getMicrophoneInput(audioContext);
  microphone.connect(detector.processor);

  return {
    loadSamples: loadSamples(audioContext),
    playSample: playSample(audioContext, compressor),
    setMasterGain: setGain(audioContext, master),
    setBeatDetectionThreshold: detector.setThreshold,
    get currentTime() {
      return audioContext.currentTime;
    },
  };
};
