// The following 2nd order functions first take an audio context + any required audio nodes
// and return functions which apply operations to the context/nodes
const loadSample = audioContext => async ([ name, url ]) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load sample ${name} from ${url}`);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);
  return { name, url, buffer };
};

const loadSamples = audioContext => async (samples = {}) => {
  const objects = await Promise.all(Object.entries(samples).map(loadSample(audioContext)));
  // transform into a dictionary
  const loaded = {};
  objects.forEach(({ name, ...data }) => loaded[name] = data);

  return loaded;
};

const playSample = (audioContext, outputNode) => ({ buffer }, time = 0) => {
  const source = new AudioBufferSourceNode(audioContext, { buffer });
  source.connect(outputNode);
  source.start(audioContext.currentTime + time);
  return new Promise((resolve) => source.addEventListener('ended', resolve));
};

const setGain = (audioContext, gainNode) => (gain, time = 0) => {
  gainNode.gain.setValueAtTime(gain, audioContext.currentTime + time);
};

/**
 * Initialises the audio context and returns an object
 * with several functions to control the audio engine.
 *
 * Must be triggered by a user interaction (mouse click, keyboard input)
 */
export const createAudioEngine = () => {
  const audioContext = new AudioContext();
  // this node provides the master volume control
  const master = new GainNode(audioContext, { gain: 1 });
  const compressor = new DynamicsCompressorNode(audioContext);

  compressor
    .connect(master)
    .connect(audioContext.destination);

  return {
    loadSamples: loadSamples(audioContext),
    playSample: playSample(audioContext, compressor),
    setMasterGain: setGain(audioContext, master),
  };
};
