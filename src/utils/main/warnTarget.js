const warnModel = require("../../schemas/warn-schema");

async function warn(user, target, guild) {
  let warnSuccess = false;
  let warns = 1;

  let warnList = await warnModel.findOne({
    guildId: guild.id,
    UserId: target.id,
  });

  if (!warnList) {
    warnList = new warnModel({
      guildId: guild.id,
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
        guildId: guild.id,
        UserId: target.id,
      },
      {
        Warns: warns,
        isApplied: false,
      }
    );
  }

  const username = user === "SayehBot" ? user : user.name;

  console.log(
    `${username} warned ${target.username}. (Total Warnings: ${warns})`
  );

  warnSuccess = true;

  return { warnSuccess, warns };
}

async function clear(user, target, guild) {
  await warnModel.findOneAndRemove({
    guildId: guild.id,
    UserId: target.id,
  });

  console.log(`${user.username} cleared warning record of ${target.username}.`);
}

module.exports = {
  warn,
  clear,
};
