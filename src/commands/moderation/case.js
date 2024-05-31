const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { mongoose } = require("mongoose");
const reportModel = require("../../database/reportModel");
const errorHandler = require("../../utils/main/handleErrors");
const utils = require("../../utils/main/mainUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("case")
    .setDescription(`${utils.tags.mod} Get info about a report case`)
    .addStringOption((option) =>
      option
        .setName("case-id")
        .setDescription("Input a Case ID")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    const CaseId = interaction.options.getString("case-id");
    const reportList = await reportModel.findOne({
      CaseId,
    });

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (!reportList) {
      errorHandler.handleNoResultError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
        ephemeral: true,
      });

      const title = reportList.IsCaseClosed
        ? utils.titles.reportcase_close
        : utils.titles.reportcase_open;

      const closedCaseCheck = reportList.IsCaseClosed
        ? "This case has been closed."
        : "";

      const reporterNotifiedCheck = reportList.IsReporterNotified
        ? "Reporter is notified."
        : "";

      const reason = `**Reason**\n\`\`\`${reportList.Reason}\`\`\`\n**Message**\n\`\`\`${reportList.Message}\`\`\``;
      const description = `${closedCaseCheck}\n${reporterNotifiedCheck}\n\n${reason}`;

      const guild = await client.guilds.fetch(process.env.guildID);
      const reporter = await guild.members.fetch(reportList.ReporterId);
      const target = await guild.members.fetch(reportList.TargetId);
      const action = reportList.Action ?? "none";

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(utils.colors.default)
        .setThumbnail(utils.thumbnails.case)
        .addFields(
          { name: "Reporter", value: `${reporter.user}`, inline: true },
          { name: "Target", value: `${target.user}`, inline: true },
          { name: "Action", value: `${action}`, inline: true }
        )
        .setFooter({
          text: utils.texts.moderation,
          iconURL: utils.footers.moderation,
        });

      await interaction.editReply({
        embeds: [embed],
      });
    }
  },
};
