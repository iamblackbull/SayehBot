const {
  appendXp,
  subtractXp,
  appendLevel,
  subtractLevel,
} = require("./levelActions");
const eventsModel = require("../../database/eventsModel");
const levelModel = require("../../database/levelModel");
const { maxLevel } = require("./cardUtils");
const { consoleTags, results } = require("../../utils/main/mainUtils");

async function checkEvent(guildId) {
  let enabled = true;

  const eventsList = await eventsModel.findOne({
    guildId,
    Level: true,
  });

  if (!eventsList) enabled = false;

  return enabled;
}

async function getUser(guildId, user) {
  let levelProfile = await levelModel.findOne({
    guildId,
    userId: user.id,
  });

  if (!levelProfile) {
    levelProfile = new levelModel({
      guildId,
      userId: user.id,
      username: user.globalName || user.username,
      level: 0,
      xp: 0,
      totalxp: 0,
    });

    await levelProfile.save().catch(console.error);
  }

  return levelProfile;
}

async function deleteUser(guildId, userId) {
  await levelModel.findOneAndDelete({
    guildId,
    userId,
  });
}

async function handleMessageXp(message, XP) {
  const { guildId, author } = message;

  const enabled = await checkEvent(guildId);
  if (!enabled) return;

  const levelProfile = await getUser(guildId, author);
  if (levelProfile.level >= maxLevel) return;

  await appendXp(levelProfile, XP);

  console.log(`${consoleTags.app} ${author.username} gained ${XP} XP.`);
}

async function handleInteractionXp(interaction, XP) {
  const { user, guildId } = interaction;

  const enabled = await checkEvent(guildId);
  if (!enabled) return;

  const levelProfile = await getUser(guildId, user);
  if (levelProfile.level >= maxLevel) return;

  await appendXp(levelProfile, XP);

  console.log(`${consoleTags.app} ${user.username} gained ${XP} XP.`);
}

async function handleVoiceXp(state, XP) {
  const { guild, member } = state;

  const enabled = await checkEvent(guild.id);
  if (!enabled) return;

  const levelProfile = await getUser(guild.id, member.user);
  if (levelProfile.level >= maxLevel) return;

  await appendXp(levelProfile, XP);

  console.log(`${consoleTags.app} ${member.user.username} gained ${XP} XP.`);
}

async function handleRollXp(interaction, xp, type, roll) {
  const { user, guildId } = interaction;

  const enabled = await checkEvent(guildId);
  if (!enabled) return;

  const levelProfile = await getUser(guildId, user);
  if (levelProfile.level >= maxLevel) return;

  let mode;
  let XP = xp;

  if (type === 1) {
    mode = "won";

    await appendXp(levelProfile, XP);
  } else if (type === 0) {
    mode = "lost";

    const totalXP = levelProfile.totalxp;
    if (XP > totalXP) XP = totalXP - 1;

    await subtractXp(levelProfile, XP);
  }

  console.log(
    `${consoleTags.app} ${user.username} ${mode} ${XP} XP by rolling ${roll}.`
  );
}

async function handleBlackjackXP(interaction, xp, result) {
  const { user, guildId } = interaction;

  const enabled = await checkEvent(guildId);
  if (!enabled) return;

  const levelProfile = await getUser(guildId, user);
  if (levelProfile.level >= maxLevel) return;

  let mode;
  let XP = xp;

  if (result === results.won) {
    mode = "won";

    await appendXp(levelProfile, XP);
  } else if (result === results.lost || result === results.busted) {
    mode = "lost";

    const totalXP = levelProfile.totalxp;
    if (XP > totalXP) XP = totalXP - 1;

    await subtractXp(levelProfile, XP);
  }

  console.log(
    `${consoleTags.app} ${user.username} ${mode} ${XP} XP by betting in blackjack.`
  );
}

async function adjustLevel(interaction, amount, action) {
  const { options, user, guildId } = interaction;
  const target = options.getUser("user");
  let mode = false;

  const enabled = await checkEvent(guildId);
  if (!enabled) return mode;

  const levelProfile = await getUser(guildId, target);

  if (action === "granted") {
    if (levelProfile.level >= maxLevel) return mode;

    mode = "granted to";
    await appendLevel(levelProfile, amount);
  } else {
    if (levelProfile.level <= 0) return mode;

    mode = "taken from";
    await subtractLevel(levelProfile, amount);
  }

  console.log(
    `${consoleTags.app} ${amount} level ${mode} ${target.username} by ${user.username}.`
  );

  return mode;
}

async function adjustXp(interaction, amount, action) {
  const { options, user, guildId } = interaction;
  const target = options.getUser("user");
  let mode = false;

  const enabled = await checkEvent(guildId);
  if (!enabled) return mode;

  const levelProfile = await getUser(guildId, target);

  if (action === "granted") {
    if (levelProfile.level >= maxLevel) return mode;

    mode = "granted to";
    await appendXp(levelProfile, amount);
  } else {
    if (levelProfile.totalxp <= 0) return mode;

    mode = "taken from";
    await subtractXp(levelProfile, amount);
  }

  console.log(
    `${consoleTags.app} ${amount} xp ${mode} ${target.username} by ${user.username}.`
  );

  return mode;
}

async function getLeaderboard(guildId, limit = Number) {
  const leaderboard = await levelModel
    .find({ guildId })
    .sort({ level: -1, xp: -1 })
    .limit(limit)
    .exec();

  return leaderboard;
}

async function getRank(guildId, userId) {
  const levelProfile = await levelModel.findOne({ guildId, userId });

  if (!levelProfile) return false;

  const higherRankedCount = await levelModel.countDocuments({
    guildId,
    $or: [
      { level: { $gt: levelProfile.level } },
      { level: levelProfile.level, xp: { $gt: levelProfile.xp } },
    ],
  });

  const rank = higherRankedCount + 1;

  return rank;
}

module.exports = {
  getUser,
  deleteUser,
  handleMessageXp,
  handleInteractionXp,
  handleVoiceXp,
  handleRollXp,
  handleBlackjackXP,
  adjustLevel,
  adjustXp,
  getLeaderboard,
  getRank,
};
