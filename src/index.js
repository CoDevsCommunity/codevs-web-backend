const server = require("./server/server");

async function startApp() {
  server.listen(server.get("port"), () => {
    console.log(`App Listening in port ${server.get("port")}`);
  });
}

startApp();
