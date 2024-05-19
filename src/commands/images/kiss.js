const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kiss")
    .setDescription("Kiss someone")
    .addUserOption((option) => {
      return option
        .setName("user")
        .setDescription("Pick any member")
        .setRequired(true);
    }),

  async execute(interaction, client) {
    const kissed = interaction.options.getUser("user");

    const embed = new EmbedBuilder()
      .setTitle(`Kiss`)
      .setImage(
        `https://cdn.discordapp.com/attachments/946481937537699870/1135648014946549970/machBehet.gif`
      )
      .setDescription(`😍 **${interaction.user}** kissed **${kissed}** 💋`)
      .setColor(0x25bfc4);
      
    await interaction.reply({
      embeds: [embed],
    });
  },
};
