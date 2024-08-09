const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const { clear } = require("../../utils/main/warnTarget");
const utils = require("../../utils/main/mainUtils");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearwarns")
    .setDescription(
      `${utils.tags.mod} Clear all warnings of a user in this server`
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Pick a member to clear their warns")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    let success = false;
    const { guild, options, user } = interaction;
    const target = options.getUser("user");

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      await clear(user, target, guild.id);

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.clear)
        .setDescription(`Warning records of ${target} has been cleared.`)
        .setColor(utils.colors.warning)
        .setThumbnail(utils.thumbnails.success)
        .setFooter({
          text: utils.texts.moderation,
          iconURL: utils.footers.moderation,
        });

      console.log(
        `${utils.consoleTags.app} ${user.username} cleared warning records of ${target.username}.`
      );

      await interaction.editReply({
        embeds: [embed],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, 10);
  },
};
