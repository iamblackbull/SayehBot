const { AttachmentBuilder, Events } = require("discord.js");
const eventsModel = require("../../database/eventsModel");
const channelModel = require("../../database/channelModel");
const { generateWelcomeCard } = require("../../utils/level/generateCard");
const { consoleTags } = require("../../utils/main/mainUtils");

const welcomeMessageSent = new Set();

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    const { guild, user } = member;
    const { memberCount } = guild;

    if (welcomeMessageSent.has(member.id)) return;
    welcomeMessageSent.add(member.id);

    const eventsList = await eventsModel.findOne({
      guildId: guild.id,
      MemberAdd: true,
    });
    if (!eventsList) return;

    const channelsList = await channelModel.findOne({
      guildId: guild.id,
    });
    if (!channelsList) return;

    const channelId = channelsList.welcomeId;
    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) return;

    const role = member.guild.roles.cache.find(
      (role) => role.id === process.env.welcomeRoleID
    );
    if (!role) return;

    await member.roles.add(role);

    const welcomeCanvas = await generateWelcomeCard(user, memberCount);

    const attachment = new AttachmentBuilder(welcomeCanvas.toBuffer());

    const specialContent =
      memberCount == "2000" ? `Our **${memberCount}** member!` : "";

    const content = `Zalaaam ${user}, Welcome to **${guild.name}**'s server! ${specialContent}`;

    console.log(`${consoleTags.app} ${user.username} joined the server.`);

    setTimeout(async () => {
      await channel.send({
        content: content,
        files: [attachment],
      });
    }, 5_000);

    setTimeout(() => {
      welcomeMessageSent.delete(member.id);
    }, 600_000);
  },
};
