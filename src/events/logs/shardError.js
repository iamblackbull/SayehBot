const { Events } = require("discord.js");

module.exports = {
  name: Events.ShardError,

  execute() {
    console.error("[Discord API Status] Shard connection failed.");
  },
};
