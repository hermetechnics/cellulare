import { range } from './util.js';

export const repeat = (action, time) => ({
  interval: null,
  start() {
    this.interval = setInterval(action, time * 1000);
  },
  stop() {
    clearInterval(this.interval);
  }
});

export const produceInfinitely = function* (action) {
  let i = 0;

  while (true) {
    yield action(i++);
  }
};
