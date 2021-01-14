const server = require('./server/server');

async function startApp() {
  server.listen(server.get('port'), () => {
    // eslint-disable-next-line no-console
    console.log(`App Listening in port ${server.get('port')}`);
  });
}

startApp();
