const warnModel = require("../../schemas/warn-schema");

async function applyPenalty(UserId) {
  const warnList = await warnModel.findOne({
    UserId,
    isApplied: false,
  });

  if (!warnList || warnList.Warns < 1) return;

  const guild = await client.guilds.fetch(warnList.guildId);
  const member = await guild.members.fetch(warnList.UserId);
  const target = await client.users.fetch(warnList.UserId);

  member.timeout(10000, "test");
}

module.exports = applyPenalty;
