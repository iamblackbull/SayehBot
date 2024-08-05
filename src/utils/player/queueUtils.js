const booleans = {
  useLegacyFFmpeg: false,
  leaveOnStop: true,
  leaveOnEnd: true,
  leaveOnEmpty: true,
  smoothVolume: true,
};

const cooldowns = {
  leaveOnStopCooldown: 300_000,
  leaveOnEndCooldown: 300_000,
  leaveOnEmptyCooldown: 10_000,
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
