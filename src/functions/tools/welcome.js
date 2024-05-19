const { AttachmentBuilder } = require("discord.js");
const { welcomeRoleID, leaveChannelID, guildID } = process.env;
const { getChannelId } = require("../../commands/server/setwelcome");
const { generateWelcomeCard } = require("../../utils/level/generateCard");

const welcomeMessageSent = new Set();
const leaveMessageSent = new Set();

module.exports = (client) => {
  client.on("guildMemberAdd", async (member) => {
    if (welcomeMessageSent.has(member.id)) return;
    welcomeMessageSent.add(member.id);

    const { guild, user } = member;
    const { memberCount } = guild;

    const channelId = getChannelId(guildID);
    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) return;

    const role = member.guild.roles.cache.find(
      (role) => role.id === welcomeRoleID
    );
    member.roles.add(role);

    const { welcomeCanvas } = await generateWelcomeCard(user, memberCount);

    const attachment = new AttachmentBuilder(welcomeCanvas.toBuffer());

    const specialContent =
      memberCount == "2000" ? `Our **${memberCount}** member!` : "";

    const content = `Zalaaam ${user}, Welcome to **${guild.name}**'s server! ${specialContent}`;

    console.log(
      `${user.username} (Member #${memberCount}) just joined the server.`
    );

    const msg = await channel.send({
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
  });

  client.on("guildMemberRemove", async (member) => {
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
  });
};
