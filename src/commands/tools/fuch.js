const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fuch")
    .setDescription("Fuch someone")
    .addUserOption((option) => {
      return option
        .setName("user")
        .setDescription("Pick any member")
        .setRequired(true)
    }),
  async execute(interaction, client) {
    const kissed = interaction.options.getUser("user")
    const embed = new EmbedBuilder()
    .setTitle(`Fuch`)
    .setImage(`https://cdn.discordapp.com/attachments/760838336205029416/1032933649395499009/SEXO.gif`)
    .setDescription(`😠💢 **${interaction.user}** fuched **${kissed}** 🪑`)
    .setColor(0x25bfc4);
    await interaction.reply({
      embeds: [embed],
    });
  },
};