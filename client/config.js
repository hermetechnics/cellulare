export const samples = {
  'kick1': 'https://cellulare.s3.eu-central-1.amazonaws.com/test-samples/kick.wav',
  'kick2': 'https://cellulare.s3.eu-central-1.amazonaws.com/test-samples/kick.wav',
  'kick3': 'https://cellulare.s3.eu-central-1.amazonaws.com/test-samples/kick.wav',
  'kick4': 'https://cellulare.s3.eu-central-1.amazonaws.com/test-samples/kick.wav',
  'snare': 'https://cellulare.s3.eu-central-1.amazonaws.com/test-samples/snare.wav',
  'rattle': 'https://cellulare.s3.eu-central-1.amazonaws.com/test-samples/snare.wav',
  'rattle_distant': 'https://cellulare.s3.eu-central-1.amazonaws.com/test-samples/hihat.wav',
};

export const microphoneStreamConfig = {
  audio: {
    echoCancellation: true,
    autoGainControl: false,
    noiseSuppression: true,
    channelCount: 1,
  },
  video: false,
};

export const playbackConfig = {
  STEPS_PER_SECOND: 4,
};

export const beatDetection = {
  BUFFER_SIZE: 2048,
  DEFAULT_THRESHOLD: 0.01,
  THROTTLE_DURATION: 400,
};
