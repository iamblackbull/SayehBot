const { Events } = require("discord.js");

module.exports = {
  name: Events.ShardReconnecting,
  execute() {
    console.log("[Discord API Status]: Shards are reconnecting...");
  },
};
