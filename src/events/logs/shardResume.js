const { Events } = require("discord.js");

module.exports = {
  name: Events.ShardResume,

  execute() {
    console.log("[Discord API Status] Shard has resumed connection.");
  },
};
