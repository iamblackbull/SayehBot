const intervals = require("../../utils/client/intervals");

module.exports = {
  name: "reconnecting",

  async execute(client) {
    intervals.clearIntervals();

    console.log("[Application Logs]: SayehBot is reconnecting to Discord...");

    client.on("connect", () => {
      intervals.setIntervals(client);

      console.log("[Application Logs]: SayehBot is reconnected to Discord.");
    });
  },
};
