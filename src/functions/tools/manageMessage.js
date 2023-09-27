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

    const ignoredChannels = [
      "1108179905184809050",
      "791350432696893440",
      "744591209359474728",
      "744572773510152273",
      "876589808154202233",
      "942822276443824162",
    ];
    const bannedWords = [
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
    ];

    if (message.content.toLowerCase().includes("http")) {
      if (ignoredChannels.includes(message.channel.id)) return;
      if (
        message.channel.id === `1114678090887606302` &&
        message.content.toLowerCase().startsWith("https://7tv.app")
      )
        return;
      if (
        message.channel.id === `870758451062640700` &&
        message.content.toLowerCase().startsWith("https://clips.twitch.tv/")
      )
        return;
      if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
      else {
        banned = true;
        type = "link";
      }
    } else if (bannedWords.includes(message.content.toLowerCase())) {
      if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
      else {
        banned = true;
        type = "text";
      }
    }

    if (banned) {
      console.log(
        `Deleted a message contained a ${type} in ${message.channel.name} by ${message.author.username}.`
      );

      message.delete();
    } else {
      if (message.channel.id === "791350432696893440") return;

      function getRandomXp() {
        return Math.floor(Math.random() * 50 + 15);
      }

      let firstXp;

      do {
        firstXp = getRandomXp();
      } while (firstXp === cacheXp);

      const rawXp = parseInt(firstXp * 2);

      const roleMultipliers = new Map([
        [subRole1, 1.2],
        [subRole2, 1.5],
        [subRole3, 2],
      ]);

      let finalXp = parseInt(rawXp);

      if (user.level < 60 || !user.level || user.level !== undefined) {
        for (const [role, multiplier] of roleMultipliers) {
          if (message.member.roles.cache.has(role)) {
            finalXp = parseInt(rawXp * multiplier);
            break;
          } else {
            finalXp = parseInt(rawXp); //30 to 100
            break;
          }
        }
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
