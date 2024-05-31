const { Events } = require("discord.js");
const eventsModel = require("../../database/eventsModel");
const { consoleTags } = require("../../utils/main/mainUtils");

const leaveMessageSent = new Set();

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(member) {
    const { guild, user } = member;

    const channel = guild.channels.cache.get(process.env.leaveChannelID);
    if (!channel) return;

    const eventsList = await eventsModel.findOne({
      guildId: guild.id,
      MemberRemove: true,
    });
    if (!eventsList) return;

    if (leaveMessageSent.has(member.id)) return;
    leaveMessageSent.add(member.id);

    console.log(`${consoleTags.app} ${user.username} left the server.`);

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
