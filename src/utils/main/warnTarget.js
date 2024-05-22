const warnModel = require("../../database/warnModel");

async function warn(user, target, guildId) {
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
      isApplied: false,
    });

    await warnList.save().catch(console.error);
  } else {
    warns = warnList.Warns++;

    warnList = await warnModel.updateOne(
      {
        guildId: guildId,
        UserId: target.id,
      },
      {
        Warns: warns,
        isApplied: false,
      }
    );
  }

  console.log(
    `${user.username} warned ${target.username}. (Total Warnings: ${warns})`
  );

  warnSuccess = true;

  return { warnSuccess, warns };
}

async function clear(user, target, guildId) {
  await warnModel.findOneAndRemove({
    guildId: guildId,
    UserId: target.id,
  });

  console.log(`${user.username} cleared warning record of ${target.username}.`);
}

module.exports = {
  warn,
  clear,
};
