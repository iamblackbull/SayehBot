const { Events } = require("discord.js");
const eventsModel = require("../../database/eventsModel");
const channelModel = require("../../database/channelModel");
const { deleteUser } = require("../../utils/level/handleLevel");
const { consoleTags } = require("../../utils/main/mainUtils");

const leaveMessageSent = new Set();

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(member) {
    const { guild, user } = member;

    if (leaveMessageSent.has(member.id)) return;
    leaveMessageSent.add(member.id);

    const eventsList = await eventsModel.findOne({
      guildId: guild.id,
      MemberRemove: true,
    });
    if (!eventsList) return;

    const channelsList = await channelModel.findOne({
      guildId: guild.id,
    });
    if (!channelsList) return;

    const channelId = channelsList.leaveId;
    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) return;

    console.log(`${consoleTags.app} ${user.username} left the server.`);

    setTimeout(async () => {
      await channel.send({
        content: `**${user.username}** left the server.`,
      });
    }, 3_000);

    await deleteUser(guild.id, user.id);

    setTimeout(() => {
      leaveMessageSent.delete(member.id);
    }, 600_000);
  },
};
