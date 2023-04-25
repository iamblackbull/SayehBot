const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("fuch user")
    .setType(ApplicationCommandType.User),
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle(`Fuch`)
      .setImage(
        `https://cdn.discordapp.com/attachments/760838336205029416/1032933649395499009/SEXO.gif`
      )
      .setDescription(
        `😠💢 **${interaction.user}** fuched **${interaction.targetUser}** 🪑`
      )
      .setColor(0x25bfc4);
    await interaction.reply({
      embeds: [embed],
    });
  },
};
