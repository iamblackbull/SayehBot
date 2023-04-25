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
    .setType(ApplicationCommandType.Message),
  async execute(interaction, client) {
    let reportList = await report.findOne({
      ReporterId: interaction.user.id,
    });
    if (!reportList) {
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

      const msg = await interaction.channel.messages.fetch(
        interaction.targetId
      );

      reportList = new report({
        ReporterId: interaction.user.id,
        ReporterName: interaction.user.tag,
        TargetId: msg.author.id,
        TargetName: `${msg.author.username}#${msg.author.discriminator}`,
        Message: msg.content,
      });
      await reportList.save().catch(console.error);
    } else {
      const failedEmbed = new EmbedBuilder()
        .setTitle(`**Action Failed**`)
        .setDescription(
          `You can only have **1** open report case at a time. Please wait until your current case is closed.`
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
