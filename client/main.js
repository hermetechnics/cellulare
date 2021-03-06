import { samples, beatDetection, playbackConfig } from './config.js';
import { throttle, range, randomSwing, chooseRandomlyFrom, toggleFullscreen } from './util.js';
import { createAudioEngine } from './audio.js';
import { startAnimating, setGlowiness } from './network.js';
import { produceInfinitely, repeat } from './sequencing.js';

const startAudioButton = document.getElementById('start-audio');
const introSection = document.getElementById('intro-section');
const audioSetupSection = document.getElementById('audio-init');
const audioReadyButton = document.getElementById('audio-init-ready');
const experimentInitSection = document.getElementById('experiment-init');
const experimentReadyButton = document.getElementById('experiment-init-ready');
const thresholdIndicator = document.getElementById('threshold-indicator');
const thresholdSlider = document.getElementById('bd-threshold-slider');

const initSocket = async context => {
  const socket = io();
  // some basic connection event handlers
  // TODO: provide feedback to the user when they trigger
  socket.on('connect', () => {
    console.info('Connected to WebSocket');
    socket.emit('register_cell');
  });

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      // the disconnection was initiated by the server, we need to reconnect manually
      console.warn('Disconnected by server');
    } else {
      console.warn('Disconnected by client');
    }
  });

  return { ...context, socket };
};

const initAudioEngine = context => new Promise((nextStep) => {
  // THIS IS WHAT TRIGGERS WHEN BEAT IS DETECTED
  const onBeatDetect = rms => {
    thresholdIndicator.animate([
        { backgroundColor: '#FF000000', offset: 0 },
        { backgroundColor: '#FF0000FF', offset: 0.05 },
        { backgroundColor: '#FF000000', offset: 1 },
      ], { duration: 2000, easing: 'ease-out' });

    // set the visualisation glowiness
    setGlowiness(rms * 200);
    console.log('trigger activity');
    context.socket.emit('trigger_activity', rms);
  };

  // THIS IS WHERE WE INITIALISE AUDIO
  startAudioButton.addEventListener('click', async () => {
    const audioEngine = await createAudioEngine({ onBeatDetect: throttle(onBeatDetect, 1000) });
    console.info('Engine created');

    const loadedSamples = await audioEngine.loadSamples(samples);
    console.info('Samples loaded');

    introSection.hidden = true;
    audioSetupSection.hidden = false;

    nextStep({ ...context, audioEngine, loadedSamples });
  });
});

const initAudioSetup = context => new Promise((nextStep) => {
  const { audioEngine } = context;

  thresholdSlider.addEventListener('change', throttle(() => {
    console.log(`setting threshold to ${parseFloat(thresholdSlider.value)}`);
    audioEngine.setBeatDetectionThreshold(parseFloat(thresholdSlider.value));
  }, beatDetection.THROTTLE_DURATION));

  audioReadyButton.addEventListener('click', () => {
    audioSetupSection.hidden = true;
    nextStep(context);
  });
});

const initExperimentIntro = context => new Promise((nextStep) => {
  experimentInitSection.hidden = false;

  experimentReadyButton.addEventListener('click', () => {
    experimentInitSection.hidden = true;
    startAnimating();
    nextStep(context);
  })
});

const initPulse = async context => {
  const { socket, audioEngine, loadedSamples } = context;
  const kicks = [loadedSamples.kick1, loadedSamples.kick2, loadedSamples.kick3, loadedSamples.kick4];
  const rattles = [loadedSamples.rattle1, loadedSamples.rattle2, loadedSamples.rattle3];

  let scheduledRattles = [];
  // this is how we can subscribe to various events from the server, and respond to them
  socket.on('pulse', data => {
    console.info('pulse', data);
    scheduledRattles = [];
    const neighbours = JSON.parse(data.neighbours);

    // atmo
    const backgroundGain = parseFloat(data.spirit_factor) * 0.2;
    for (let i = 0; i < 4; i++) {
      scheduledRattles.push(() => audioEngine.playSample(loadedSamples.rattle_aux, 0 + i / 4, 0, backgroundGain, Math.random() * 0.2 + 0.1));
    }

    // own cell
    if(parseInt(data.my_cell) == 1){
      scheduledRattles.push(() => audioEngine.playSample(chooseRandomlyFrom(rattles), 0 + randomSwing(), 0, 0.4, Math.random() * 0.3 + 0.2));
    }
    // neighbours
    for (let i = 0; i < neighbours.length; i++) {
       if(parseInt(neighbours[i]) == 1){
      scheduledRattles.push(() => audioEngine.playSample(loadedSamples.rattle_aux,
          1 / playbackConfig.STEPS_PER_SECOND + i * (1 / 6),
          Math.sin(i / 8), 0.05, Math.random() * 0.1 + 0.05));
       }
    }
  });

  const playBeat = index => {
    const time = index * (1 / playbackConfig.STEPS_PER_SECOND);
    audioEngine.playSample(chooseRandomlyFrom(kicks), time + randomSwing());
  };

  let lastScheduledTime = 0;

  const SEQUENCER_TICK = 1;
  const mainRhythm = repeat(
    () => {
      let currentScheduledTime = lastScheduledTime;

      for (const _ of produceInfinitely(playBeat)) {
        currentScheduledTime += 1 / playbackConfig.STEPS_PER_SECOND;
        if (currentScheduledTime > lastScheduledTime + SEQUENCER_TICK) {
          lastScheduledTime = currentScheduledTime;
          break;
        }
      }

      for (const trigger of scheduledRattles) {
        trigger();
      }
      scheduledRattles = [];

      // Here we can schedule other stuff coming from the pulse above
      // ...
    },
    SEQUENCER_TICK,
  );

  mainRhythm.start();

  window.callBack = async () => {
    console.log("call back");
    mainRhythm.stop();

    const callbackLength = 13;
    const rollPeriod = 0.8;
    const numRolls = 200;
    const gap = 3;

    for (const callback of range(0, 4)) {
      for (const i of range(0, 7)) {
        playBeat(gap + i + callback * callbackLength);
      }
    }

    for (const roll of range(0, numRolls)) {
      playBeat(gap + 4 * callbackLength + roll * rollPeriod);
    }

    for (const callback of range(0, 4)) {
      for (const i of range(0, 7)) {
        playBeat(gap + gap + numRolls * rollPeriod + i + callback * callbackLength + 4 * callbackLength);
      }
    }
  }

  socket.on('call_back_drumming', callBack);


  socket.on('resume_drumming', data => {
    mainRhythm.start();
  });

  socket.on('transition_gamelan', data => {
    for (const i of range(0, 3)) {
      audioEngine.playSample(loadedSamples.gamelan, i * 2);
    }
  });

  return { ...context, pulse: true };
};

const initExperimentInterface = async context => {
  document.getElementById('app-title').hidden = true;

  document.addEventListener('keypress', event => {
    if (event.key.toLowerCase() === 'f') toggleFullscreen();
  });

  return context;
};

const init = async steps => {
  let context;

  for (const step of steps) {
    context = await step(context);
  }

  console.info('Init sequence complete');
};

/**
 * Initialises the app
 */
init([
  initSocket,
  initAudioEngine,
  initAudioSetup,
  initExperimentIntro,
  initPulse,
  initExperimentInterface,
]);
