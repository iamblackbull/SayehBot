const { Events } = require("discord.js");

module.exports = {
  name: Events.ShardResume,
  execute() {
    console.log("[Discord API Status]: Shards have resumed connection.");
  },
};
