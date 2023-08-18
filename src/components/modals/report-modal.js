require("dotenv").config();
const { guildID, modChannelID } = process.env;
const { EmbedBuilder } = require("discord.js");
const report = require("../../schemas/report-schema");

module.exports = {
  data: {
    name: `report-modal`,
  },
  async execute(interaction, client) {
    const guild = await client.guilds.fetch(guildID).catch(console.error);
    const channel = await guild.channels
      .fetch(modChannelID)
      .catch(console.error);

    let reportList;

    setTimeout(async () => {
      reportList = await report.findOne({
        ReporterId: interaction.user.id,
        IsCaseOpen: true,
        IsModsNotified: false,
      });

      if (!reportList) return;

      const reason = interaction.fields.getTextInputValue(`reportInput`);
      const message = reportList.Message;
      const target = reportList.TargetName;
      const reporter = interaction.user;
      const avatar = reporter.displayAvatarURL({ size: 1024, dynamic: true });
      const id = reportList.CaseId;

      let embed = new EmbedBuilder()
        .setTitle(`**Report Case**`)
        .setDescription(
          `**Reason**\n\`\`\`${reason}\`\`\`\n**Message**\n\`\`\`${message}\`\`\``
        )
        .setThumbnail(
          `https://cdn2.iconfinder.com/data/icons/medicine-colored-outline-part-2-v-2/128/ic_medical_card-512.png`
        )
        .setAuthor({ name: reporter.username, iconURL: avatar, url: avatar })
        .addFields(
          { name: `Reporter`, value: `${reporter}`, inline: true },
          { name: `Target`, value: `${target}`, inline: true },
          { name: `Case ID`, value: `${reportList.CaseId}`, inline: true }
        )
        .setTimestamp(Date.now())
        .setColor(0xff0000);

      let successEmbed = new EmbedBuilder()
        .setTitle(`Successfully Reported`)
        .setDescription(
          "Thanks for submitting your report. You will be notifed as soon as a moderator responed to your report."
        )
        .addFields({
          name: `Case ID`,
          value: `${reportList.CaseId}`,
          inline: true,
        })
        .setColor(0x25bfc4)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/7870/7870619.png`
        );

      const msg = await channel.send({
        embeds: [embed],
      });

      await report.updateOne(
        {
          CaseId: id,
        },
        {
          CaseMessageId: msg.id,
          IsModsNotified: true,
        }
      );
      msg.react(`✅`);
      const filter = (reaction, user) => {
        [`✅`].includes(reaction.emoji.name && !user.bot);
      };
      const collector = msg.createReactionCollector(filter);
      collector.on("collect", async (reaction, user) => {
        if (user.bot) return;
        msg.reactions.removeAll().catch(console.error);

        embed
          .setTitle(`**Case Closed**`)
          .setDescription(`This report case has been closed by ${user}`);
        await msg.edit({
          embeds: [embed],
          components: [],
        });

        successEmbed
          .setTitle(`**Case Closed**`)
          .setDescription(
            `${user} has responded to your report and your case has been closed.`
          );

        await report.updateOne(
          { CaseId: id },
          { IsCaseOpen: false, IsReporterNotified: true }
        );

        try {
          await reporter.send({
            embeds: [successEmbed],
          });
        } catch (e) {
          console.log(`Failed to send direct message to reporter.`);
          await report.updateOne({ CaseId: id }, { IsReporterNotified: false });
        }
      });

      await interaction.reply({
        embeds: [successEmbed],
        ephemeral: true,
      });

      console.log(
        `${interaction.user.username} just reported ${target}. (CaseID: ${reportList.CaseId})`
      );
      setTimeout(() => {
        msg.delete().catch((e) => {
          console.log(`Failed to delete Report modal message.`);
        });
        if (!reportList) return;
        else {
          reportList.delete().catch(console.error);
        }
      }, 24 * 60 * 60 * 1000);
    }, 1 * 1000);
  },
};
