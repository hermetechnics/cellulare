import { initialise as initAudio } from './audio.js';
import { createClient } from './rhizome.js';

if (!('rhizome' in window)) {
  throw new Error('could not find rhizome, make sure the app is running inside rhizome-server');
}

const client = createClient();

const startButton = document.getElementById('start');
const playButton = document.getElementById('play');
const led = document.getElementById('led');
const frequencyInput = document.getElementById('frequency');

startButton.addEventListener('click', () => {
  const { play } = initAudio();
  startButton.hidden = true;
  playButton.hidden = false;

  playButton.addEventListener('click', () => {
    client.send('/cellulare/ping', [client.id, parseInt(frequencyInput.value)]);
  });

  client.on('message', (address, messageData) => {
    const [ sender, frequency ] = messageData;
    if (address === '/cellulare/ping' && sender !== client.id) {
      console.info(`received ${frequency} Hz from ${sender}`);
      play(frequency);

      led.animate([
        { opacity: 0 },
        { opacity: 1, offset: 0.1 },
        { opacity: 0 },
      ], { duration: 2000, iterations: 1 });
    }
  });
});
