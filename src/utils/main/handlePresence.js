const { ActivityType } = require("discord.js");
const { presences } = require("./mainUtils");
const presenceModel = require("../../database/presenceModel");

async function mainPresence(client) {
  let name, type, status;

  const presenceList = await presenceModel.findOne({
    GuildId: process.env.guildID,
  });

  if (!presenceList) {
    name = presences.main;
    type = ActivityType.Custom;
    status = "online";
  } else {
    name = presenceList.Name;
    type = presenceList.Type;
    status = presenceList.Status;
  }

  client.user.setPresence({
    activities: [
      {
        name,
        type,
      },
    ],
    status,
  });
}

function streamPresence(client, title, username) {
  client.user.setPresence({
    activities: [
      {
        name: `${title} 📺` || presences.stream,
        url: `https://www.twitch.tv/${username}`,
        type: ActivityType.Streaming,
      },
    ],
    status: "online",
  });
}

function videoPresence(client) {
  client.user.setPresence({
    activities: [
      {
        name: presences.video,
        type: ActivityType.Custom,
      },
    ],
    status: "online",
  });
}

function customPresence(client, name, type, status) {
  client.user.setPresence({
    activities: [
      {
        name,
        type,
      },
    ],
    status,
  });
}

module.exports = {
  mainPresence,
  streamPresence,
  videoPresence,
  customPresence,
};
