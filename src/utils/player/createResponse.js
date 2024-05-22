const { setDurationLabel } = require("./createMusicEmbed");

export function response(result) {
  if (result.playlist) return;

  const respond = result.tracks.slice(0, 5).map((song) => ({
    name: `[${setDurationLabel(song.duration)}] "${song.title}" by "${
      song.author
    }" (${song.raw.source})`,
    value: song.url,
  }));

  return respond;
}
