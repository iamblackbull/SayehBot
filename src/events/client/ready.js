const { Events } = require("discord.js");
const { mainPresence } = require("../../utils/main/handlePresence");
const intervals = require("../../utils/client/intervals");
const { getWarnClient } = require("../../utils/main/warnPenalty");

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    await mainPresence(client);

    client.emit("twitch");
    getWarnClient(client);

    console.log("[Application Logs]: SayehBot is online.");

    intervals.setIntervals(client);

    setInterval(() => {
      intervals.clearIntervals();
      intervals.setIntervals(client);

      console.log("[Application Logs]: Intervals have been refreshed.");
    }, 12 * 60 * 60 * 1000);
  },
};
