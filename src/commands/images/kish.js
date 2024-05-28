const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { gifs, colors } = require("../../utils/main/mainUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kish")
    .setDescription("Kish someone")
    .addUserOption((option) =>
      option.setName("user").setDescription("Pick a member").setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user");

    const embed = new EmbedBuilder()
      .setDescription(
        `😍 **${interaction.user}** kiiiisssshed **${target}** :heart_hands:`
      )
      .setThumbnail(gifs.kish)
      .setColor(colors.default);

    await interaction.reply({
      embeds: [embed],
    });
  },
};
