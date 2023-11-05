const { ActivityType } = require("discord.js");
const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth() + 1;
const currentDate = date.getDate();

let remindBirthdayInterval;
let checkStreamSInterval;
let checkStreamHInterval;
let checkVideoInterval;

function setIntervals(client) {
  remindBirthdayInterval = setInterval(client.remindBirthday, 10 * 60 * 1000);
  checkStreamSInterval = setInterval(client.checkStreamS, 10 * 60 * 1000);
  checkStreamHInterval = setInterval(client.checkStreamH, 10 * 60 * 1000);
  checkVideoInterval = setInterval(client.checkVideo, 10 * 60 * 1000);
}

function clearIntervals() {
  clearInterval(remindBirthdayInterval);
  clearInterval(checkStreamSInterval);
  clearInterval(checkStreamHInterval);
  clearInterval(checkVideoInterval);
}

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(
      `SayehBot is online!\nToday's date: ${currentYear}.${currentMonth}.${currentDate}`
    );

    setIntervals(client);

    client.user.setPresence({
      activities: [
        {
          name: "Sayeh's videos 👉👈",
          type: ActivityType.Watching,
        },
      ],
      status: "online",
    });

    client.on("reconnecting", () => {
      clearIntervals();

      console.log("SayehBot is reconnecting to Discord.");

      client.on("connect", () => {
        setIntervals(client);

        console.log("SayehBot is reconnected to Discord.");
      });
    });
  },
};

process.on("SIGINT", () => {
  clearIntervals();

  console.log("SayehBot is now offline!");

  process.exit();
});
