import { samples, beatDetection } from './config.js';
import { throttle } from './util.js';
import { createAudioEngine } from './audio.js';
import { startAnimating } from './network.js';

const startAudioButton = document.getElementById('start-audio');
const introSection = document.getElementById('intro-section');
const audioSetupSection = document.getElementById('audio-init');
const audioReadyButton = document.getElementById('audio-init-ready');
const thresholdIndicator = document.getElementById('threshold-indicator');
const thresholdSlider = document.getElementById('bd-threshold-slider');

/**
 * Initialises the app
 */
const startApp = () => {
  const socket = io();

  let audioEngine, loadedSamples;

  // THIS IS WHAT TRIGGERS WHEN BEAT IS DETECTED
  const onBeatDetect = rms => {
    thresholdIndicator.animate([
        { backgroundColor: '#FF000000', offset: 0 },
        { backgroundColor: '#FF0000FF', offset: 0.05 },
        { backgroundColor: '#FF000000', offset: 1 },
      ], { duration: 2000, easing: 'ease-out' });
  };

  // THIS IS WHERE WE INITIALISE AUDIO
  startAudioButton.addEventListener('click', async () => {
    audioEngine = await createAudioEngine({ onBeatDetect });
    console.info('Engine created');

    thresholdSlider.addEventListener('change', throttle(() => {
      console.log(`setting threshold to ${parseFloat(thresholdSlider.value)}`);
      audioEngine.setBeatDetectionThreshold(parseFloat(thresholdSlider.value));
    }, beatDetection.THROTTLE_DURATION));

    loadedSamples = await audioEngine.loadSamples(samples);
    console.info('Samples loaded');

    introSection.hidden = true;
    audioSetupSection.hidden = false;
  });

  audioReadyButton.addEventListener('click', () => {
    audioSetupSection.hidden = true;
    startAnimating();
  });

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

    audioEngine.playSample(randomKick(), 0 + randomSwing());
    audioEngine.playSample(randomKick(), 0.25 + randomSwing());
    audioEngine.playSample(randomKick(), 0.5 + randomSwing());
    audioEngine.playSample(randomKick(), 0.75 + randomSwing());

    if(parseInt(data.my_cell) == 1){
      audioEngine.playSample(loadedSamples.rattle, 0 + randomSwing());
    }

    for (let i = 0; i < data.neighbours.length; i++) {
      if(parseInt(data.neighbours[i]) == 1){
        audioEngine.playSample(loadedSamples.rattle_distant, 0.25 + i * (0.0625))
      }
    }
  });

  // adding more human feel to the drumming
  function randomSwing () {
    return (Math.random() - 0.5) / 70;
  }

  function randomKick () {
    let kicks = [loadedSamples.kick1, loadedSamples.kick2, loadedSamples.kick3, loadedSamples.kick4];
    return kicks[Math.floor(Math.random() * 4)]
  }

  testEventButton.addEventListener('click', () => {
    // if the button is clicked, we send a test event to the server
    socket.emit('test_event', { testData: 'test' });
  });


  startAnimating();
};

startApp();
