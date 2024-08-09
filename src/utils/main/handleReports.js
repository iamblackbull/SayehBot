const { EmbedBuilder } = require("discord.js");
const reportModel = require("../../database/reportModel");
const channelModel = require("../../database/channelModel");
const utils = require("../../utils/main/mainUtils");

let importedClient;
function getReportClient(client) {
  importedClient = client;
}

async function notifyReporter(doc) {
  const reporter = await importedClient.users.fetch(doc.ReporterId);
  if (!reporter) return;

  const embed = new EmbedBuilder()
    .setTitle(utils.titles.reportcase_close)
    .setDescription(
      `A moderator responded to your report and your case has been closed.\n\n## Action Taken:\n${doc.Action}`
    )
    .setColor(utils.colors.default)
    .setThumbnail(utils.thumbnails.case)
    .addFields({
      name: "Case ID",
      value: `${doc.CaseId}`,
      inline: true,
    })
    .setFooter({
      text: utils.texts.moderation,
      iconURL: utils.footers.moderation,
    });

  try {
    await reporter.send({ embeds: [embed] });

    console.log(
      `${utils.consoleTags.app} Report case message has been sent to the original reporter.`
    );

    await reportModel.updateOne(
      { CaseId: doc.CaseId },
      { IsReporterNotified: true }
    );
  } catch (error) {
    console.log(
      `${utils.consoleTags.warning} Failed to send direct message to reporter.`
    );
  }
}

async function notifyModeratos(doc) {
  const guild = await importedClient.guilds.fetch(process.env.guildID);
  const reporter = await guild.members.fetch(doc.ReporterId);
  const target = await guild.members.fetch(doc.TargetId);
  if (!guild || !reporter || !target) return;

  const channelsList = await channelModel.findOne({
    guildId: guild.id,
  });
  if (!channelsList) return;

  const channelId = channelsList.moderationId;
  if (!channelId) return;

  const channel = await guild.channels.fetch(channelId);

  const avatar = reporter.user.displayAvatarURL({ size: 1024, dynamic: true });
  let description = `**Reason**\n\`\`\`${doc.Reason}\`\`\`\n**Message**\n\`\`\`${doc.Message}\`\`\``;

  const embed = new EmbedBuilder()
    .setTitle(utils.titles.reportcase_open)
    .setAuthor({ name: doc.ReporterName, iconURL: avatar, url: avatar })
    .setDescription(description)
    .setColor(utils.colors.default)
    .setThumbnail(utils.thumbnails.case)
    .addFields(
      { name: "Reporter", value: `${reporter.user}`, inline: true },
      { name: "Target", value: `${target.user}`, inline: true },
      { name: "Case ID", value: `${doc.CaseId}`, inline: true }
    )
    .setTimestamp(Date.now())
    .setFooter({
      text: utils.texts.moderation,
      iconURL: utils.footers.moderation,
    });

  console.log(
    `${utils.consoleTags.app} Report case message has been sent to moderators. (Case ID: ${doc.CaseId})`
  );

  const msg = await channel.send({
    embeds: [embed],
  });

  await reportModel.updateOne(
    {
      CaseId: doc.CaseId,
    },
    {
      CaseMessageId: msg.id,
      IsModsNotified: true,
    }
  );

  const emojis = ["🚮", "🚫", "✅"];
  emojis.forEach((emoji) => msg.react(emoji));

  const filter = (reaction) => {
    emojis.includes(reaction.emoji.name);
  };

  const collector = msg.createReactionCollector(filter);

  collector.on("collect", async (reaction, user) => {
    if (user.bot) return;

    if (reaction.emoji.name == emojis[0]) {
      msg.reactions.remove(emojis[0]).catch(console.error);

      const targetChannel = await guild.channels.fetch(doc.ChannelId);
      await targetChannel.messages.delete(doc.MessageId).catch(console.error);

      const Action =
        doc.action === "none"
          ? "message deleted"
          : `${doc.Action} , message deleted`;

      await reportModel.updateOne(
        { CaseId: doc.CaseId },
        { IsCaseClosed: true, Action }
      );

      const deleteDescription = `\n${user} deleted the reported message.`;

      console.log(
        `${utils.consoleTags.app} ${user.username} deleted the reported message. (Case ID: ${doc.CaseId})`
      );

      description += deleteDescription;
    } else if (reaction.emoji.name == emojis[1]) {
      msg.reactions.remove(emojis[1]).catch(console.error);

      const reason = `${user.username} banned reported user ${doc.TargetName}. (Case ID: ${doc.CaseId})`;

      await guild.members.ban(doc.TargetId, { reason }).catch(console.error);

      const Action =
        doc.action === "none"
          ? "target banned"
          : `${doc.Action} , target banned`;

      await reportModel.updateOne(
        { CaseId: doc.CaseId },
        { IsCaseClosed: true, Action }
      );

      const banDescription = `\n${user} banned the target.`;

      console.log(
        `${utils.consoleTags.app} ${user.username} banned the target. (Case ID: ${doc.CaseId})`
      );

      description += banDescription;
    } else {
      msg.reactions.removeAll().catch(console.error);

      const Action =
        doc.action === "none" ? "case closed" : `${doc.Action} , case closed`;

      await reportModel.updateOne(
        { CaseId: doc.CaseId },
        { IsCaseClosed: true, Action }
      );

      embed.setTitle(utils.titles.reportcase_close);
      description = `${user} closed this report case.`;

      await notifyReporter(doc);

      console.log(
        `${utils.consoleTags.app} ${user.username} closed a report case. (Case ID: ${doc.CaseId})`
      );
    }

    embed.setDescription(description);

    await msg.edit({
      embeds: [embed],
    });
  });
}

module.exports = {
  getReportClient,
  notifyModeratos,
};
