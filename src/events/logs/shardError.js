const { Events } = require("discord.js");

module.exports = {
  name: Events.ShardError,
  execute() {
    console.log("[Discord API Status]: Shards connection failed.");
  },
};
