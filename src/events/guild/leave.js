const { Events } = require("discord.js");
const { leaveChannelID } = process.env;

const leaveMessageSent = new Set();

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(member) {
    if (leaveMessageSent.has(member.id)) return;
    leaveMessageSent.add(member.id);

    const { guild, user } = member;
    const channel = guild.channels.cache.get(leaveChannelID);

    console.log(`${user.username} left the server.`);

    setTimeout(async () => {
      await channel.send({
        content: `**${user.username}** left the server.`,
      });
    }, 2 * 1000);

    setTimeout(() => {
      leaveMessageSent.delete(member.id);
    }, 10 * 60 * 1000);
  },
};
