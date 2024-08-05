const { TwitchOnlineTracker } = require("@matsukky/twitchtracker");
const { consoleTags } = require("../main/mainUtils");

function setupTwitch() {
  const tracker = new TwitchOnlineTracker({
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWTICH_CLIENT_SECRET,
    track: ["sayeh", "hamiitz"],
    pollInterval: 30,
    debug: false,
    start: true,
  });

  console.log(`${consoleTags.notif} Twitch event listener is ready.`);

  return tracker;
}

module.exports = {
  setupTwitch,
};
