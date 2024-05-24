const { TwitchOnlineTracker } = require("@matsukky/twitchtracker");
const notificationHandler = require("../../utils/main/handleNotifications");

module.exports = {
  name: "twitch",

  async execute(client) {
    const tracker = new TwitchOnlineTracker({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWTICH_CLIENT_SECRET,
      track: ["sayeh", "hamiitz"],
      pollInterval: 30,
      debug: false,
      start: true,
    });

    console.log("[Notification]: Twitch event listener is ready.");

    tracker.on("live", (data) => {
      console.log(`[Notification]: ${data.user_name} is now live on Twitch!`);

      notificationHandler.sendStreamNotification(client, data);
    });

    tracker.on("offline", function (channel) {
      console.log(`[Notification]: ${channel} has gone offline.`);

      notificationHandler.endStreamNotification(client, channel);
    });

    tracker.on("error", (error) => {
      console.error("[Notification]: Error on twitch event listener: ", error);
    });
  },
};
