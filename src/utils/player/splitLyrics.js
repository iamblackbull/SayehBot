function splitLyrics(lyrics, chunkSize) {
  const sentences = lyrics.split(/(?<=[.!?])\s+/);

  let currentChunk = "";
  const chunks = [];

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= chunkSize) {
      currentChunk += sentence;
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }

  if (currentChunk.trim() !== "") {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

module.exports = {
  splitLyrics,
};
