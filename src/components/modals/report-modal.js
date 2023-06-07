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

    const reportList = await report.findOne({
      ReporterId: interaction.user.id,
      IsCaseOpen: true,
    });

    const reason = interaction.fields.getTextInputValue(`reportInput`);
    const message = reportList.Message;
    const target = reportList.TargetName;
    const reporter = interaction.user;
    const avatar = reporter.displayAvatarURL({ size: 1024, dynamic: true });

    let embed = new EmbedBuilder()
      .setTitle(`**Report Case**`)
      .setDescription(
        `**Reason**\n\`\`\`${reason}\`\`\`\n**Message**\n\`\`\`${message}\`\`\``
      )
      .setThumbnail(
        `https://cdn2.iconfinder.com/data/icons/medicine-colored-outline-part-2-v-2/128/ic_medical_card-512.png`
      )
      .setAuthor({ name: reporter.tag, iconURL: avatar, url: avatar })
      .addFields(
        { name: `Reporter`, value: `${reporter}`, inline: true },
        { name: `Target`, value: `${target}`, inline: true }
      )
      .setTimestamp(Date.now())
      .setColor(0xff0000);

    let successEmbed = new EmbedBuilder()
      .setTitle(`Successfully Reported`)
      .setDescription(
        "Thanks for submitting your report. Moderators will respond to it as soon as possible."
      )
      .setColor(0x25bfc4)
      .setThumbnail(`https://cdn-icons-png.flaticon.com/512/7870/7870619.png`);

    const msg = await channel.send({
      embeds: [embed],
    });
    msg.react(`✅`);
    const filter = (reaction, user) => {
      [`✅`].includes(reaction.emoji.name) && user.id === interaction.user.id;
    };
    const collector = msg.createReactionCollector(filter);
    collector.on("collect", async (user) => {
      if (user.bot) return;
      else {
        await report.updateOne(
          { ReporterId: interaction.user.id, IsCaseOpen: true },
          { IsCaseOpen: false }
        );
        msg.reactions.removeAll().catch(console.error);

        embed
          .setTitle(`**Case Closed**`)
          .setDescription(`This report case has been closed by ${user}`);
        await msg.edit({
          embeds: [embed],
        });

        successEmbed
          .setTitle(`**Case Closed**`)
          .setDescription(
            `${user} has responded to your report and your case has been closed.`
          );
        await reporter
          .send({
            embeds: [successEmbed],
          })
          .catch((e) => {
            console.log(`Failed to send direct message to reporter.`);
          });
      }
    });
    await interaction.reply({
      embeds: [successEmbed],
      ephemeral: true,
    });
    console.log(`${interaction.user.tag} just reported ${target}.`);
    setTimeout(() => {
      msg.delete().catch((e) => {
        console.log(`Failed to delete Report modal message.`);
      });
      if (!reportList) return;
      else {
        reportList.delete().catch(console.error);
      }
    }, 24 * 60 * 60 * 1000);
  },
};
