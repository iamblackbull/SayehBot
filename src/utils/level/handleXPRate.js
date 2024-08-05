const xpModel = require("../../database/xpModel");
const { subRole1, subRole2, subRole3, boostRole } = process.env;

module.exports.calculateXP = async (input, user) => {
  const xpProfile = await xpModel.findOne({
    guildId: user.guildId,
  });

  const baseXP = xpProfile ? xpProfile.basexp : 20;
  const scale = 1.1;

  const XP = Math.floor(baseXP * Math.pow(scale, user.level));

  let boost = 1;

  const roleMultipliers = new Map([
    [subRole1, 1.25],
    [subRole2, 1.5],
    [subRole3, 2],
  ]);

  for (const [role, multiplier] of roleMultipliers) {
    if (input.member.roles.cache.has(role)) {
      boost = multiplier;
      break;
    }
  }

  if (input.member.roles.cache.has(boostRole)) boost += 0.5;

  const finalXP = Math.floor(XP * boost);

  return finalXP;
};
