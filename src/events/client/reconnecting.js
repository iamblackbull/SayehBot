const intervals = require("../../utils/client/intervals");
const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  name: "reconnecting",

  async execute(client) {
    intervals.clearIntervals();

    console.log(`${consoleTags.warning} SayehBot is reconnecting to Discord...`);

    client.on("connect", () => {
      intervals.setIntervals(client);

      console.log(`${consoleTags.app} SayehBot is reconnected to Discord.`);
    });
  },
};
