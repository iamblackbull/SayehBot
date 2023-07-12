const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("get avatar")
    .setType(ApplicationCommandType.User),
  async execute(interaction, client) {
    const user = interaction.options.getUser("user") || interaction.user;
    const avatar = user.displayAvatarURL({ size: 1024, dynamic: true });

    const embed = new EmbedBuilder()
      .setAuthor({ name: user.username, iconURL: avatar, url: avatar })
      .setImage(avatar);

    await interaction.reply({
      embeds: [embed],
    });
  },
};
