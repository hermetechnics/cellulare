const grid = document.getElementById('grid');
const resetButton = document.getElementById('reset_game');
const densitySlider = document.getElementById('density_slider');

const toEmoji = char => {
  if (parseInt(char) == '2') return '🌱';
  if (parseInt(char) == '1') return  '⬜';
  else return '⬛';
}

const startApp = () => {
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
  socket.on('grid', ({ grid: gridData, count, density }) => {
    grid.innerText = `
    Count: ${count} \nDensity: ${density}\n
    ${gridData.map(row => row.map(toEmoji).join(' ')).join('\n')}
        `;
      });

  resetButton.addEventListener('click', () => {
    console.info("reset!")
    socket.emit('reset_game', { density: densitySlider.value });
  });

};

startApp();
