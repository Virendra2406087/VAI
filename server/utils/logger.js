const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../logs/server.log");

const log = (message) => {
  const time = new Date().toISOString();
  const logMessage = `${time} - ${message}\n`;

  fs.appendFile(logFile, logMessage, (err) => {
    if (err) console.error("Failed to write log:", err);
  });
};

module.exports = log;