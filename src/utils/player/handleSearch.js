const { useMainPlayer, QueryType } = require("discord-player");
const player = useMainPlayer();

async function search(query, searchEngine) {
  const result = await player.search(query, {
    searchEngine,
  });

  return result;
}

async function searchFavorite(playlist, slice) {
  const slicedPlaylist = playlist.slice(slice);
  const playlistLength = slicedPlaylist.length;

  let mappedResult = {};
  let mappedArray = [];
  let resultArray = [];

  for (let i = 0; i < playlistLength; ++i) {
    const result = await player.search(slicedPlaylist[i], {
      searchEngine: QueryType.AUTO,
    });

    if (!result.hasTracks()) return;

    const song = result.tracks[0];
    resultArray.push(song);

    mappedResult[i] = `**${i + 1}.** ["${song.title}" by "${song.author}"](${
      song.url
    })`;

    mappedArray.push(mappedResult[i]);
  }

  return { mappedArray, resultArray };
}

module.exports = {
  search,
  searchFavorite,
};
