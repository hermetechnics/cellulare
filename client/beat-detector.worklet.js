const rms = signal => {
  let sum = 0;
  for (let i = 0; i < signal.length; i++) {
    sum += signal[i] ** 2;
  }

  return Math.sqrt(sum / signal.length);
};

class BeatDetector extends AudioWorkletProcessor {
  static get parameterDescriptors () {
    return [{
      name: 'threshold',
      defaultValue: 0.01,
      minValue: 0.01,
      maxValue: 0.3,
      automationRate: 'k-rate'
    }]
  }

  constructor(...args) {
    super(...args);
    this.beatDetected = false;
  }

  process ([[signal]], _, parameters) {
    if (!signal) return true;
    const rmsValue = rms(signal);
    const [threshold] = parameters.threshold;

    if (rmsValue > threshold) {
      if (!this.beatDetected) {
        this.port.postMessage({ rms: rmsValue });
      }
      this.beatDetected = true;
    } else {
      this.beatDetected = false;
    }

    return true
  }
}

registerProcessor('beat-detector', BeatDetector);
