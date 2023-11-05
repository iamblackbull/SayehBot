const { EmbedBuilder } = require("discord.js");
const { titles, footers, thumbnails, colors } = require("./musicUtils");

function createEmbed({ title, description, color, author, thumbnail, footer }) {
  let embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color);

  if (author) {
    embed.setAuthor(author);
  }
  if (thumbnail) {
    embed.setThumbnail(thumbnail);
  }
  if (footer) {
    embed.setFooter(footer);
  }

  return embed;
}

function determineSourceAndColor(url) {
  const sources = {
    music: { iconURL: footers.music, text: "Music", color: colors.music },
    youtube: {
      iconURL: footers.youtube,
      text: "YouTube",
      color: colors.youtube,
    },
    spotify: {
      iconURL: footers.spotify,
      text: "Spotify",
      color: colors.spotify,
    },
    soundcloud: {
      iconURL: footers.soundcloud,
      text: "Soundcloud",
      color: colors.soundcloud,
    },
    applemusic: {
      iconURL: footers.applemusic,
      text: "Apple Music",
      color: colors.applemusic,
    },
    favorite: {
      iconURL: footers.favorite,
      text: "Favorite",
      color: colors.music,
    },
  };

  for (const source in sources) {
    if (url.includes(source)) {
      return sources[source];
    }
  }

  return sources.music;
}

function createTrackEmbed(interaction, queue, result, song) {
  const playlist = result?.playlist;
  const length = result?.tracks.length - 1;

  let queueSize = queue.tracks.size;

  if (queueSize === 0 && queue.currentTrack?.url !== song.url) {
    queueSize = 1;
  }

  let nowPlaying = queueSize === 0;

  let title;
  if (interaction?.commandName === "jump") {
    title = titles.jump;
    nowPlaying = true;
  } else if (interaction?.commandName === "previous") {
    title = titles.previous;
    nowPlaying = true;
  } else if (interaction?.commandName === "replay") {
    title = titles.replay;
    nowPlaying = true;
  } else if (interaction?.commandName === "skip" && !nowPlaying)
    title = titles.skip;
  else {
    title = playlist
      ? playlist.url.toLowerCase().includes("album")
        ? titles.album
        : titles.playlist
      : nowPlaying
      ? titles.nowplaying
      : `🎵 Track ${queueSize}`;
  }

  const description = playlist
    ? `**[${playlist.title}](${playlist.url})**,\n**[${song.title}](${song.url})**\nand **${length}** other tracks`
    : `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`;

  const thumbnail = playlist ? playlist.thumbnail : song.thumbnail;

  const { iconURL, text, color } = determineSourceAndColor(song.url);

  const embed = createEmbed({
    title,
    description,
    color,
    thumbnail,
    footer: {
      iconURL,
      text,
    },
  });

  return { embed, nowPlaying };
}

function createSongEmbed(queue, interaction) {
  const song = queue.currentTrack;
  let title = queue.node.isPlaying() ? titles.nowplaying : titles.pause;
  if (interaction.commandName === "seek") title = titles.seek;

  const bar = queue.node.createProgressBar({
    timecodes: true,
    queue: false,
    length: 14,
  });

  const description =
    `**[${song.title}](${song.url})**\n**${song.author}**\n` + bar;

  const { iconURL, text, color } = determineSourceAndColor(song.url);

  const embed = createEmbed({
    title,
    description,
    color,
    footer: {
      iconURL,
      text,
    },
  });

  return embed;
}

function createSearchEmbed(result, isLink) {
  const title = titles.search;
  const resultLength = isLink ? 1 : 5;

  const description = result.tracks
    .slice(0, resultLength)
    .map((song, i) => {
      return `**${i + 1}.** \`[${song.duration}]\` [${song.title} -- ${
        song.author
      }](${song.url})`;
    })
    .join("\n");

  const thumbnail = result.tracks[0].thumbnail;

  const { iconURL, text, color } = determineSourceAndColor("youtube");

  const embed = createEmbed({
    title,
    description,
    color,
    thumbnail,
    footer: {
      iconURL,
      text,
    },
  });

  return embed;
}

