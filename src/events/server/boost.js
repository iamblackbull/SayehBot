const { Events } = require("discord.js");
const eventsModel = require("../../database/eventsModel");
const { consoleTags } = require("../../utils/main/mainUtils");

const boostMessageSent = new Set();

module.exports = {
  name: Events.GuildMemberUpdate,

  async execute(oldMember, newMember, client) {
    const eventsList = await eventsModel.findOne({
      guildId: newMember.guild.id,
      MemberUpdate: true,
    });
    if (!eventsList) return;

    const oldStatus = oldMember.premiumSince;
    const newStatus = newMember.premiumSince;

    if (!oldStatus && newStatus) {
      const { id, user } = newMember;

      if (boostMessageSent.has(id)) return;
      boostMessageSent.add(id);

      client.channels.cache
        .get(process.env.boostChannelID)
        .send(`🚀 ${user} just boosted the server! 💜 (+50% XP Boost)`);

      console.log(`${consoleTags.app} ${user.username} boosted the server.`);

      setTimeout(() => {
        boostMessageSent.delete(id);
      }, 10 * 60 * 1000);
    }
  },
};
