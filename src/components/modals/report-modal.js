const { EmbedBuilder } = require("discord.js");
const reportModel = require("../../database/reportModel");
const { notifyModeratos } = require("../../utils/main/handleReports");
const utils = require("../../utils/main/mainUtils");

module.exports = {
  data: {
    name: "report-modal",
  },

  async execute(interaction) {
    setTimeout(async () => {
      const reportList = await reportModel.findOne({
        ReporterId: interaction.user.id,
        IsCaseClosed: false,
        IsModsNotified: false,
      });
      if (!reportList) return;

      const target = reportList.TargetName;

      const successEmbed = new EmbedBuilder()
        .setTitle(utils.titles.report_success)
        .setDescription(
          "Thanks for submitting your report. You will be notifed as soon as a moderator respond to your report."
        )
        .setColor(utils.colors.default)
        .setThumbnail(utils.thumbnails.case)
        .addFields({
          name: "Case ID",
          value: `${reportList.CaseId}`,
          inline: true,
        })
        .setFooter({
          text: utils.texts.moderation,
          iconURL: utils.footers.moderation,
        });

      await interaction.reply({
        embeds: [successEmbed],
        ephemeral: true,
      });

      await notifyModeratos(reportList);

      console.log(
        `${utils.consoleTags.app} ${interaction.user.username} just reported ${target}. (Case ID: ${reportList.CaseId})`
      );
    }, 1000);
  },
};
