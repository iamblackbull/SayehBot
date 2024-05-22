const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
} = require("discord.js");
const { texts, colors, footers } = require("../../utils/main/mainUtils");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("get avatar")
    .setType(ApplicationCommandType.User),

  async execute(interaction, client) {
    const user = interaction.user;
    const avatar = user.displayAvatarURL({ size: 1024, dynamic: true });

    const embed = new EmbedBuilder()
      .setAuthor({ name: user.username, iconURL: avatar, url: avatar })
      .setImage(avatar)
      .setColor(colors.default)
      .setFooter({
        text: texts.tools,
        iconURL: footers.tools,
      });

    await interaction.reply({
      embeds: [embed],
    });
  },
};
