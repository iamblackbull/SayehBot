const { ActivityType } = require("discord.js");
const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth() + 1;
const currentDate = date.getDate();

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`SayehBot is online!`);
    console.log(`Today's date: ${currentYear}.${currentMonth}.${currentDate}`);

    setInterval(client.remindBirthday, 24 * 60 * 60 * 1000);
    setInterval(client.checkStreamS, 1 * 60 * 1000);
    setInterval(client.checkStreamH, 1 * 60 * 1000);
    setInterval(client.checkVideo, 5 * 60 * 1000);
    client.user.setPresence({
      activities: [
        {
          name: "from Space",
          type: ActivityType.Watching,
        },
      ],
      status: "online",
    });
  },
};
