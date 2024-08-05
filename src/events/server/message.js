const { PermissionFlagsBits, Events } = require("discord.js");
const eventsModel = require("../../database/eventsModel");
const { scan } = require("../../utils/api/scanUrlApi");
const { bannedWords } = require("../../utils/main/mainUtils");
const { warn } = require("../../utils/main/warnTarget");
const { getUser } = require("../../utils/level/handleLevel");
const { calculateXP } = require("../../utils/level/handleXPRate");
const { handleMessageXp } = require("../../utils/level/handleLevel");
const { consoleTags } = require("../../utils/main/mainUtils");

const xpCooldown = new Set();

module.exports = {
  name: Events.MessageCreate,

  async execute(message, client) {
    if (message.author.bot) return;
    if (message.webhookId) return;
    if (!message.guild) return;

    const { member, content, channel, author, guildId } = message;

    const hasPermission = member.permissions.has(
      PermissionFlagsBits.ManageMessages
    );

    let ban = false;
    let reason;

    const ignoredChannels = [
      process.env.sadgeChannelID,
      process.env.selfpromoChannelID,
      process.env.musicChannelID,
      process.env.memeChannelID,
      process.env.memesayehChannelID,
    ];

    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = content.match(urlRegex);

    if (match) {
      const url = match[0];

      const { virus } = await scan(url);

      if (virus) {
        ban = true;
        reason = `Detected url with virus: ${url}`;
      } else {
        if (hasPermission) return;

        if (
          channel.id === process.env.emoteChannelID &&
          url.startsWith("https://7tv.app")
        )
          return;

        if (
          channel.id === process.env.clipChannelID &&
          url.startsWith("https://clips.twitch.tv/")
        )
          return;

        if (url.includes("discord.gg")) {
          ban = true;
          reason = `Usage of a discord url: ${url}`;
        } else {
          if (ignoredChannels.includes(channel.id)) return;

          ban = true;
          reason = `Unauthorized use of a url: ${url}`;
        }
      }
    } else if (bannedWords.includes(content.toLowerCase())) {
      if (hasPermission) return;

      ban = true;
      reason = "Usage of a banned word.";
    } else if (content.toLowerCase().includes("@everyone")) {
      if (hasPermission) return;

      ban = true;
      reason = "Unauthorized use of @everyone.";
    }

    const eventsList = await eventsModel.findOne({
      guildId: guildId,
      Moderation: true,
    });

    if (ban && eventsList) {
      console.log(
        `${consoleTags.app} Deleted a message contained ${reason} in ${channel.name} by ${author.username}.`
      );

      message.delete();

      if (!hasPermission) await warn(client.user, author, guildId, reason);
    } else {
      if (channel.id === process.env.selfpromoChannelID) return;

      if (xpCooldown.has(author.id)) return;
      xpCooldown.add(author.id);

      const levelProfile = await getUser(guildId, author);
      const XP = await calculateXP(message, levelProfile);

      await handleMessageXp(message, XP);

      setTimeout(() => {
        xpCooldown.delete(author.id);
      }, 10_000);
    }
  },
};
