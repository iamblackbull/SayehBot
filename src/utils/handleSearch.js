const { useMainPlayer, QueryType } = require("discord-player");
const player = useMainPlayer();

async function search(query) {
  let result;

  if (query.toLowerCase().startsWith("https")) {
    result = await player.search(query, {
      searchEngine: QueryType.AUTO,
    });
  } else {
    result = await player.search(query, {
      searchEngine: QueryType.YOUTUBE,
    });
  }

  return result;
}

async function searchYouTube(query) {
  const result = await player.search(query, {
    searchEngine: QueryType.YOUTUBE_SEARCH,
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
  searchYouTube,
  searchFavorite,
};
