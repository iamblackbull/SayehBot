const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const reportModel = require("../../database/reportModel");
const { handleCaseOpenError } = require("../../utils/main/handleErrors");
const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("report message")
    .setType(ApplicationCommandType.Message)
    .setDMPermission(false),

  async execute(interaction) {
    const { channel, targetId, user } = interaction;
    const targetMessage = await channel.messages.fetch(targetId);

    let reportList = await reportModel.findOne({
      ReporterId: user.id,
      TargetId: targetMessage.author.id,
      MessageId: targetMessage.id,
      ChannelId: targetMessage.channel.id,
      IsCaseClosed: false,
    });

    if (reportList) {
      await handleCaseOpenError(interaction, reportList.CaseId);
    } else {
      const modal = new ModalBuilder()
        .setCustomId("report-modal")
        .setTitle("Report Message");

      const reportInput = new TextInputBuilder()
        .setCustomId("reportInput")
        .setLabel("Why do you want to report this message?")
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

      modal.addComponents(new ActionRowBuilder().addComponents(reportInput));

      await interaction.showModal(modal);

      const filter = (interaction) => interaction.customId === "report-modal";

      await interaction
        .awaitModalSubmit({
          filter,
          time: 10 * 60 * 1000,
        })
        .then(async (interaction) => {
          const id = new Date().getTime().toString();

          reportList = new reportModel({
            CaseId: id,
            ReporterId: interaction.user.id,
            ReporterName: interaction.user.username,
            TargetId: targetMessage.author.id,
            TargetName: targetMessage.author.username,
            Message: targetMessage.content,
            Reason: interaction.fields.getTextInputValue("reportInput"),
            MessageId: targetMessage.id,
            ChannelId: targetMessage.channel.id,
            IsCaseClosed: false,
            IsModsNotified: false,
            IsReporterNotified: false,
          });
          await reportList.save().catch(console.error);
        })
        .catch((e) =>
          console.log(
            `${consoleTags.warning} Report message modal collector did not recieve any interactions before ending.`
          )
        );
    }
  },
};
