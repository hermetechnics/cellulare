import { start as startAudio } from './audio.js';

const startButton = document.getElementById('start');

startButton.addEventListener('click', () => {
  startAudio();
});