async function createPauseEmbed(interaction) {
  const queue = client.player.nodes.get(interaction.guildId);

  const user = interaction.user;
  const name = interaction.member.nickname || user.username;
  const avatar = user.displayAvatarURL({ size: 1024, dynamic: true });

  const author = interaction.customId?.includes("button")
    ? {
        name,
        avatar,
        avatar,
      }
    : false;

  let title;
  let thumbnail;

  await queue.node.setPaused(!queue.node.isPaused());

  if (queue.node.isPaused()) {
    title = titles.pause;
    thumbnail = thumbnails.pause;
  } else {
    if (!queue.node.isPlaying()) await queue.node.play();

    title = titles.resume;
    thumbnail = thumbnails.resume;
  }

  const description =
    "Use </pause:1047903145071759424> again or click the button below to toggle.";

  const { iconURL, text, color } = determineSourceAndColor("music");

  const embed = createEmbed({
    title,
    description,
    color,
    author,
    thumbnail,
    footer: {
      iconURL,
      text,
    },
  });

  return embed;
}

async function createButtonEmbed(song, interaction, nowPlaying) {
  const user = interaction.user;
  const name = interaction.member.nickname || user.username;
  const avatar = user.displayAvatarURL({ size: 1024, dynamic: true });

  let title = titles.nowplaying;
  if (interaction.customId === "previous-button") {
    if (nowPlaying) title = titles.previous;
    else title = titles.replay;
  }
  if (interaction.customId === "replay-button") title = titles.replay;
  if (interaction.customId === "skip-button" && !nowPlaying)
    title = titles.skip;

  const description = `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`;

  const thumbnail = song.thumbnail;

  const { iconURL, text, color } = determineSourceAndColor(song.url);

  const embed = createEmbed({
    title,
    description,
    color,
    author: {
      name,
      avatar,
      avatar,
    },
    thumbnail,
    footer: {
      iconURL,
      text,
    },
  });

  return embed;
}

function createQueueEmbed(page, totalPages, queue) {
  const title = titles.queue;
  const queueTitle = queue.node.isPlaying() ? titles.nowplaying : titles.pause;

  const queueString = queue.tracks.data
    .slice(page * 10, page * 10 + 10)
    .map((song, i) => {
      return `**${page * 10 + i + 1}.** \`[${song.duration}]\` [${
        song.title
      } -- ${song.author}](${song.url})`;
    })
    .join("\n");

  const queueStringLength = queue.tracks.size;
  const song = queue.currentTrack;
  const bar = queue.node.createProgressBar({
    timecodes: true,
    queue: false,
    length: 14,
  });

  const repeatModes = ["None", "Track", "Queue", "Autoplay"];
  const repeatDescription =
    queue.repeatMode > 0
      ? `**${titles.repeat} mode :** ${repeatModes[queue.repeatMode]}\n`
      : "";

  const filtersDescription =
    queue.filters.ffmpeg.filters.length > 0
      ? `**✨ ${
          queue.filters.ffmpeg.filters.length
        } filters are enabled :** ${queue.filters.ffmpeg.filters
          .join(", ")
          .slice(1, -1)}\n`
      : "";

  const totalDuration = queue.tracks
    .slice(1)
    .reduce((acc, track) => acc + track.duration, 0);

  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  const queueDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const description =
    `${repeatDescription}${filtersDescription}\n${queueTitle}\n` +
    `**[${song.title}](${song.url})**\n**${song.author}**` +
    `\n\n` +
    bar +
    `\n\n### ${titles.upcoming} (${queueDuration})\n` +
    (queueStringLength > 0 ? `${queueString}` : "None");

  const color = colors.music;
  const iconURL = footers.page;
  const text = `Page ${page} of ${totalPages} (${queueStringLength} Tracks)`;

  const embed = createEmbed({
    title,
    description,
    color,
    footer: {
      iconURL,
      text,
    },
  });

  return embed;
}

function createVoteEmbed(requiredVotes, phase) {
  const title = titles.voteskip;
  const timer = requiredVotes * 5;

  let description;
  switch (phase) {
    case "start":
      description = `**${requiredVotes}** votes to skip.\n${timer} seconds left.`;
      break;
    case "success":
      description = `Required votes have been collected. Skipping...`;
      break;
    case "fail":
      description = `Voting phase ended. Not enough votes were collected.`;
      break;
  }

  const thumbnail = thumbnails.voteskip;

  const { iconURL, text, color } = determineSourceAndColor("music");

  const embed = createEmbed({
    title,
    description,
    color,
    thumbnail,
    footer: {
      iconURL,
      text,
    },
  });

  return embed;
}

