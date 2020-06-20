export const createBeatDetector = async (audioContext, callback) => {
  await audioContext.audioWorklet.addModule('./beat-detector.worklet.js');
  console.info('Registered beat detector');

  const processor = new AudioWorkletNode(audioContext, 'beat-detector');
  const thresholdParam = processor.parameters.get('threshold');
  const setThreshold = (threshold) => thresholdParam.setValueAtTime(threshold, audioContext.currentTime);

  processor.port.addEventListener('message', ({ data }) => {
    callback(data.rms);
  });

  return { processor, setThreshold };
};
