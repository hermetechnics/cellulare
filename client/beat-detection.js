import { beatDetection } from './config.js';

const rms = signal => {
  let sum = 0;
  for (let i = 0; i < signal.length; i++) {
    sum += signal[i] ** 2;
  }

  return Math.sqrt(sum / signal.length);
};

const createProcessorLogic = callback => {
  const detectorState = {
    beatDetected: false,
    threshold: beatDetection.DEFAULT_THRESHOLD,
  };

  const processorHandler = ({ inputBuffer }) => {
    const rmsValue = rms(inputBuffer.getChannelData(0));
    if (rmsValue > detectorState.threshold) {
      if (!detectorState.beatDetected) callback(rmsValue);
      detectorState.beatDetected = true;
    } else {
      detectorState.beatDetected = false;
    }
  };

  return {
    processorHandler,
    setThreshold: threshold => detectorState.threshold = threshold,
  };
};

export const createBeatDetector = (audioContext, callback) => {
  const processor = audioContext.createScriptProcessor(beatDetection.BUFFER_SIZE, 1);
  const { processorHandler, setThreshold } = createProcessorLogic((rmsValue) => {
    if (typeof callback === 'function') callback(rmsValue);
  });

  processor.onaudioprocess = processorHandler;

  return { processor, setThreshold };
};
