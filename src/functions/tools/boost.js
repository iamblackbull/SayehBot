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
      if (!user.level || user.level === 0) return;
      const neededXp = Levels.xpFor(parseInt(user.level + 1));
      const gainedXp = Levels.xpFor(parseInt(user.level));
      const XP = neededXp - gainedXp + 1;

      if (1 < user.level < 60) {
        try {
          const hasLevelUp = await Levels.appendXp(
            newMember.user.id,
            newMember.guild.id,
            XP
          );
          console.log(
            `${newMember.user.username} gained ${XP} XP for boosting the server.`
          );
          if (hasLevelUp) {
            const user = await Levels.fetch(
              newMember.user.id,
              newMember.guild.id
            );
            console.log(
              `${newMember.user.username} just advanced to Level ${user.level}`
            );
            channel.send(
              `🎊 ${newMember.user} just advanced to Level **${user.level}** 🙌`
            );
          }
        } catch (error) {
          console.log(
            `Failed to give ${XP} XP to the booster ${newMember.user.username}`
          );
        }
      }
    } else return;
  });
};
