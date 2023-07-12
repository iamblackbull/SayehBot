const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Returns user avatar")
    .addUserOption((option) => {
      return option
        .setName("user")
        .setDescription("Pick any member")
        .setRequired(false);
    }),
  async execute(interaction, client) {
    const user = interaction.options.getUser("user") || interaction.user;
    const avatar = user.displayAvatarURL({ size: 1024, dynamic: true });

    const embed = new EmbedBuilder()
      .setAuthor({ name: user.username, iconURL: avatar, url: avatar })
      .setColor(0x25bfc4)
      .setImage(avatar);

    await interaction.reply({
      embeds: [embed],
    });
  },
};
