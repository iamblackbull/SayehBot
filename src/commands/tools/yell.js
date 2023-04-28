const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yell")
    .setDescription("Yell at everyone!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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

    const embed = new EmbedBuilder().setDescription(message).setColor(0x25bfc4);
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
  },
};
