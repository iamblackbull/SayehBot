const { PermissionFlagsBits, Events } = require("discord.js");
const scan = require("../../utils/api/scanUrlApi");
const { bannedWords } = require("../../utils/main/mainUtils");
const { warn } = require("../../utils/main/warnTarget");
const { calculateXP } = require("../../utils/level/handleXPRate");
const { handleMessageXp } = require("../../utils/level/handleLevel");
const Levels = require("discord-xp");

Levels.setURL(process.env.DBTOKEN);

module.exports = {
  name: Events.MessageCreate,

  async execute(message, client) {
    if (message.author.bot) return;
    if (message.webhookId) return;
    if (!message.guild) return;

    const { member, content, channel, author, guild } = message;

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
        reason = "virus url";
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
          reason = "discord url";
        } else {
          if (ignoredChannels.includes(channel.id)) return;

          ban = true;
          reason = "url";
        }
      }
    } else if (bannedWords.includes(content.toLowerCase())) {
      if (hasPermission) return;

      ban = true;
      reason = "text";
    }

    if (ban) {
      console.log(
        `Deleted a message contained a ${reason} in ${channel.name} by ${author.username}.`
      );

      message.delete();

      if (!hasPermission) await warn(client.user, author, guild.id);
    } else {
      if (channel.id === process.env.selfpromoChannelID) return;

      const user = await Levels.fetch(author.id, guild.id);
      const { finalXp } = calculateXP(message, user);

      await handleMessageXp(message, finalXp);
    }
  },
};
