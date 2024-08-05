const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const { warn } = require("../../utils/main/warnTarget");
const utils = require("../../utils/main/mainUtils");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("warn author")
    .setType(ApplicationCommandType.Message)
    .setDMPermission(false),

  async execute(interaction) {
    let success = false;
    const { guild, channel, user, targetId } = interaction;

    const member = await guild.members.fetch(user.id);
    const hasPermission = member.permissions.has(
      PermissionFlagsBits.ManageMessages
    );

    const msg = await channel.messages.fetch(targetId);
    const targatHasPermission = msg.member.permissions.has(
      PermissionFlagsBits.ManageMessages
    );

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (!hasPermission) {
      errorHandler.handleAccessDeniedError(interaction);
    } else if (targatHasPermission || targetId == user.id) {
      errorHandler.handleWarnError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      const { author } = msg;
      const reason = "Warned by a moderator.";
      const { warnSuccess, warns } = await warn(user, author, guild.id, reason);

      success = warnSuccess;

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.warn)
        .setDescription(
          `${author} has been warned.\nTotal Warnings: **${warns}**`
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

    handleNonMusicalDeletion(interaction, success, 10);
  },
};
