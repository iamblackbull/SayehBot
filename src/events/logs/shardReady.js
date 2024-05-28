const { Events } = require("discord.js");

module.exports = {
  name: Events.ShardReady,

  execute() {
    console.log("[Discord API Status] Shard is ready.");
  },
};
