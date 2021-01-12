const express = require("express");
const app = express();
const router = require("../routes/router");

// middlewars
if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

// Settings
app.set("port", process.env.PORT || 3000);

// Routers
app.use(router);

module.exports = app;
