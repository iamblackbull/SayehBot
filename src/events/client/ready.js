const { ActivityType } = require("discord.js");
const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth() + 1;
const currentDate = date.getDate();

let remindBirthdayInterval;
let checkStreamSInterval;
let checkStreamHInterval;
let checkVideoInterval;

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(
      `SayehBot is online!\nToday's date: ${currentYear}.${currentMonth}.${currentDate}`
    );

    remindBirthdayInterval = setInterval(client.remindBirthday, 5 * 60 * 1000);
    checkStreamSInterval = setInterval(client.checkStreamS, 5 * 60 * 1000);
    checkStreamHInterval = setInterval(client.checkStreamH, 5 * 60 * 1000);
    checkVideoInterval = setInterval(client.checkVideo, 5 * 60 * 1000);

    client.user.setPresence({
      activities: [
        {
          name: "Sayeh's videos 👉👈",
          type: ActivityType.Watching,
        },
      ],
      status: "online",
    });
  },
};

process.on("SIGINT", () => {
  clearInterval(remindBirthdayInterval);
  clearInterval(checkStreamSInterval);
  clearInterval(checkStreamHInterval);
  clearInterval(checkVideoInterval);

  console.log("SayehBot is now offline!");

  process.exit();
});