function createFavoriteEmbed(song, favoriteMode) {
  let title;
  let descriptionMode;
  let thumbnail = song.thumbnail;

  switch (favoriteMode) {
    case "add":
      title = titles.addfavorite;
      descriptionMode = `**[${song.title}](${song.url})**\nhas been added to your favorite playlist.`;
      break;
    case "remove":
      title = titles.removefavorite;
      descriptionMode = `**[${song.title}](${song.url})**\nhas been removed from your favorite playlist.`;
      break;
    case "full":
      title = titles.fullfavorite;
      descriptionMode = `Your favorite playlist is full.`;
      thumbnail = thumbnails.fullfavorite;
      break;
  }

  const description = `${descriptionMode}\nUse </favorite:1108681222764367962> to interact with your playlist.`;

  const { iconURL, text, color } = determineSourceAndColor("favorite");

  const embed = createEmbed({
    title,
    description,
    color,
    thumbnail,
    footer: {
      iconURL,
      text,
    },
  });

  return embed;
}

function createPlayFavoriteEmbed(owner, queue, song, target, length) {
  const user = owner.username;
  const name = target
    ? `${user}'s Favorites (Track ${target})`
    : `${user}'s Favorites`;
  const avatar = owner.displayAvatarURL({ size: 1024, dynamic: true });

  let queueSize = queue.tracks.size;

  if (queueSize === 0 && queue.currentTrack?.url !== song.url) {
    queueSize = 1;
  }

  const nowPlaying = queueSize === 0;

  const title = target
    ? nowPlaying
      ? titles.nowplaying
      : `🎵 Track ${queueSize}`
    : titles.playlist;

  let description;
  if (target) {
    description = `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`;
  } else {
    description = `**[${song.title}](${song.url})**\n**${song.author}**\nand **${length}** other tracks`;
  }

  const thumbnail = song.thumbnail;

  const { iconURL, text, color } = determineSourceAndColor("favorite");

  const embed = createEmbed({
    title,
    description,
    color,
    author: {
      name,
      avatar,
      avatar,
    },
    thumbnail,
    footer: {
      iconURL,
      text,
    },
  });

  return { embed, nowPlaying };
}

function createViewFavoriteEmbed(owner, song, target, page, mappedArray) {
  const user = owner.username;
  const name = target
    ? `${user}'s Favorites (Track ${target})`
    : `${user}'s Favorites`;
  const avatar = owner.displayAvatarURL({ size: 1024, dynamic: true });

  const title = titles.viewfavorite;

  let description;
  if (target) {
    description = `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`;
  } else {
    const joinedPlaylist = mappedArray
      .slice(page * 10, page * 10 + 10)
      .join("\n");

    description = joinedPlaylist;
  }

  const thumbnail = song.thumbnail;

  const { iconURL, text, color } = determineSourceAndColor("favorite");

  const embed = createEmbed({
    title,
    description,
    color,
    author: {
      name,
      avatar,
      avatar,
    },
    thumbnail,
    footer: {
      iconURL,
      text,
    },
  });

  return embed;
}

function createDeleteWarningFavoriteEmbed(owner, song, target) {
  const user = owner.username;
  const name = target
    ? `${user}'s Favorites (Track ${target})`
    : `${user}'s Favorites`;
  const avatar = owner.displayAvatarURL({ size: 1024, dynamic: true });

  const title = titles.viewfavorite;

  let description;
  if (target) {
    description = `You are about to delete this track from your playlist:\n**[${song.title}](${song.url})**\nAre you sure you want to continue?`;
  } else {
    description =
      "**You are about to clear your favorite playlist completely!**\nAre you sure you want to continue?";
  }

  const thumbnail = thumbnails.deletewarning;

  const { iconURL, text, color } = determineSourceAndColor("favorite");

  const embed = createEmbed({
    title,
    description,
    color,
    author: {
      name,
      avatar,
      avatar,
    },
    thumbnail,
    footer: {
      iconURL,
      text,
    },
  });

  return embed;
}

module.exports = {
  createTrackEmbed,
  createSongEmbed,
  createSearchEmbed,
  createPauseEmbed,
  createButtonEmbed,
  createQueueEmbed,
  createVoteEmbed,
  createFavoriteEmbed,
  createPlayFavoriteEmbed,
  createViewFavoriteEmbed,
  createDeleteWarningFavoriteEmbed,
};
