const booleans = {
  useLegacyFFmpeg: false,
  leaveOnStop: true,
  leaveOnEnd: true,
  leaveOnEmpty: true,
  smoothVolume: true,
  skipOnNoStream: true,
};

const cooldowns = {
  leaveOnStopCooldown: 600_000,
  leaveOnEndCooldown: 600_000,
  leaveOnEmptyCooldown: 10_000,
  bufferingTimeout: 10_000,
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
