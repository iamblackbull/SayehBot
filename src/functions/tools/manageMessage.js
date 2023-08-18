const { PermissionFlagsBits } = require("discord.js");
require("dotenv").config();
const { DBTOKEN, rankChannelID, subRole1, subRole2, subRole3 } = process.env;
const Levels = require("discord-xp");
Levels.setURL(DBTOKEN);
let cacheXp = 0;

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    const { guild } = message;
    const member = message.member;
    const channel = guild.channels.cache.get(rankChannelID);
    const user = await Levels.fetch(message.author.id, message.guild.id);
    let banned = false;
    let type;
    if (message.content.toLowerCase().includes("http")) {
      const ignoredChannels = [
        "1108179905184809050",
        "870758451062640700",
        "791350432696893440",
        "744591209359474728",
        "744572773510152273",
        "876589808154202233",
        "942822276443824162",
      ];
      if (ignoredChannels.includes(message.channel.id)) return;
      if (
        message.channel.id === `1114678090887606302` &&
        message.content.toLowerCase().startsWith("https://7tv.app")
      )
        return;
      if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
      else {
        banned = true;
        type = "link";
      }
    } else if (
      [
        "kos",
        "kir",
        "kun",
        "dick",
        "pussy",
        "ass",
        "boobs",
        "sex",
        "fuck",
        "porn",
        "nude",
        "horny",
        "کص",
        "کیر",
        "کون",
        "دیک",
        "پوسی",
        "کصکش",
        "ممه",
        "سکس",
        "گایید",
        "پورن",
        "حشری",
      ].includes(message.content.toLowerCase())
    ) {
      if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
      else {
        banned = true;
        type = "text";
      }
    }
    if (banned) {
      switch (type) {
        case "text":
          console.log(
            `Deleted a message contained a banned word in ${message.channel.name} by ${message.author.username}`
          );
          break;
        case "link":
          console.log(
            `Deleted a message contained a link in ${message.channel.name} by ${message.author.username}`
          );
          break;
      }
      message.delete();
    } else {
      if (message.channel.id === "791350432696893440") return;

      let firstXp = parseInt(Math.floor(Math.random() * 32 + 7));

      while (firstXp === cacheXp) {
        firstXp = parseInt(Math.floor(Math.random() * 32 + 7));
      }

      const rawXp = parseInt(firstXp * 2);
      let finalXp;

      if (user.level < 60) {
        if (message.member.roles.cache.has(subRole1)) {
          finalXp = parseInt(rawXp * 1.2); //16 to 76
        } else if (message.member.roles.cache.has(subRole2)) {
          finalXp = parseInt(rawXp * 1.5); //21 to 96
        } else if (message.member.roles.cache.has(subRole3)) {
          finalXp = parseInt(rawXp * 2); //28 to 128
        } else {
          finalXp = parseInt(rawXp); //14 to 64
        }
      } else if (!user.level || user.level === undefined) {
        finalXp = parseInt(rawXp); //14 to 64
      }
      const hasLevelUp = await Levels.appendXp(
        message.author.id,
        message.guild.id,
        finalXp
      );
      console.log(`${message.author.username} gained ${finalXp} XP.`);
      if (hasLevelUp) {
        const user = await Levels.fetch(message.author.id, message.guild.id);
        console.log(
          `${message.author.username} just advanced to Level ${user.level}.`
        );
        await channel.send(
          `🎊 ${message.author} just advanced to Level **${user.level}** 🙌`
        );
      }
    }
  });
};
