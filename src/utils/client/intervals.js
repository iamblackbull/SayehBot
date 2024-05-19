const timer = 10 * 60 * 1000;

let birthdayInterval, videoInterval, presenceInterval;

function setIntervals(client) {
  birthdayInterval = setInterval(client.remindBirthday, timer);
  videoInterval = setInterval(client.checkVideo, timer);
  presenceInterval = setInterval(client.updatePResence, timer);

  console.log("[Application Logs]: Intervals have been set.");
}

function clearIntervals() {
  clearInterval(birthdayInterval);
  clearInterval(videoInterval);
  clearInterval(presenceInterval);

  console.log("[Application Logs]: Intervals have been cleared.");
}

module.exports = {
  setIntervals,
  clearIntervals,
};
