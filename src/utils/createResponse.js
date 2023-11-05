function response(result) {
  const respond = result.tracks.slice(0, 5).map((song) => ({
    name: `[${song.duration}] "${song.title}" by "${song.author}" (${song.raw.source})`,
    value: song.url,
  }));

  return respond;
}

module.exports = {
  response,
};
