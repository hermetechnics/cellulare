import { WEBSOCKET_URL, samples } from './config.js';
import { createAudioEngine } from './audio.js';

const testEventButton = document.getElementById('test-event');
const startAudioButton = document.getElementById('start-audio');

/**
 * In this function we can handle messages coming from the server
 * we can play sounds, change visuals, etc.
 *
 * @param {Object} data the message data
 */
const handleMessage = data => {
  console.log(data);
};

const startAudio = async () => {
  const { loadSamples, playSample, setMasterGain } = createAudioEngine();
  console.info('Started audio engine');

  const { kick, snare, hihat } = await loadSamples(samples);
  console.info('Samples loaded');

  playSample(kick);     // immediately
  playSample(hihat, 2); // 2 seconds later

  await playSample(snare, 3); // 3 seconds later, and wait for it to end
  playSample(snare, 2); // 2 seconds after the sample above stops playing
  playSample(snare, 4); // 4 seconds later

  // the order in which we schedule audio events doesn't matter
  // the gain change below will happen before the snare playback above
  setMasterGain(0.5, 3) // 3 seconds later
};

/**
 * Initialises the app
 */
const startApp = () => {
  const socket = io(WEBSOCKET_URL);
  // some basic connection event handlers
  // TODO: provide feedback to the user when they trigger
  socket.on('connect', () => {
    console.info('Connected to WebSocket');
  });

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      // the disconnection was initiated by the server, we need to reconnect manually
      console.warn('Disconnected by server');
    } else {
      console.warn('Disconnected by client');
    }
  });

  socket.on('message', handleMessage);

  testEventButton.addEventListener('click', () => {
    // if the button is clicked, we send a test event to the server
    socket.emit('test-event', { testData: 'test' });
  });

  startAudioButton.addEventListener('click', startAudio);
};
