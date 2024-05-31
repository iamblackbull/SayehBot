const { google } = require("googleapis");

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

async function getChannelId(channelName) {
  const result = await youtube.search.list({
    part: "snippet",
    q: channelName,
    type: "channel",
    maxResults: 1,
  });

  const channelId = result.data.items[0]
    ? result.data.items[0].snippet.channelId
    : false;

  return channelId;
}

async function getChannelData(channelId) {
  const result = await youtube.channels.list({
    part: "statistics,snippet,brandingSettings",
    id: channelId,
  });

  return result.data.items[0];
}

async function getLatestVideos(channelId, amount) {
  const result = await youtube.search.list({
    part: "snippet",
    channelId: channelId,
    order: "date",
    maxResults: amount,
  });

  return result.data.items;
}

module.exports = {
  getChannelId,
  getChannelData,
  getLatestVideos,
};
