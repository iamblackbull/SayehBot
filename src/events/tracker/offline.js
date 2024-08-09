const { endStream } = require("../../utils/main/handleNotifications");
const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  name: "offline",

  async execute(channel, client) {
    await endStream(client, channel);

    console.log(`${consoleTags.notif} ${channel} has gone offline.`);
  },
};
