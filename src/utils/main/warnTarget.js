const warnModel = require("../../database/warnModel");
const eventsModel = require("../../database/eventsModel");
const { applyPenalty } = require("./warnPenalty");
const { consoleTags } = require("./mainUtils");

async function warn(user, target, guildId, reason) {
  const eventsList = await eventsModel.findOne({
    guildId: guildId,
    Moderation: true,
  });
  if (!eventsList) return;

  let warnSuccess = false;
  let warns = 1;

  let warnList = await warnModel.findOne({
    guildId: guildId,
    UserId: target.id,
  });

  if (!warnList) {
    warnList = new warnModel({
      guildId: guildId,
      UserId: target.id,
      Username: target.globalName,
      Warns: warns,
      Reason: reason,
      isApplied: false,
    });

    await warnList.save().catch(console.error);
  } else {
    warns = warnList.Warns + 1;

    warnList = await warnModel.updateOne(
      {
        guildId: guildId,
        UserId: target.id,
      },
      {
        Warns: warns,
        Reason: reason,
        isApplied: false,
      }
    );
  }

  await applyPenalty(target.id);

  console.log(
    `${consoleTags.app} ${user.username} warned ${target.username} with reason: ${reason}. (Total Warnings: ${warns})`
  );

  warnSuccess = true;

  return { warnSuccess, warns };
}

async function clear(user, target, guildId) {
  await warnModel.findOneAndDelete({
    guildId: guildId,
    UserId: target.id,
  });

  console.log(
    `${consoleTags.app} ${user.username} cleared warning record of ${target.username}.`
  );
}

module.exports = {
  warn,
  clear,
};
