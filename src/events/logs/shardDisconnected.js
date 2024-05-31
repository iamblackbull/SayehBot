const { Events } = require("discord.js");

module.exports = {
  name: Events.ShardDisconnect,

  execute() {
    console.log("[Discord API Status] Shard is disconnected.");
  },
};
