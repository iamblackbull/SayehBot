const { EmbedBuilder, ActionRowBuilder } = require("discord.js");
const { mongoose } = require("mongoose");
const streamModel = require("../../database/streamModel");
const { getUserProfile, createItems } = require("../api/handleStream");
const { createUrlButton } = require("../../utils/main/createButtons");
const presenceHandler = require("../../utils/main/handlePresence");
const utils = require("../main/mainUtils");
const eventsModel = require("../../database/eventsModel");
const { consoleTags } = require("./mainUtils");

const notifiedChannels = new Set();

const STREAMERS = {
  sayeh: {
    streamData: false,
    embed: false,
    announcement: false,
    msg: false,
  },
  hamiitz: {
    streamData: false,
    embed: false,
    announcement: false,
    msg: false,
  },
};

function updateStreamerData(streamer, data, embed, announcement, msg) {
  STREAMERS[streamer].streamData = data;
  STREAMERS[streamer].embed = embed;
  STREAMERS[streamer].announcement = announcement;
  STREAMERS[streamer].msg = msg;
}

function getLoginFromChannel(channel) {
  if (channel === "Sayeh") return "sayeh";
  if (channel === "Hamiitz") return "hamiitz";
  return false;
}

function resetStreamerData(streamer) {
  STREAMERS[streamer].streamData = false;
  STREAMERS[streamer].embed = false;
  STREAMERS[streamer].announcement = false;
  STREAMERS[streamer].msg = false;
}

async function sendStreamNotification(client, data) {
  if (mongoose.connection.readyState !== 1) return;

  const guild = await client.guilds.fetch(process.env.guildID);
  const channel = await guild.channels.fetch(process.env.streamChannelID);
  if (!guild || !channel) return;

  const eventsList = await eventsModel.findOne({
    guildId: guild.id,
    Stream: true,
  });
  if (!eventsList) return;

  const { user_login, user_name, game_name, title, viewer_count } = data;

  const { image, url } = createItems(user_name);

  let streamList = await streamModel.findOne({
    guild: guild.id,
    Streamer: user_login,
  });

  if (!streamList) {
    streamList = new streamModel({
      guild: guild.id,
      Streamer: user_login,
      IsLive: false,
    });
    await streamList.save().catch(console.error);
  }

  if (streamList.IsLive) return;

  await streamModel.updateOne(
    {
      guild: guild.id,
      Streamer: user_login,
    },
    {
      IsLive: true,
    }
  );

  presenceHandler.streamPresence(client, title, user_name);

  const { result } = await getUserProfile(user_login);
  const { profile_image_url } = result;

  const embed = new EmbedBuilder()
    .setAuthor({
      name: user_name,
      iconURL: profile_image_url,
      url,
    })
    .setTitle(`**${title}**`)
    .setURL(url)
    .setDescription(
      `Streaming **${
        game_name || `Just Chatting`
      }** for ${viewer_count} viewers`
    )
    .setThumbnail(profile_image_url)
    .setImage(image)
    .setColor(utils.colors.twitch)
    .setTimestamp(Date.now())
    .setFooter({
      text: utils.texts.twitch,
      iconURL: utils.footers.twitch,
    });

  const announcement = `Hey ${utils.tag}\n**${user_name}** is now LIVE on Twitch! 😍🔔\n\n## ${title}\n\n${url}`;

  const { urlButton } = createUrlButton(utils.labels.stream, url);
  const button = new ActionRowBuilder().addComponents(urlButton);

  if (notifiedChannels.has(user_login)) return;
  notifiedChannels.add(user_login);

  console.log(`${consoleTags.app} ${user_name}'s twitch notification sent.`);

  const msg = await channel.send({
    content: announcement,
  });

  if (STREAMERS[user_login]) {
    updateStreamerData(user_login, data, embed, announcement, msg);
  }

  setTimeout(async () => {
    await msg.edit({
      embeds: [embed],
      components: [button],
    });
  }, 2_000);

  setTimeout(() => {
    notifiedChannels.delete(user_login);
  }, 600_000);
}

async function updateStreamNotification(client, data) {
  if (mongoose.connection.readyState !== 1) return;

  const guild = await client.guilds.fetch(process.env.guildID);
  if (!guild) return;

  const eventsList = await eventsModel.findOne({
    guildId: guild.id,
    Stream: true,
  });
  if (!eventsList) return;

  const { user_login, user_name, game_name, title, viewer_count } = data;

  const { image, url } = createItems(user_name);

  const streamer = STREAMERS[user_login];
  if (!streamer.embed) return;

  let update = false;
  if (streamer.streamData.game_name != game_name) update = true;
  if (streamer.streamData.title != title) update = true;

  if (!update) return;

  presenceHandler.streamPresence(client, title, user_name);

  const announcement = `Hey ${utils.tag}\n**${user_name}** is now LIVE on Twitch! 😍🔔\n\n## ${title}\n\n${url}`;

  const embed = streamer.embed
    .setTitle(`**${title}**`)
    .setDescription(
      `Streaming **${
        game_name || `Just Chatting`
      }** for ${viewer_count} viewers`
    );
  setImage(image);

  await streamer.msg.edit({
    embeds: [embed],
    content: announcement,
  });

  console.log(`${consoleTags.app} ${user_name}'s twitch notification updated.`);
}

async function endStreamNotification(client, channel) {
  if (mongoose.connection.readyState !== 1) return;

  const guild = await client.guilds.fetch(process.env.guildID);
  if (!guild) return;

  const eventsList = await eventsModel.findOne({
    guildId: guild.id,
    Stream: true,
  });
  if (!eventsList) return;

  const login = getLoginFromChannel(channel);
  if (!login) return;

  const streamer = STREAMERS[login];
  if (!streamer.embed) return;

  await streamModel.updateOne(
    {
      guild: guild.id,
      Streamer: channelLogin,
    },
    { IsLive: false }
  );

  presenceHandler.mainPresence(client);

  const { result } = await getUserProfile(channelLogin);
  const { offline_image_url } = result;

  const announcement = `${channel} has gone offline. 😢`;

  const embed = streamer.embed.setImage(offline_image_url);

  await streamer.msg.edit({
    embeds: [embed],
    content: announcement,
    components: [],
  });

  console.log(
    `${consoleTags.app} ${channel}'s twitch notification edited to offline mode.`
  );

  resetStreamerData(login);
}

module.exports = {
  sendStreamNotification,
  updateStreamNotification,
  endStreamNotification,
};
