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
  let song;

  for (let i = 0; i < playlistLength; ++i) {
    const result = await player.search(slicedPlaylist[i], {
      searchEngine: QueryType.AUTO,
    });

    const newSong = result.tracks[0];
    resultArray.push(song);

    mappedResult[i] = `**${i + 1}.** [${newSong.title} -- ${newSong.author}](${
      newSong.url
    })`;
    mappedArray.push(mappedResult[i]);

    if (i === 0) {
      song = result.tracks[0];
    }
  }

  return { mappedArray, resultArray };
}

module.exports = {
  search,
  searchYouTube,
  searchFavorite,
};
