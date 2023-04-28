const { PermissionsBitField } = require("discord.js");
require("dotenv").config();
const { DBTOKEN, rankChannelID, subRole1, subRole2, subRole3 } = process.env;
const Levels = require("discord-xp");
Levels.setURL(DBTOKEN);

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    const { guild } = message;
    const member = message.member;
    const channel = guild.channels.cache.get(rankChannelID);
    const user = await Levels.fetch(message.author.id, message.guild.id);
    let firstXp = parseInt(Math.floor(Math.random() * 35 + 10));
    if (firstXp > 35) {
      firstXp = 35;
    }
    if (firstXp < 10) {
      firstXp = 10;
    }
    const randomXp = parseInt(firstXp * 2);
    let finalXp;

    if (user.level < 60) {
      if (message.member.roles.cache.has(subRole1)) {
        finalXp = parseInt(randomXp * 1.2);
      } else if (message.member.roles.cache.has(subRole2)) {
        finalXp = parseInt(randomXp * 1.5);
      } else if (message.member.roles.cache.has(subRole3)) {
        finalXp = parseInt(randomXp * 2);
      } else {
        finalXp = parseInt(randomXp);
      }
      const hasLevelUp = await Levels.appendXp(
        message.author.id,
        message.guild.id,
        finalXp
      );
      console.log(`${message.author.tag} gained ${finalXp} XP.`);
      if (hasLevelUp) {
        const user = await Levels.fetch(message.author.id, message.guild.id);
        console.log(
          `${message.author.tag} just advanced to level ${user.level}.`
        );
        await channel.send(
          `🎊 ${message.author} just advanced to level **${user.level}** 🙌`
        );
      }
    } else if (!user.level) {
      const hasLevelUp = await Levels.appendXp(
        message.author.id,
        message.guild.id,
        randomXp
      );
      console.log(`${message.author.tag} gained ${randomXp} XP.`);

      if (hasLevelUp) {
        const user = await Levels.fetch(message.author.id, message.guild.id);
        console.log(
          `${message.author.tag} just advanced to level ${user.level}.`
        );
        await channel.send(
          `🎊 ${message.author} just advanced to level **${user.level}** 🙌`
        );
      }
    }
    if (message.content.toLowerCase().includes("https")) {
      if (message.channel.id === `791350432696893440`) return;
      if (message.channel.id === `744591209359474728`) return;
      if (message.channel.id === `744572773510152273`) return;
      if (message.channel.id === `876589808154202233`) return;
      if (message.channel.id === `942822276443824162`) return;
      else if (member.permissions.has(PermissionsBitField.Flags.ManageMessages))
        return;
      else {
        console.log(
          `Deleted a message included a link in ${message.channel.name} by ${message.author}`
        );
        message.delete();
      }
    }

    if (
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
      ].includes(message.content.toLowerCase())
    ) {
      if (member.permissions.has(PermissionsBitField.Flags.ManageMessages))
        return;
      else {
        console.log(
          `Deleted a message included banned word in ${message.channel.name} by ${message.author}`
        );
        message.delete();
      }
    }
  });
};
