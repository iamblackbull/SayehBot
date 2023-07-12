const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const report = require("../../schemas/report-schema");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("report message")
    .setType(ApplicationCommandType.Message)
    .setDMPermission(false),
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId(`report-modal`)
      .setTitle(`Report Message`);

    const reportInput = new TextInputBuilder()
      .setCustomId("reportInput")
      .setLabel(`Why you want to report this message?`)
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(new ActionRowBuilder().addComponents(reportInput));
    await interaction.showModal(modal);

    const msg = await interaction.channel.messages.fetch(interaction.targetId);

    let reportList = await report.findOne({
      ReporterId: interaction.user.id,
      TargetId: msg.author.id,
      Message: msg.content,
      IsCaseOpen: true,
    });

    if (!reportList) {
      const id = new Date().getTime().toString();
      reportList = new report({
        CaseId: id,
        ReporterId: interaction.user.id,
        ReporterName: interaction.user.username,
        TargetId: msg.author.id,
        TargetName: msg.author.username,
        Message: msg.content,
        IsCaseOpen: true,
      });
      await reportList.save().catch(console.error);
    } else {
      const failedEmbed = new EmbedBuilder()
        .setTitle(`**Action Failed**`)
        .setDescription(
          `You have already reported this message. You will be notifed as soon as a moderator responed to your report.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.reply({
        embeds: [failedEmbed],
        ephemeral: true,
      });
    }
  },
};
