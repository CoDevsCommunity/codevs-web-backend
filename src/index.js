const app = require('./server/server');
const dbConnect = require('./database/dbConnect');

async function startApp() {
  await dbConnect();
  app.listen(app.get('port'), () => {
    // eslint-disable-next-line no-console
    console.log(`App Listening in port ${app.get('port')}`);
  });
}

startApp();
