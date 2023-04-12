const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("finger")
    .setDescription("Show finger to someone")
    .addUserOption((option) => {
      return option
        .setName("user")
        .setDescription("Pick any member")
        .setRequired(true);
    }),
  async execute(interaction, client) {
    const kissed = interaction.options.getUser("user");
    const embed = new EmbedBuilder()
      .setTitle(`Finger`)
      .setImage(
        `https://cdn.discordapp.com/attachments/760838336205029416/1032933675018485780/SayehFinger.gif`
      )
      .setDescription(
        `😠💢 **${interaction.user}** said :middle_finger: to **${kissed}**`
      )
      .setColor(0x25bfc4);
    await interaction.reply({
      embeds: [embed],
    });
  },
};
