const { EmbedBuilder, ActionRowBuilder } = require("discord.js");
const { mongoose } = require("mongoose");
const streamModel = require("../../schemas/stream-schema");
const { getUserProfile, createItems } = require("../api/handleStream");
const { createUrlButton } = require("../../utils/main/createButtons");
const presenceHandler = require("../../utils/main/handlePresence");
const utils = require("../main/mainUtils");

let importedClient;
let embed = false;
let announcement = false;
let msg = false;

function getClient(client) {
  importedClient = client;
}

async function sendStreamNotification(data) {
  if (mongoose.connection.readyState !== 1) return;

  const guild = await importedClient.guilds.fetch(process.env.guildID);
  const channel = await guild.channels.fetch(process.env.streamChannelID);
  if (!guild || !channel) return;

  const { user_login, user_name, game_name, title, viewer_count } = data;

  const { image, url } = createItems(user_name);

  let streamList = await streamModel.findOne({
    guild: guild.id,
    Streamer: user_login,
  });

  if (!streamList) {
    streamList = new stream({
      guild: guild.id,
      Streamer: user_login,
      IsLive: false,
    });
    await streamList.save().catch(console.error);
  }

  if (!streamList.IsLive) {
    presenceHandler.streamPresence(importedClient, title, user_name);

    const { result } = await getUserProfile(user_login);
    const { profile_image_url } = result;

    embed = new EmbedBuilder()
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
        text: utils.footers.twitch,
        iconURL: utils.texts.twitch,
      });

    announcement = `Hey ${utils.tag}\n**${user_name}** is now LIVE on Twitch! 😍🔔\n\n## ${title}\n\n${url}`;

    const { urlButton } = createUrlButton(utils.labels.stream, url);
    const button = new ActionRowBuilder().addComponents(urlButton);

    console.log("[Application Logs]: Twitch notification sent.");

    msg = await channel.send({
      content: announcement,
    });

    setTimeout(async () => {
      await msg?.edit(
        {
          embeds: [embed],
          components: [button],
        },
        2 * 1000
      );
    });
  }
}

async function endStreamNotification(channel) {
  if (mongoose.connection.readyState !== 1) return;

  const guild = await importedClient.guilds.fetch(process.env.guildID);
  if (!guild) return;

  const channelLogin =
    channel === "Sayeh"
      ? "sayeh"
      : channel === "Hamiitz"
      ? "hamiitz"
      : undefined;
  if (channelLogin == undefined) return;

  await streamModel.updateOne(
    {
      guild: guild.id,
      Streamer: channelLogin,
    },
    { IsLive: false }
  );

  presenceHandler.mainPresence(client);

  if (msg && embed && announcement) {
    const { result } = await getUserProfile(channelLogin);
    const { offline_image_url } = result;

    embed.setImage(offline_image_url);

    announcement = `${channel} has gone offline. 😢`;

    console.log(
      "[Application Logs]: Twitch notification edited to offline mode."
    );

    await msg.edit({
      embeds: [embed],
      content: announcement,
      components: [],
    });
  }
}

module.exports = {
  getClient,
  sendStreamNotification,
  endStreamNotification,
};
