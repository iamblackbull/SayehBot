let birthdayInterval,
  videoInterval,
  presenceInterval,
  streamInterval,
  systemInterval;

function setIntervals(client) {
  birthdayInterval = setInterval(client.remindBirthday, 600_000);
  videoInterval = setInterval(client.checkVideo, 600_000);
  presenceInterval = setInterval(client.updatePresence, 3_600_000);
  streamInterval = setInterval(client.updateStream, 30_000);
  systemInterval = setInterval(client.checkSystem, 10_000);

  console.log("[Application Logs]: Intervals have been set.");
}

function clearIntervals() {
  clearInterval(birthdayInterval);
  clearInterval(videoInterval);
  clearInterval(presenceInterval);
  clearInterval(streamInterval);
  clearInterval(systemInterval);

  console.log("[Application Logs]: Intervals have been cleared.");
}

module.exports = {
  setIntervals,
  clearIntervals,
};
