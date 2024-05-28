const { EmbedBuilder } = require("discord.js");
const { mongoose } = require("mongoose");
const warnModel = require("../../database/warnModel");
const utils = require("../../utils/main/mainUtils");

let importedClient;
function getWarnClient(client) {
  importedClient = client;
}

async function applyPenalty(UserId) {
  if (mongoose.connection.readyState == 1) return;

  const warnList = await warnModel.findOne({
    UserId,
    isApplied: false,
  });

  if (!warnList || warnList.Warns < 1) return;

  const guild = await importedClient.guilds.fetch(warnList.guildId);
  const member = await guild.members.fetch(warnList.UserId);
  const target = await importedClient.users.fetch(warnList.UserId);
  if (!guild || !member) return;

  const warns = warnList.Warns;
  const reason = `${warns} Warnings received.`;
  const penalty = utils.warnPenalties[warns - 1];

  const nextPenalty =
    warns < 10
      ? `### Next Warn Penalty:\n- ${utils.warnPenalties[warns].label}`
      : "";

  const embed = new EmbedBuilder()
    .setTitle(utils.titles.warning)
    .setDescription(
      `You have been warned **${warns}** time(s)! Please watch your behavior.
        \n\n## Current Warning Penalty:
        \n- Warn Penalty: **${penalty.label}**
        \n${nextPenalty}`
    )
    .setThumbnail(utils.thumbnails.warning)
    .setColor(utils.colors.warning)
    .setFooter({
      text: utils.texts.moderation,
      iconURL: utils.footers.moderation,
    });

  try {
    if (target) await target.send({ embeds: [embed] });
  } catch (error) {
    console.log(
      `${utils.consoleTags.warning} Failed to send direct message to warned target.`
    );
  }

  try {
    member.timeout(penalty.timer, reason);
  } catch (error) {
    if (error.code == 10026)
      console.error(
        `${utils.consoleTags.warning} New warning detected but failed to perform action on the target.`
      );
    else if (error.code == 10007)
      console.error(
        `${utils.consoleTags.warning} New warning detected but failed to find the target.`
      );
    else
      console.error(
        `${utils.consoleTags.error} Unknown error while checking warn records: `,
        error
      );
  }
}

module.exports = {
  getWarnClient,
  applyPenalty,
};
