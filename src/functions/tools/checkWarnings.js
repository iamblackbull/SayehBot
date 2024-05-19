const { EmbedBuilder } = require("discord.js");
const { mongoose } = require("mongoose");
const warnModel = require("../../schemas/warn-schema");
const utils = require("../../utils/main/mainUtils");

module.exports = (client) => {
  client.checkWarnings = async () => {
    if (mongoose.connection.readyState == 1) return;

    const warnList = await warnModel.findOne({
      isApplied: false,
    });

    if (!warnList || warnList.Warns < 1) return;

    const guild = await client.guilds.fetch(warnList.guildId);
    const member = await guild.members.fetch(warnList.UserId);
    const target = await client.users.fetch(warnList.UserId);

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
        `You have been warned! Please watch your behavior.
        \n\n## Current Warning Penalty:
        \n- Warnings received: **${warns}**
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
      await target.send({ embeds: [embed] });
    } catch (error) {
      console.error("Failed to send direct message to warned target.");
    }

    try {
      if (1 < warns < 10) {
        member.timeout(penalty.timer, reason);
      } else if (warns >= 10) {
        await guild.members.ban(warnList.UserId, { reason });
      }
    } catch (error) {
      if (error.code == 10026)
        console.error(
          "New warning detected but failed to perform action on the target."
        );
      else if (error.code == 10007)
        console.error("New warning detected but failed to find the target.");
      else console.error("Unknown error while checking warn records: ", error);
    }
  };
};
