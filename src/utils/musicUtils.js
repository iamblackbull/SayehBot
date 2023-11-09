const titles = {
  nowplaying: "**🎵 Now Playing**",
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
  addfavorite: "**Add Track**",
  removefavorite: "**Remove Track**",
  fullfavorite: "**Full Playlist**",
  viewfavorite: "**👁 View Playlist**",
  clearfavorite: "**🚮 Clear Playlist**",
  actioncancelled: "**❌ Action Cancelled**",
};

const colors = {
  youtube: 0xff0000,
  spotify: 0x34eb58,
  soundcloud: 0xeb5534,
  applemusic: 0xfb4f67,
  music: 0x256fc4,
};

const buttons = {
  play: "▶",
  previous: "⏮",
  pause: "⏸",
  skip: "⏭",
  favorite: "🤍",
  lyrics: "🎤",
};

const footers = {
  youtube: "https://i.imgur.com/lP3PjwD.png",
  spotify: "https://i.imgur.com/nMOYQ9T.png",
  soundcloud: "https://i.imgur.com/HCydoIE.png",
  applemusic: "https://i.imgur.com/1lJOb6i.png",
  genius: "https://i.imgur.com/qJJpRQ4.png",
  page: "https://i.imgur.com/RpkfWKy.png",
  favorite: "https://i.imgur.com/lOT3Ii5.png",
  music: "https://i.imgur.com/vI8XyWe.png",
};

const thumbnails = {
  pause: "https://i.imgur.com/8uaJDrj.png",
  resume: "https://i.imgur.com/PUCQ7vZ.png",
  shuffle: "https://i.imgur.com/U2CK9NN.png",
  repeat: "https://i.imgur.com/9E3b5Cv.png",
  filter: "https://i.imgur.com/LlJYfy0.png",
  leave: "https://i.imgur.com/zkXbpHy.png",
  voteskip: "https://i.imgur.com/MgFIhIN.png",
  fullfavorite: "https://i.imgur.com/EpGilgs.png",
  deletewarning: "https://i.imgur.com/WQFdlMq.png",
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

module.exports = {
  titles,
  colors,
  buttons,
  footers,
  thumbnails,
  filters,
};
