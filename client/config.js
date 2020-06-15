export const samples = {
  'kick1': 'https://cellulare.s3.eu-central-1.amazonaws.com/samples/kick_whole.wav',
  'kick2': 'https://cellulare.s3.eu-central-1.amazonaws.com/samples/kick_whole-1.wav',
  'kick3': 'https://cellulare.s3.eu-central-1.amazonaws.com/samples/kick_whole-2.wav',
  'kick4': 'https://cellulare.s3.eu-central-1.amazonaws.com/samples/kick_whole-3.wav',
  'rattle_aux': 'https://cellulare.s3.eu-central-1.amazonaws.com/samples/rattle_aux.wav',
  'rattle1': 'https://cellulare.s3.eu-central-1.amazonaws.com/samples/rattle_main.wav',
  'rattle2': 'https://cellulare.s3.eu-central-1.amazonaws.com/samples/rattle_main-1.wav',
  'rattle3': 'https://cellulare.s3.eu-central-1.amazonaws.com/samples/rattle_main-2.wav',
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
