require("dotenv").config();
const { Moderators, Gigulebalaha, ShadowxRole, HamitzRole } = process.env;
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("simjoin")
    .setDescription("Simulate a new member join (moderators-only)"),
  async execute(interaction, client) {
    const member = interaction.member;

    let failedEmbed = new EmbedBuilder();

    if (!member.roles.cache.has(Gigulebalaha || ShadowxRole || HamitzRole)) {
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
    }
  },
};
