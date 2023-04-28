require("dotenv").config();
const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("simjoin")
    .setDescription("Simulate a new member join to server")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction, client) {
    let embed = new EmbedBuilder()
      .setTitle(`Welcome Simulation`)
      .setDescription(`Successfully simulated.`)
      .setColor(0x25bfc4)
      .setThumbnail(
        `https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/768px-Flat_tick_icon.svg.png`
      );

    client.emit("guildMemberAdd", interaction.member);
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
