const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const { clear } = require("../../utils/main/warnTarget");
const utils = require("../../utils/main/mainUtils");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearwarns")
    .setDescription("Clear all warnings of a user in this server.")
    .addUserOption((option) => {
      return option
        .setName("user")
        .setDescription("Pick any member to clear their warns.")
        .setRequired(true);
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    let success = false;
    const { guild, options, user } = interaction;
    const target = options.getUser("user");

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      await clear(user, target, guild);

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.clear)
        .setDescription(`Warning record of ${target} has been cleared.`)
        .setColor(utils.colors.warning)
        .setThumbnail(utils.thumbnails.success)
        .setFooter({
          text: utils.texts.moderation,
          iconURL: utils.footers.moderation,
        });

      success = true;

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
