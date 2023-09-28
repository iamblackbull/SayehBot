const { ActivityType } = require("discord.js");
const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth() + 1;
const currentDate = date.getDate();

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(
      `SayehBot is online!\nToday's date: ${currentYear}.${currentMonth}.${currentDate}`
    );

    setInterval(client.remindBirthday, 1 * 60 * 1000);
    setInterval(client.checkStreamS, 5 * 60 * 1000);
    setInterval(client.checkStreamH, 5 * 60 * 1000);
    setInterval(client.checkVideo, 5 * 60 * 1000);

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
