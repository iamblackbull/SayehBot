const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { mongoose } = require("mongoose");
const eventsModel = require("../../database/eventsModel");
const errorHandler = require("../../utils/main/handleErrors");
const { warn } = require("../../utils/main/warnTarget");
const utils = require("../../utils/main/mainUtils");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription(`${utils.tags.mod} Warn a user`)
    .addUserOption((option) =>
      option.setName("user").setDescription("Pick a member").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    let success = false;
    const { guild, options, user } = interaction;
    const target = options.getUser("user");
    const targetId = target.id;

    const member = await guild.members.fetch(targetId);
    const hasPermission = member.permissions.has(
      PermissionFlagsBits.ManageMessages
    );

    const eventsList = await eventsModel.findOne({
      guildId: guild.id,
      Moderation: true,
    });

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (hasPermission || targetId == user.id) {
      errorHandler.handleWarnError(interaction);
    } else if (!eventsList) {
      errorHandler.handleDisabledError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      const { warnSuccess, warns } = await warn(user, target, guild.id);

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

    handleNonMusicalDeletion(interaction, success, undefined, 5);
  },
};
