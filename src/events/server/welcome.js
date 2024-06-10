const { AttachmentBuilder, Events } = require("discord.js");
const { welcomeRoleID, guildID } = process.env;
const eventsModel = require("../../database/eventsModel");
const { getChannelId } = require("../../commands/server/setwelcome");
const { generateWelcomeCard } = require("../../utils/level/generateCard");
const { consoleTags } = require("../../utils/main/mainUtils");

const welcomeMessageSent = new Set();

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    const { guild, user } = member;
    const { memberCount } = guild;

    const eventsList = await eventsModel.findOne({
      guildId: guild.id,
      MemberAdd: true,
    });
    if (!eventsList) return;

    if (welcomeMessageSent.has(member.id)) return;
    welcomeMessageSent.add(member.id);

    const channelId = getChannelId(guildID);
    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) return;

    const role = member.guild.roles.cache.find(
      (role) => role.id === welcomeRoleID
    );
    if (!role) return;

    await member.roles.add(role);

    const { welcomeCanvas } = await generateWelcomeCard(user, memberCount);

    const attachment = new AttachmentBuilder(welcomeCanvas.toBuffer());

    const specialContent =
      memberCount == "2000" ? `Our **${memberCount}** member!` : "";

    const content = `Zalaaam ${user}, Welcome to **${guild.name}**'s server! ${specialContent}`;

    console.log(`${consoleTags.app} ${user.username} joined the server.`);

    const msg = channel.send({
      content: content,
    });

    setTimeout(async () => {
      await msg?.edit({
        files: [attachment],
      });
    }, 2 * 1000);

    setTimeout(() => {
      welcomeMessageSent.delete(member.id);
    }, 10 * 60 * 1000);
  },
};
