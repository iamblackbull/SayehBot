const { EmbedBuilder } = require("discord.js");
const { titles, footers, texts, thumbnails, colors } = require("./musicUtils");
const { parseTime } = require("../main/handleDeletion");

function createEmbed({ title, description, color, author, thumbnail, footer }) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color);

  if (author) embed.setAuthor(author);

  if (thumbnail) embed.setThumbnail(thumbnail);

  if (footer) embed.setFooter(footer);

  return embed;
}

function determineSourceAndColor(url) {
  const sources = {
    apple: {
      iconURL: footers.applemusic,
      text: texts.applemusic,
      color: colors.applemusic,
    },
    youtube: {
      iconURL: footers.youtube,
      text: texts.youtube,
      color: colors.youtube,
    },
    spotify: {
      iconURL: footers.spotify,
      text: texts.spotify,
      color: colors.spotify,
    },
    soundcloud: {
      iconURL: footers.soundcloud,
      text: texts.soundcloud,
      color: colors.soundcloud,
    },
    favorite: {
      iconURL: footers.favorite,
      text: texts.favorite,
      color: colors.music,
    },
    music: {
      iconURL: footers.music,
      text: texts.music,
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

function setDurationLabel(trackDuration) {
  const time = parseTime(trackDuration);

  let duration = "LIVE";
  if (time != 0) duration = trackDuration;

  return duration;
}

function createTrackEmbed(interaction, queue, result, song) {
  const { commandName, customId, user } = interaction;
  const playlist = result?.playlist;
  const length = result?.tracks?.length;

  let author = false;
  if (playlist) {
    author = {
      name: `${playlist.title} (${length} Tracks)`,
      iconURL: playlist.thumbnail,
      url: playlist.url,
    };
  }

  let queueSize = queue.tracks.size;

  if (
    queueSize === 0 &&
    queue.currentTrack &&
    queue.currentTrack.url !== song.url
  ) {
    queueSize = 1;
  } else if (
    queueSize >= 1 &&
    !queue.node.isPlaying() &&
    !queue.node.isPaused()
  ) {
    queueSize = 0;
  }

  let nowPlaying = queueSize === 0;

  let title = playlist
    ? playlist.type === "album"
      ? titles.album
      : titles.playlist
    : nowPlaying
    ? titles.nowplaying
    : `**${titles.track} #${queueSize}**`;

  if (interaction === "playerStart") {
    nowPlaying = true;

    title = titles.nowplaying;
  } else if (commandName) {
    if (commandName === "previous") {
      nowPlaying = true;

      title = titles.previous;
    } else if (commandName === "replay") {
      nowPlaying = true;

      title = titles.replay;
    } else if (commandName === "skip") {
      if (queueSize >= 1 && queue.currentTrack) {
        nowPlaying = true;

        title = titles.nowplaying;
      } else {
        nowPlaying = false;

        title = titles.skip;
      }
    }
  } else if (customId) {
    author = {
      name: user.globalName || user.username,
      iconURL: user.displayAvatarURL({ size: 1024, dynamic: true }),
    };

    if (customId === "previous-button") {
      nowPlaying = true;

      title = titles.previous;
    } else if (customId === "skip-button") {
      if (queueSize >= 1 && queue.currentTrack) {
        nowPlaying = true;

        title = titles.nowplaying;
      } else {
        nowPlaying = false;

        title = titles.skip;
      }
    }
  }

  const duration = setDurationLabel(song.duration);
  const description = `**[${song.title}](${song.url})**\n**${song.author}**\n${duration}`;

  const thumbnail = song.thumbnail;

  const { iconURL, text, color } = determineSourceAndColor(song.url);

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
      return `**${i + 1}.** \`[${setDurationLabel(song.duration)}]\` [${
        song.title
      } -- ${song.author}](${song.url})`;
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

async function createPauseEmbed(interaction, queue) {
  const { commandName, commandId, user } = interaction;
  let title;
  let thumbnail;

  const author = interaction.customId
    ? {
        name: user.globalName || user.username,
        iconURL: user.displayAvatarURL({
          size: 1024,
          dynamic: true,
        }),
      }
    : undefined;

  await queue.node.setPaused(!queue.node.isPaused());

  if (queue.node.isPaused()) {
    title = titles.pause;
    thumbnail = thumbnails.pause;
  } else {
    if (!queue.node.isPlaying()) await queue.node.play();

    title = titles.resume;
    thumbnail = thumbnails.resume;
  }

  const commandLabel = interaction.customId
    ? "pause-button"
    : `</${commandName}:${commandId}>`;
  const description = `Use ${commandLabel} again or click the button below to toggle.`;

  const { color } = determineSourceAndColor("music");

  const embed = createEmbed({
    title,
    description,
    color,
    author,
    thumbnail,
  });

  return embed;
}

function createQueueEmbed(page, totalPages, queue) {
  const title = titles.queue;
  const queueTitle = queue.node.isPlaying() ? titles.nowplaying : titles.pause;

  const queueString = queue.tracks.data
    .slice(page * 10, page * 10 + 10)
    .map((song, i) => {
      return `**${page * 10 + i + 1}.** \`[${setDurationLabel(
        song.duration
      )}]\` ["${song.title}" by "${song.author}"](${song.url})`;
    })
    .join("\n");

  const queueStringLength = queue.tracks.size;
  const song = queue.currentTrack;
  const bar = queue.node.createProgressBar({
    timecodes: true,
    queue: false,
    length: 14,
  });

  const repeatModes = ["None", "Repeat track", "Repeat queue", "Autoplay"];
  const repeatDescription =
    queue.repeatMode > 0
      ? `**🔁 ${repeatModes[queue.repeatMode]}** mode is enabled.\n`
      : "";

  const filtersDescription =
    queue.filters.ffmpeg.filters.length > 0
      ? `**✨ ${queue.filters.ffmpeg.filters.length} filters are enabled :** ${queue.filters.ffmpeg.filters}\n`
      : "";

  const description =
    `${repeatDescription}${filtersDescription}\n${queueTitle}\n` +
    `**[${song.title}](${song.url})**\n**${song.author}**` +
    `\n\n` +
    bar +
    `\n\n### ${titles.upcoming}\n` +
    (queueStringLength > 0 ? `${queueString}` : "None");

  const color = colors.music;
  const iconURL = footers.page;
  const text = `Page ${
    page + 1
  } of ${totalPages} (${queueStringLength} Tracks)`;

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
  const timer = requiredVotes * 10;

  let description;
  let thumbnail;

  switch (phase) {
    case "start":
      description = `**${requiredVotes}** votes to skip.\n${timer} seconds left.`;
      thumbnail = thumbnails.voteskip;
      break;
    case "success":
      description = `Required votes have been collected. Skipping...`;
      thumbnail = thumbnails.successvote;
      break;
    case "fail":
      description = `Voting phase ended. Not enough votes were collected.`;
      thumbnail = thumbnails.failvote;
      break;
  }

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

function createFavoriteEmbed(owner, song, favoriteMode, favoriteLength) {
  const user = owner.globalName || owner.username;
  const name = `${user}'s Favorites (${favoriteLength} Tracks)`;
  const avatar = owner.displayAvatarURL({ size: 1024, dynamic: true });

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

  const description = `${descriptionMode}\nUse </favorite play:1108681222764367962> to play your playlist.`;

  const { iconURL, text, color } = determineSourceAndColor("favorite");

  const embed = createEmbed({
    title,
    description,
    color,
    author: {
      name,
      iconURL: avatar,
    },
    thumbnail,
    footer: {
      iconURL,
      text,
    },
  });

  return embed;
}

function createPlayFavoriteEmbed(owner, queue, song, target, length) {
  const user = owner.globalName || owner.username;
  const name = target
    ? `${user}'s Favorites (Track #${target})`
    : `${user}'s Favorites (${length} Tracks)`;
  const avatar = owner.displayAvatarURL({ size: 1024, dynamic: true });

  let queueSize = queue.tracks.size;

  if (
    queueSize === 0 &&
    queue.currentTrack &&
    queue.currentTrack.url !== song.url
  ) {
    queueSize = 1;
  } else if (
    queueSize >= 1 &&
    !queue.node.isPlaying() &&
    !queue.node.isPaused()
  ) {
    queueSize = 0;
  }

  const nowPlaying = queueSize === 0;

  const title = target
    ? nowPlaying
      ? titles.nowplaying
      : `**${titles.track} #${queueSize}**`
    : titles.playlist;

  const duration = setDurationLabel(song.duration);
  const description = `**[${song.title}](${song.url})**\n**${song.author}**\n${duration}`;

  const thumbnail = song.thumbnail;

  const { iconURL, text, color } = determineSourceAndColor("favorite");

  const embed = createEmbed({
    title,
    description,
    color,
    author: {
      name,
      iconURL: avatar,
    },
    thumbnail,
    footer: {
      iconURL,
      text,
    },
  });

  return { embed, nowPlaying };
}

function createViewFavoriteEmbed(owner, object, target, page, totalPages) {
  const user = owner.globalName || owner.username;
  const name = target
    ? `${user}'s Favorites (Track #${target})`
    : `${user}'s Favorites (${object.length} Tracks)`;
  const avatar = owner.displayAvatarURL({ size: 1024, dynamic: true });

  const title = titles.viewfavorite;

  let description;
  let thumbnail;

  if (target) {
    description = `**[${object.title}](${object.url})**\n**${object.author}**\n${object.duration}`;
    thumbnail = object.thumbnail;
  } else {
    const joinedPlaylist = object.slice(page * 10, page * 10 + 10).join("\n");

    description = joinedPlaylist;
    thumbnail = undefined;
  }

  const { iconURL, color } = determineSourceAndColor("favorite");

  const text = target
    ? determineSourceAndColor("favorite")
    : `Favorite | Page ${page + 1} of ${totalPages}`;

  const embed = createEmbed({
    title,
    description,
    color,
    author: {
      name,
      iconURL: avatar,
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
  const user = owner.globalName || owner.username;
  const name = target
    ? `${user}'s Favorites (Track #${target})`
    : `${user}'s Favorites`;
  const avatar = owner.displayAvatarURL({ size: 1024, dynamic: true });

  const title = titles.viewfavorite;

  const mode = target ? `**[${song.title}](${song.url})**` : "**all tracks**";
  const description = `You are about to delete ${mode} from your playlist.\nAre you sure you want to continue?`;

  const thumbnail = thumbnails.deletewarning;

  const { iconURL, text, color } = determineSourceAndColor("favorite");

  const embed = createEmbed({
    title,
    description,
    color,
    author: {
      name,
      iconURL: avatar,
    },
    thumbnail,
    footer: {
      iconURL,
      text,
    },
  });

  return embed;
}

function createFilterEmbed(description) {
  const title = titles.filter;
  const thumbnail = thumbnails.filter;
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

function createRepeatEmbed(description) {
  const title = titles.repeat;
  const thumbnail = thumbnails.repeat;
  const { color } = determineSourceAndColor("music");

  const embed = createEmbed({
    title,
    description,
    color,
    thumbnail,
  });

  return embed;
}

function createShuffleEmbed(description) {
  const title = titles.shuffle;
  const thumbnail = thumbnails.shuffle;
  const { color } = determineSourceAndColor("music");

  const embed = createEmbed({
    title,
    description,
    color,
    thumbnail,
  });

  return embed;
}

function createLeaveEmbed() {
  const title = titles.leave;
  const description = "Queue has been destroyed.";
  const thumbnail = thumbnails.leave;
  const { color } = determineSourceAndColor("music");

  const embed = createEmbed({
    title,
    description,
    color,
    thumbnail,
  });

  return embed;
}

module.exports = {
  setDurationLabel,
  createTrackEmbed,
  createSongEmbed,
  createSearchEmbed,
  createPauseEmbed,
  createQueueEmbed,
  createVoteEmbed,
  createFavoriteEmbed,
  createPlayFavoriteEmbed,
  createViewFavoriteEmbed,
  createDeleteWarningFavoriteEmbed,
  createFilterEmbed,
  createRepeatEmbed,
  createShuffleEmbed,
  createLeaveEmbed,
};
