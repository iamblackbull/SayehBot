async function createMainQueue(client, type, mode, song) {
  let Metadata = {};

  if (mode === "interaction") {
    Metadata = {
      guild: type.guildId,
      channel: type.member.voice.channel,
      client: type.guild.members.me,
      requestedBy: type.user,
      track: song,
    };
  } else {
    Metadata = {
      guild: type.guild.id,
      channel: type.member.voice.channel,
      client: type.guild.members.me,
      requestedBy: type.author,
      track: song,
    };
  }

  const queue = await client.player.nodes.create(type.guild, {
    metadata: Metadata,
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

  return queue;
}

async function createQueue(client, interaction, result) {
  const mode = "interaction";
  const song = result.tracks[0];

  return createMainQueue(client, interaction, mode, song);
}

async function createFavoriteQueue(client, interaction, song) {
  const mode = "interaction";

  return createMainQueue(client, interaction, mode, song);
}

async function createMessageQueue(client, message, result) {
  const mode = "message";
  const song = result.tracks[0];

  return createMainQueue(client, message, mode, song);
}

module.exports = {
  createQueue,
  createFavoriteQueue,
  createMessageQueue,
};
