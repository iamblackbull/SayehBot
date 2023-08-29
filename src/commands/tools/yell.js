const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yell")
    .setDescription("Yell at everyone in a specific channel!")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((option) => {
      return option
        .setName("channel")
        .setDescription("Select a channel to yell in.")
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName("message")
        .setDescription("Input a message to announce.")
        .setRequired(true);
    })
    .setDMPermission(false),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message");

    const embed = new EmbedBuilder().setDescription(message).setColor(0x25bfc4);

    await channel.send({
      content: `📢 Hey @everyone , ${interaction.user} yells: `,
      embeds: [embed],
    });

    const respond = new EmbedBuilder()
      .setTitle(`Yell`)
      .setDescription(`Message has been sent successfully.`)
      .setColor(0x25bfc4)
      .setThumbnail(
        `https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/768px-Flat_tick_icon.svg.png`
      );
      
    await interaction.reply({
      embeds: [respond],
      ephemeral: true,
    });
  },
};
