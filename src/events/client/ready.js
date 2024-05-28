const { Events } = require("discord.js");
const { mainPresence } = require("../../utils/main/handlePresence");
const intervals = require("../../utils/client/intervals");
const { getWarnClient } = require("../../utils/main/warnPenalty");
const { getReportClient } = require("../../utils/main/handleReports");
const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    await mainPresence(client);

    client.emit("twitch");

    getWarnClient(client);
    getReportClient(client);

    console.log(`${consoleTags.app} SayehBot is online.`);

    intervals.setIntervals(client);

    setInterval(() => {
      intervals.clearIntervals();
      intervals.setIntervals(client);

      console.log(`${consoleTags.app} Intervals have been refreshed.`);
    }, 43_200_000);
  },
};
