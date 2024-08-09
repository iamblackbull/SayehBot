const TwitchAPI = require("node-twitch").default;

const twitch = new TwitchAPI({
  client_id: process.env.TWITCH_CLIENT_ID,
  client_secret: process.env.TWTICH_CLIENT_SECRET,
  access_token: process.env.TWITCH_CLIENT_ACCESS,
  refresh_token: process.env.TWITCH_CLIENT_REFRESH,
});

async function getStreamData(streamerId) {
  const data = await twitch.getStreams({ channel: [streamerId] });
  const result = data.data[0];

  return { result };
}

async function getUserProfile(username) {
  const data = await twitch.getUsers(username);
  const result = data.data[0];

  return { result };
}

function createItems(username) {
  const name = username.toLowerCase();
  const timestamp = Date.now();

  const image = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${name}-1920x1080.jpg?NgOqCvLCECvrHGtf=1&t=${timestamp}`;
  const url = `https://www.twitch.tv/${username}`;

  return { image, url };
}

module.exports = {
  getStreamData,
  getUserProfile,
  createItems,
};
