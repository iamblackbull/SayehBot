const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const { warn } = require("../../utils/main/warnTarget");
const utils = require("../../utils/main/mainUtils");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a user.")
    .addUserOption((option) => {
      return option
        .setName("user")
        .setDescription("Pick any member to warn.")
        .setRequired(true);
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    let success = false;
    const { guild, options, user } = interaction;
    const target = options.getUser("user");

    const member = await interaction.guild.members.fetch(target.id);
    const hasPermission = member.permissions.has(
      PermissionFlagsBits.ManageMessages
    );

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (hasPermission || target.id == interaction.user.id) {
      errorHandler.handleWarnError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      const { warnSuccess, warns } = await warn(user, target, guild);

      success = warnSuccess;

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.warn)
        .setDescription(
          `${target} has been warned.\nTotal Warnings: **${warns}**`
        )
        .setColor(utils.colors.warning)
        .setThumbnail(utils.thumbnails.success)
        .setFooter({
          text: utils.texts.moderation,
          iconURL: utils.footers.moderation,
        });

      await interaction.editReply({
        embeds: [embed],
      });
    }
    deletionHandler.handleNonMusicalDeletion(
      interaction,
      success,
      undefined,
      5
    );
  },
};
