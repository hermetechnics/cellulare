export const samples = {
  'kick': 'https://cellulare.s3.eu-central-1.amazonaws.com/test-samples/kick.wav',
  'snare': 'https://cellulare.s3.eu-central-1.amazonaws.com/test-samples/snare.wav',
  'hihat': 'https://cellulare.s3.eu-central-1.amazonaws.com/test-samples/hihat.wav',
};

export const microphoneStreamConfig = {
  audio: {
    echoCancellation: false,
    autoGainControl: false,
    noiseSuppression: false,
    channelCount: 1,
  },
  video: false,
};

export const beatDetection = {
  BUFFER_SIZE: 2048,
  DEFAULT_THRESHOLD: 0.01,
  THROTTLE_DURATION: 400,
};
