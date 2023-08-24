const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  isNew: true,
  data: new SlashCommandBuilder()
    .setName("spank")
    .setDescription("Spank someone")
    .addUserOption((option) => {
      return option
        .setName("user")
        .setDescription("Pick any member")
        .setRequired(true)
    }),
  async execute(interaction, client) {
    const spanked = interaction.options.getUser("user")
    const embed = new EmbedBuilder()
    .setTitle(`Spank`)
    .setImage(`https://cdn.discordapp.com/attachments/946481937537699870/1135622929384755340/Spank.gif`)
    .setDescription(`🍑 **${interaction.user}** spanked **${spanked}** 💦`)
    .setColor(0x25bfc4);
    await interaction.reply({
      embeds: [embed],
    });
  },
};