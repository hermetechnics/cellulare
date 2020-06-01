const grid = document.getElementById('grid');

const toEmoji = char => parseInt(char) ? '⬜' : '⬛';

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
  socket.on('grid', data => {
    grid.innerText = data.map(row => row.map(toEmoji).join(' ')).join('\n');
  });
};

startApp();
