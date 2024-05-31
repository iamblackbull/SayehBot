const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { gifs, colors } = require("../../utils/main/mainUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("spank")
    .setDescription("Spank someone")
    .addUserOption((option) =>
      option.setName("user").setDescription("Pick a member").setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user");

    const embed = new EmbedBuilder()
      .setDescription(`🍑 **${interaction.user}** spanked **${target}** 💦`)
      .setImage(gifs.spank)
      .setColor(colors.default);

    await interaction.reply({
      embeds: [embed],
    });
  },
};
