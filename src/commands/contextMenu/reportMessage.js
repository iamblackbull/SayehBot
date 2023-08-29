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
      .setCustomId("report-modal")
      .setTitle(`Report Message`);

    const reportInput = new TextInputBuilder()
      .setCustomId("reportInput")
      .setLabel(`Why you want to report this message?`)
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const msg = await interaction.channel.messages.fetch(interaction.targetId);

    let reportList = await report.findOne({
      ReporterId: interaction.user.id,
      TargetId: msg.author.id,
      Message: msg.content,
      MessageId: msg.id,
      IsCaseOpen: true,
    });

    if (!reportList) {
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

          reportList = new report({
            CaseId: id,
            CaseMessageId: null,
            ReporterId: interaction.user.id,
            ReporterName: interaction.user.username,
            TargetId: msg.author.id,
            TargetName: msg.author.username,
            Message: msg.content,
            MessageId: msg.id,
            IsCaseOpen: true,
            IsModsNotified: false,
            IsReporterNotified: false,
          });
          await reportList.save().catch(console.error);
        })
        .catch((e) =>
          console.log(
            "Modal collector of Report message did not recieve any interactions before ending."
          )
        );
    } else {
      const failedEmbed = new EmbedBuilder()
        .setTitle(`**Action Failed**`)
        .setDescription(
          `You have already reported this message. You will be notifed as soon as a moderator responed to your report.`
        )
        .addFields({
          name: `Case ID`,
          value: `${reportList.CaseId}`,
          inline: true,
        })
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
