async function createQueue(interaction, result) {
  await client.player.nodes.create(interaction.guild, {
    metadata: {
      guild: interaction.guildId,
      channel: interaction.member.voice.channel,
      client: interaction.guild.members.me,
      requestedBy: interaction.user,
      track: result.tracks[0],
    },
    useLegacyFFmpeg: false,
    leaveOnEnd: true,
    leaveOnEmpty: true,
    leaveOnStop: true,
    leaveOnStopCooldown: 5 * 60 * 1000,
    leaveOnEndCooldown: 5 * 60 * 1000,
    leaveOnEmptyCooldown: 5 * 1000,
    smoothVolume: true,
    ytdlOptions: {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    },
  });
}

async function createFavoriteQueue(interaction) {
  await client.player.nodes.create(interaction.guild, {
    metadata: {
      guild: interaction.guildId,
      channel: interaction.member.voice.channel,
      client: interaction.guild.members.me,
      requestedBy: interaction.user,
      track: undefined,
    },
    useLegacyFFmpeg: false,
    leaveOnEnd: true,
    leaveOnEmpty: true,
    leaveOnStop: true,
    leaveOnStopCooldown: 5 * 60 * 1000,
    leaveOnEndCooldown: 5 * 60 * 1000,
    leaveOnEmptyCooldown: 5 * 1000,
    smoothVolume: true,
    ytdlOptions: {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    },
  });
}

async function createMessageQueue(message, result) {
  await client.player.nodes.create(message.guild, {
    metadata: {
      guild: message.guild.id,
      channel: message.member.voice.channel,
      client: message.guild.members.me,
      requestedBy: message.author,
      track: result.tracks[0],
    },
    leaveOnEnd: true,
    leaveOnEmpty: true,
    leaveOnStop: true,
    leaveOnStopCooldown: 5 * 60 * 1000,
    leaveOnEndCooldown: 5 * 60 * 1000,
    leaveOnEmptyCooldown: 5 * 1000,
    smoothVolume: true,
    ytdlOptions: {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    },
  });
}

module.exports = {
  createQueue,
  createFavoriteQueue,
  createMessageQueue,
};
