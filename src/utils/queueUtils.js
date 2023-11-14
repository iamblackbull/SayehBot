const booleans = {
  useLegacyFFmpeg: false,
  leaveOnStop: true,
  leaveOnEnd: true,
  leaveOnEmpty: true,
  smoothVolume: true,
};

const cooldowns = {
  leaveOnStopCooldown: 5 * 60 * 1000,
  leaveOnEndCooldown: 5 * 60 * 1000,
  leaveOnEmptyCooldown: 5 * 1000,
};

const ytdlOptions = {
  filter: "audioonly",
  quality: "highestaudio",
  highWaterMark: 1 << 25,
};

module.exports = {
  booleans,
  cooldowns,
  ytdlOptions,
};
