const { Events } = require("discord.js");

module.exports = {
  name: Events.Invalidated,

  execute() {
    console.log("[Discord API Status] Invalidated.");
  },
};
