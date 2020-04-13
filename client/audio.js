let context = null;

export const initialise = () => {
  if (context) return;

  context = new AudioContext();
  const osc = new OscillatorNode(context);
  const gain = new GainNode(context, { gain: 0 });

  osc.connect(gain).connect(context.destination);
  osc.start();

  return {
    play: (frequency) => {
      osc.frequency.setValueAtTime(frequency, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, context.currentTime + 4);
    },
  };
};
