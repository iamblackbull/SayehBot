const { Events } = require("discord.js");
const { boostChannelID } = process.env;
const boostMessageSent = new Set();

module.exports = {
  name: Events.GuildMemberUpdate,

  async execute(oldMember, newMember, client) {
    const oldStatus = oldMember.premiumSince;
    const newStatus = newMember.premiumSince;

    if (!oldStatus && newStatus) {
      if (boostMessageSent.has(newMember.id)) return;

      boostMessageSent.add(newMember.id);

      client.channels.cache
        .get(boostChannelID)
        .send(
          `🚀 ${newMember.user} just boosted the server! 💜 (+50% XP Boost)`
        );

      setTimeout(() => {
        boostMessageSent.delete(newMember.id);
      }, 10 * 60 * 1000);
    }
  },
};
