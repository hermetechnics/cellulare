const grid = document.getElementById('grid');
const saveSettingsButton = document.getElementById('save-settings');
const gamelanButton = document.getElementById('gamelan');
const unfreezeButton = document.getElementById('unfreeze');
const densitySlider = document.getElementById('density_slider');
const pause = document.getElementById('pause');
const radios = document.getElementsByName('algorithm');

const toEmoji = char => {
  if (parseInt(char) == '4') return '🌷';
  if (parseInt(char) == '3') return '🟥';
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
  socket.on('grid', ({ grid: gridData, count, density, algorithm }) => {
    grid.innerText = `
    Count: ${count} \nDensity: ${density}\nAlgorithm: ${algorithm}\n
    ${gridData.map(row => row.map(toEmoji).join(' ')).join('\n')}
        `;
      });

  saveSettingsButton.addEventListener('click', () => {
    console.info("save_settings")
    var checked = -1;
    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        checked = radios[i].value
        break;
      }
    }
    socket.emit('save_settings', { density: densitySlider.value, algorithm: checked });
  });


  unfreezeButton.addEventListener('click', () => {
    socket.emit('unfreeze', { data: 1 });
  });

  pause.addEventListener('click', () => {
    socket.emit('pause', { data: 1 });
  });

  gamelanButton.addEventListener('click', () => {
    socket.emit('gamelan_bells', { data: 1 });
  });
};

startApp();
