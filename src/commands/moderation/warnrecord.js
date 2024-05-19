const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const warnModel = require("../../schemas/warn-schema");
const utils = require("../../utils/main/mainUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnrecord")
    .setDescription("Check your warning record in this server.")
    .setDMPermission(false),

  async execute(interaction, client) {
    const { guild, user } = interaction;

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
        ephemeral: true,
      });

      const warnRecord = await warnModel.find({
        guildId: guild.id,
        UserId: user.id,
      });

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.warnrecord)
        .setColor(utils.colors.warning)
        .setFooter({
          text: utils.texts.moderation,
          iconURL: utils.footers.moderation,
        });

      if (!warnRecord || warnRecord.Warns < 1) {
        embed
          .setDescription("You haven't been warned in this server yet.")
          .setThumbnail(utils.thumbnails.success);
      } else {
        const warns = warnRecord.Warns;

        const nextPenalty =
          warns < 10
            ? `### Next Warn Penalty:\n- ${utils.warnPenalties[warns].label}`
            : "";

        embed
          .setDescription(
            `You have been warned **${warns}** times in this server!\n${nextPenalty}`
          )
          .setThumbnail(utils.thumbnails.warning);
      }

      await interaction.editReply({
        embeds: [embed],
      });
    }
  },
};
