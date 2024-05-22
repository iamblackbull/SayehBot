const timer = 10 * 60 * 1000;

let birthdayInterval, videoInterval, presenceInterval, streamInterval;

function setIntervals(client) {
  birthdayInterval = setInterval(client.remindBirthday, timer);
  videoInterval = setInterval(client.checkVideo, timer);
  presenceInterval = setInterval(client.updatePResence, timer);
  streamInterval = setInterval(client.updateStream, 30 * 1000);

  console.log("[Application Logs]: Intervals have been set.");
}

function clearIntervals() {
  clearInterval(birthdayInterval);
  clearInterval(videoInterval);
  clearInterval(presenceInterval);
  clearInterval(streamInterval);

  console.log("[Application Logs]: Intervals have been cleared.");
}

module.exports = {
  setIntervals,
  clearIntervals,
};
