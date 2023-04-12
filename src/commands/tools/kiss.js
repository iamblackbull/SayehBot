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
        `https://media.discordapp.net/attachments/987957471207370772/1011684474536329357/ezgif.com-gif-maker_30.gif`
      )
      .setDescription(`😍 **${interaction.user}** kissed **${kissed}** 💋`)
      .setColor(0x25bfc4);
    await interaction.reply({
      embeds: [embed],
    });
  },
};
