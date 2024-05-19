const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kish")
    .setDescription("Kish someone")
    .addUserOption((option) => {
      return option
        .setName("user")
        .setDescription("Pick any member")
        .setRequired(true)
    }),

  async execute(interaction, client) {
    const kished = interaction.options.getUser("user");

    const embed = new EmbedBuilder()
    .setTitle(`Kish`)
    .setImage(`https://cdn.discordapp.com/attachments/760838336205029416/1032995921497161818/kshhh2.gif`)
    .setDescription(`😍 **${interaction.user}** kiiiisssshed **${kished}** :heart_hands:`)
    .setColor(0x25bfc4);
    
    await interaction.reply({
      embeds: [embed],
    });
  },
};