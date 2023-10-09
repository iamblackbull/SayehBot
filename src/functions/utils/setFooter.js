function setFooter(embed, song) {
  if (song.url.includes("youtube")) {
    embed.setColor(0xff0000).setFooter({
      iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
      text: `YouTube`,
    });
  } else if (song.url.includes("spotify")) {
    embed.setColor(0x34eb58).setFooter({
      iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
      text: "Spotify",
    });
  } else if (song.url.includes("soundcloud")) {
    embed.setColor(0xeb5534).setFooter({
      iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
      text: `Soundcloud`,
    });
  } else if (song.url.includes("apple")) {
    embed.setColor(0xfb4f67).setFooter({
      iconURL: `https://music.apple.com/assets/knowledge-graph/music.png`,
      text: `Apple Music`,
    });
  }
}

module.exports = {
  setFooter,
};
