const playerDB = require("../../database/playerModel");

async function updatePlayerData(guildId, updates) {
  await playerDB.updateOne({ guildId }, updates);
}

async function handleData(guildId, nowPlaying) {
  const updates = { isJustAdded: nowPlaying };
  await updatePlayerData(guildId, updates);
}

async function handleSkipData(guildId) {
  const updates = { isSkipped: true };
  await updatePlayerData(guildId, updates);
}

module.exports = {
  handleData,
  handleSkipData,
};
