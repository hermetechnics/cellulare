export const createClient = () => {
  const client = new rhizome.Client();

  client.start(() => {
    client.send('/sys/subscribe', ['/']);
  });

  client.on('connected', function() {
    console.info('connected!');
  });

  client.on('connection lost', function() {
    console.warn('connection lost!');
  });

  client.on('server full', function() {
    console.warn('server is full!');
  });

  return client;
};
