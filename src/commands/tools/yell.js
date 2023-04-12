require("dotenv").config();
const { ShadowxRole, HamitzRole } = process.env;
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yell")
    .setDescription("Yell at everyone! (moderators-only)")
    .addChannelOption((option) => {
      return option
        .setName("channel")
        .setDescription("Select a channel")
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName("message")
        .setDescription("Input the message you want to announce")
        .setRequired(true);
    }),
  async execute(interaction, client) {
    const channel = interaction.options.getChannel("channel");
    const member = interaction.member;
    const message = interaction.options.getString("message");

    let failedEmbed = new EmbedBuilder();

    if (!member.roles.cache.has(ShadowxRole || HamitzRole)) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(`You don't have the required role!`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.reply({
        embeds: [failedEmbed],
        ephemeral: true,
      });
    } else {
      const embed = new EmbedBuilder()
        .setDescription(message)
        .setColor(0x25bfc4);
      await channel.send({
        content: `📢 Hey @everyone , ${interaction.user} yells: `,
        embeds: [embed],
      });
      const embed2 = new EmbedBuilder()
        .setTitle(`Yell`)
        .setDescription(`Message has been sent successfully.`)
        .setColor(0x25bfc4)
        .setThumbnail(
          `https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/768px-Flat_tick_icon.svg.png`
        );
      await interaction.reply({
        embeds: [embed2],
        ephemeral: true,
      });
    }
  },
};
