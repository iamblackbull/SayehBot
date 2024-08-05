const { startStream } = require("../../utils/main/handleNotifications");
const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  name: "live",

  async execute(data, client) {
    await startStream(client, data);

    console.log(
      `${consoleTags.notif} ${data.user_name} is now live on Twitch!`
    );
  },
};
