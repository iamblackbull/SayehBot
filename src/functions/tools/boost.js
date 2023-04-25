require("dotenv").config();
const { boostChannelID, rankChannelID, guildID } = process.env;
const Levels = require("discord-xp");

module.exports = (client) => {
  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const oldStatus = oldMember.premiumSince;
    const newStatus = newMember.premiumSince;
    const guild = await client.guilds.fetch(guildID).catch(console.error);
    const channel = guild.channels.cache.get(rankChannelID);

    if (!oldStatus && newStatus) {
      client.channels.cache
        .get(boostChannelID)
        .send(`🚀 ${newMember.user} just boosted the server! 💜`);
      const user = await Levels.fetch(newMember.user.id, newMember.guild.id);
      if (1 < user.level < 60) {
        try {
          const neededXp = Levels.xpFor(parseInt(user.level + 1));
          const XP = neededXp + 1;
          const hasLevelUp = await Levels.appendXp(
            newMember.user.id,
            newMember.guild.id,
            XP
          );
          console.log(`${newMember.user.tag} gained ${XP} XP for boosting the server.`);
          if (hasLevelUp) {
            const user = await Levels.fetch(
              newMember.user.id,
              newMember.guild.id
            );
            console.log(
              `${newMember.user.tag} just advanced to level ${user.level}`
            );
            channel.send(
              `🎊 ${newMember.user} just advanced to level **${user.level}** 🙌`
            );
          }
        } catch (error) {
          console.log(
            `Failed to give ${XP} XP to the booster ${newMember.user.tag}`
          );
        }
      }
    } else return;
  });
};
