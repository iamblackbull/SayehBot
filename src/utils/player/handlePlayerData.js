const playerDB = require("../../schemas/player-schema");

async function updatePlayerData(guildId, updates) {
  await playerDB.updateOne({ guildId }, updates);
}

async function handleData(interaction, nowPlaying) {
  const updates = { isJustAdded: nowPlaying };
  await updatePlayerData(interaction.guildId, updates);
}

async function handleMessageData(message, nowPlaying) {
  const updates = { isJustAdded: nowPlaying };
  await updatePlayerData(message.guild.id, updates);
}

async function handleSkipData(interaction) {
  const updates = { isSkipped: true };
  await updatePlayerData(interaction.guildId, updates);
}

module.exports = {
  handleData,
  handleMessageData,
  handleSkipData,
};
