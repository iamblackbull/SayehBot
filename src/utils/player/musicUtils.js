const titles = {
  nowplaying: "**🎵 Now Playing**",
  track: "🎵 Track",
  album: "**🎶 Album**",
  playlist: "**🎶 Playlist**",
  voteskip: "**⏭ Vote Skip**",
  skip: "**⏭ Skip**",
  previous: "**⏮ Previous**",
  replay: "**🔄 Replay**",
  seek: "**⏩ Seek**",
  upcoming: "**⏭ Upcoming Tracks**",
  pause: "**⏸ Pause**",
  resume: "**⏯ Resume**",
  repeat: "**🔁 Repeat**",
  shuffle: "**🔀 Shuffle**",
  queue: "**🔗 Queue**",
  filter: "**✨ Audio Filters**",
  search: "**🔎 Search Result**",
  leave: "**❎ Leave**",
  addfavorite: "**➕ Add Track**",
  removefavorite: "➖ **Remove Track**",
  fullfavorite: "**Full Playlist**",
  viewfavorite: "**👁 View Playlist**",
  clearfavorite: "**🚮 Clear Playlist**",
  actioncancelled: "**❌ Action Cancelled**",
};

const colors = {
  youtube: "#ff0000",
  spotify: "#1db954",
  soundcloud: "#ff5500",
  applemusic: "#f94c57",
  music: "#256fc4",
};

const buttons = {
  bookmark: "🔖",
  play: "▶",
  previous: "⏮",
  pause: "⏸",
  skip: "⏭",
  shuffle: "🔀",
  favorite: "🤍",
};

const footers = {
  youtube: "https://i.imgur.com/lP3PjwD.png",
  spotify: "https://i.imgur.com/nMOYQ9T.png",
  soundcloud: "https://i.imgur.com/q07BmFw.png",
  applemusic: "https://i.imgur.com/1lJOb6i.png",
  genius: "https://i.imgur.com/qJJpRQ4.png",
  page: "https://i.imgur.com/RpkfWKy.png",
  favorite: "https://i.imgur.com/lOT3Ii5.png",
  music: "https://i.imgur.com/vI8XyWe.png",
};

const texts = {
  applemusic: "Apple Music",
  youtube: "YouTube",
  spotify: "Spotify",
  soundcloud: "Soundcloud",
  favorite: "Favorite",
  music: "Music",
};

const thumbnails = {
  pause: "https://i.imgur.com/8uaJDrj.png",
  resume: "https://i.imgur.com/PUCQ7vZ.png",
  shuffle: "https://i.imgur.com/U2CK9NN.png",
  repeat: "https://i.imgur.com/9E3b5Cv.png",
  filter: "https://i.imgur.com/LlJYfy0.png",
  leave: "https://i.imgur.com/zkXbpHy.png",
  voteskip: "https://i.imgur.com/MgFIhIN.png",
  successvote: "https://i.imgur.com/BjvYAao.png",
  failvote: "https://i.imgur.com/8ef49od.png",
  fullfavorite: "https://i.imgur.com/EpGilgs.png",
  emptyfavorite: "https://i.imgur.com/rXXcmhq.png",
  deletewarning: "https://i.imgur.com/WQFdlMq.png",
  system: "https://i.imgur.com/UD49B9U.png",
};

const filters = [
  {
    label: "8D",
    value: "8D",
    description: "Simulate surround audio effect.",
    emoji: "🎧",
  },
  {
    label: "Normalizer",
    value: "normalizer",
    description: "Normalize the audio (avoid distortion).",
    emoji: "🎼",
  },
  {
    label: "Bass boost",
    value: "bassboost_high",
    description: "Boost the bass of the audio.",
    emoji: "🔊",
  },
  {
    label: "Nightcore",
    value: "nightcore",
    description: "Speed up the audio (higher pitch).",
    emoji: "💨",
  },
  {
    label: "Vaporwave",
    value: "vaporwave",
    description: "Slow down the audio (lower pitch).",
    emoji: "🐌",
  },
  {
    label: "Reverse",
    value: "reverse",
    description: "Reverse the audio.",
    emoji: "◀",
  },
  {
    label: "Fade-in",
    value: "fadein",
    description: "Add a progressive increase in the volume of the audio.",
    emoji: "📈",
  },
  {
    label: "Karaoke",
    value: "karaoke",
    description: "Lower the singer's voice from the audio.",
    emoji: "🎤",
  },
  {
    label: "Vibrato",
    value: "vibrato",
    description: "Make the notes change pitch subtly and quickly.",
    emoji: "📳",
  },
  {
    label: "Earrape",
    value: "earrape",
    description: "Add a extremely loud and distorted audio.",
    emoji: "👂",
  },
];

const favoriteSizes = [
  { label: "Tier 1", value: 100 },
  { label: "Tier 2", value: 150 },
  { label: "Tier 3", value: 200 },
];

module.exports = {
  titles,
  colors,
  buttons,
  footers,
  texts,
  thumbnails,
  filters,
  favoriteSizes,
};
