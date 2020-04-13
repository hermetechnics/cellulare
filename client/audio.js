export const start = () => {
  const context = new AudioContext();
  const osc = new OscillatorNode(context);
  const gain = new GainNode(context, { gain: 0 });

  osc.connect(gain).connect(context.destination);
  osc.start();
  gain.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0, context.currentTime + 4);
};
