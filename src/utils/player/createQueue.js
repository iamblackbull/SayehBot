const { booleans, cooldowns, ytdlOptions } = require("./queueUtils");

async function createMainQueue(client, type, mode, song) {
  const requestor = mode === "interaction" ? type.user : type.author;

  const metadata = {
    guild: type.guild.id,
    channel: type.member.voice.channel,
    client: type.guild.members.me,
    requestedBy: requestor,
    track: song,
  };

  const queue = await client.player.nodes.create(type.guild, {
    metadata,
    ...booleans,
    ...cooldowns,
    ...ytdlOptions,
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
