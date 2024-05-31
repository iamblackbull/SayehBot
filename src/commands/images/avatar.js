const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { texts, colors, footers } = require("../../utils/main/mainUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get a user avatar")
    .addUserOption((option) =>
      option.setName("user").setDescription("Pick a member").setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
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
