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
    let firstXp = parseInt(Math.floor(Math.random() * 30 + 5));
    if (firstXp === cacheXp) {
      firstXp = parseInt(Math.floor(Math.random() * 30 + 5));
    }
    cacheXp = firstXp;
    const randomXp = parseInt(firstXp * 2);
    let finalXp;

    if (user.level < 60) {
      if (message.member.roles.cache.has(subRole1)) {
        finalXp = parseInt(randomXp * 1.2); //12 to 72
      } else if (message.member.roles.cache.has(subRole2)) {
        finalXp = parseInt(randomXp * 1.5); //15 to 90
      } else if (message.member.roles.cache.has(subRole3)) {
        finalXp = parseInt(randomXp * 2); //20 to 120
      } else {
        finalXp = parseInt(randomXp); //10 to 60
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
    if (message.content.toLowerCase().includes("http")) {
      if (message.channel.id === `1114678090887606302`) {
        if (message.content.toLowerCase().startsWith("https://7tv.app")) return;
        else {
          message.delete();
        }
      }
      if (message.channel.id === `1108179905184809050`) return;
      if (message.channel.id === `870758451062640700`) return;
      if (message.channel.id === `791350432696893440`) return;
      if (message.channel.id === `744591209359474728`) return;
      if (message.channel.id === `744572773510152273`) return;
      if (message.channel.id === `876589808154202233`) return;
      if (message.channel.id === `942822276443824162`) return;
      else if (member.permissions.has(PermissionFlagsBits.ManageMessages))
        return;
      else {
        console.log(
          `Deleted a message contained a link in ${message.channel.name} by ${message.author.tag}`
        );
        message.delete();
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
      if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
      else {
        console.log(
          `Deleted a message contained a banned word in ${message.channel.name} by ${message.author.tag}`
        );
        message.delete();
      }
    } else return;
  });
};
