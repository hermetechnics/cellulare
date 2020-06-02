import { samples } from './config.js';
import { createAudioEngine } from './audio.js';
import { startAnimating } from './network.js';

const testEventButton = document.getElementById('test-event');
const startAudioButton = document.getElementById('start-audio');

/**
 * Initialises the app
 */
const startApp = () => {
  let audioEngine, loadedSamples;

  // THIS IS WHERE WE INITIALISE AUDIO
  startAudioButton.addEventListener('click', async () => {
    audioEngine = createAudioEngine();
    loadedSamples = await loadSamples(samples);
    console.info('Samples loaded');

    audioEngine.playSample(loadedSamples.kick);     // immediately
    audioEngine.playSample(loadedSamples.hihat, 2); // 2 seconds later

    await audioEngine.playSample(loadedSamples.snare, 3); // 3 seconds later, and wait for it to end
    audioEngine.playSample(loadedSamples.snare, 2); // 2 seconds after the sample above stops playing
    audioEngine.playSample(loadedSamples.snare, 4); // 4 seconds later

    // the order in which we schedule audio events doesn't matter
    // the gain change below will happen before the snare playback above
    audioEngine.setMasterGain(0.15, 3) // 3 seconds later
  });

  const socket = io();
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

  // this is how we can subscribe to various events from the server, and respond to them
  socket.on('pulse', data => {
    console.info('pulse', data);
    // do something with `data`
    // ...
  });

  testEventButton.addEventListener('click', () => {
    // if the button is clicked, we send a test event to the server
    socket.emit('test_event', { testData: 'test' });
  });


  startAnimating();
};

startApp();
