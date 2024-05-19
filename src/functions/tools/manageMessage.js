const { PermissionFlagsBits, Events } = require("discord.js");
const scan = require("../../utils/api/scanUrlApi");
const { bannedWords } = require("../../utils/main/mainUtils");
const { calculateXP } = require("../../utils/level/handleXPRate");
const { handleMessageXp } = require("../../utils/level/handleLevel");
const Levels = require("discord-xp");

Levels.setURL(process.env.DBTOKEN);

module.exports = (client) => {
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.webhookId) return;
    if (!message.guild) return;

    const member = message.member;
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
    const match = message.content.match(urlRegex);

    if (match) {
      const url = match[0];

      const { virus } = await scan(url);

      if (virus) {
        ban = true;
        reason = "virus url";
      } else {
        if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

        if (
          message.channel.id === process.env.emoteChannelID &&
          url.startsWith("https://7tv.app")
        )
          return;

        if (
          message.channel.id === process.env.clipChannelID &&
          url.startsWith("https://clips.twitch.tv/")
        )
          return;

        if (url.includes("discord.gg")) {
          ban = true;
          reason = "discord url";
        } else {
          if (ignoredChannels.includes(message.channel.id)) return;
          else {
            ban = true;
            reason = "url";
          }
        }
      }
    } else if (bannedWords.includes(message.content.toLowerCase())) {
      if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
      else {
        ban = true;
        reason = "text";
      }
    }

    if (ban) {
      console.log(
        `Deleted a message contained a ${reason} in ${message.channel.name} by ${message.author.username}.`
      );

      message.delete();
    } else {
      if (message.channel.id === process.env.selfpromoChannelID) return;

      const user = await Levels.fetch(message.author.id, message.guild.id);
      const { finalXp } = calculateXP(message, user);

      await handleMessageXp(message, finalXp);
    }
  });
};
