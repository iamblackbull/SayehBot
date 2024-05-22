const titles = {
  clear: "**🚮 Clear**",
  delete: "**🚮 Delete**",
  help: "**❔ Help**",
  ping: "**📶 Ping**",
  system: "**💻 System**",
  qr: "**⏹ QR Code**",
  scan: "**🌍 Website Virus Scan**",
  presence: "**Presence Updated**",
  profile: "**Profile Updated**",
  gamble_winner: "**🥇 Winner**",
  gamble_loser: "**☹ Loser**",
  bookmark: "**🔖 Bookmark**",
  error: "**Error**",
  warn: "**Target Warned**",
  warning: "**Warning!**",
  warnlist: "**WarnList**",
  warnrecord: "**Warn Record**",
  reportcase_open: "**Report Case**",
  reportcase_close: "**Case Closed**",
  report_success: "**Successfully Reported**",
  action_failed: "**Action Failed**",
};

const presences = {
  mian: "Chilling Panda 🐼💤",
  stream: "on Twitch 📺",
  video: "New Video on YouTube! 📺",
};

const labels = {
  stream: "Watch Stream",
  video: "Watch Video",
};

const texts = {
  tools: "Tools",
  moderation: "Moderation",
  overwatch: "Overwatch 2",
  gamble: "Gamble",
  wow: "World of Warcraft",
  twitch: "Twitch",
};

const tag = "@everyone";

const colors = {
  default: 0x25bfc4,
  apex: 0xb93038,
  overwatch: 0xf99e1a,
  valorant: 0xfd4556,
  wow: 0xf7941d,
  warning: 0xffea00,
  error: 0xe01010,
  twitch: 0x6441a5,
  gamble_winner: 0x001eff,
  gamble_loser: 0xd20202,
  sunny_weather: 0xffe700,
  clear_weather: 0x00ccff,
  rain_weather: 0x7f9ba6,
  wind_weather: 0x7576e0,
  storm_weather: 0x4e6969,
  cloud_weather: 0xf1f1f1,
  snow_weather: 0xebecf1,
};

const footers = {
  tools: "https://i.imgur.com/l15zpW0.png",
  moderation: "https://i.imgur.com/vuPFn0B.png",
  page: "https://i.imgur.com/RpkfWKy.png",
  apex: "https://i.imgur.com/Pbpwop0.png",
  overwatch: "https://i.imgur.com/ou3sk4U.png",
  gamble: "https://i.imgur.com/2ZXXgx5.png",
  wow: "https://i.imgur.com/n34gUTh.png",
  date: "https://i.imgur.com/BrgcQ9O.png",
  twitch: "https://i.imgur.com/KAb3lpX.png",
};

const thumbnails = {
  tools: "https://i.imgur.com/l15zpW0.png",
  clear: "https://i.imgur.com/FhH4jJL.png",
  delete: "https://i.imgur.com/NA5jsRa.png",
  system: "https://i.imgur.com/UD49B9U.png",
  ping: "https://i.imgur.com/e7YutBG.png",
  no_results: "https://i.imgur.com/mWSzYrQ.png",
  connection_error: "https://i.imgur.com/ZvaYoK6.png",
  warning: "https://i.imgur.com/mlekPA6.png",
  error: "https://i.imgur.com/xyfU2uT.png",
  success: "https://i.imgur.com/jDR8Ihh.png",
  virus: "https://i.imgur.com/XtPASQJ.png",
  busy: "https://i.imgur.com/np3CKvO.png",
  access: "https://i.imgur.com/iJSVpii.png",
  case: "https://i.imgur.com/pHfa5pw.png",
  roll: "https://i.imgur.com/851YpFE.png",
  bookmark: "https://i.imgur.com/FjwLaip.png",
  twitch_sayeh: "https://i.imgur.com/7aO5p95.png",
  twitch_hamid: "https://i.imgur.com/VdPzgLm.png",
  twitch_offline_sayeh: "https://i.imgur.com/6BsizDi.jpg",
  twitch_offline_hamid: "https://i.imgur.com/nmKK3BU.jpg",
};

const urls = {
  youtube_sayeh: "https://www.youtube.com/@Say3h/?sub_confirmation=1",
  youtube_hamid: "https://www.youtube.com/@Hamitz/?sub_confirmation=1",
};

const warnPenalties = [
  { label: "Warning Message", timer: 0 },
  { label: "1 Minute Timeout", timer: 1 * 60 * 1000 },
  { label: "10 Minutes Timeout", timer: 10 * 60 * 1000 },
  { label: "30 Minutes Timeout", timer: 30 * 60 * 1000 },
  { label: "1 Hour Timeout", timer: 1 * 60 * 60 * 1000 },
  { label: "5 Hours Timeout", timer: 5 * 60 * 60 * 1000 },
  { label: "12 Hours Time out", timer: 12 * 60 * 60 * 1000 },
  { label: "1 Day Timeout", timer: 1 * 24 * 60 * 60 * 1000 },
  { label: "1 Week Timeout", timer: 7 * 24 * 60 * 60 * 1000 },
  { label: "2 Week Timeout", timer: 14 * 24 * 60 * 60 * 1000 },
];

const bannedWords = [
  "+18",
  "kos",
  "kir",
  "kun",
  "dick",
  "pussy",
  "ass",
  "boobs",
  "sex",
  "fuck",
  "porn",
  "nude",
  "horny",
  "onlyfans",
  "only fans",
  "کص",
  "کیر",
  "کون",
  "دیک",
  "پوسی",
  "کصکش",
  "ممه",
  "سکس",
  "گایید",
  "پورن",
  "حشری",
];

const formats = ["image/png", "image/gif", "image/jpeg"];
const formatsLabel = ".png, .gif, .jpeg, .jpg";

const tags = {
  music: {
    play: "</play:1047903145071759425>",
    queue: "</queue:1047903145071759427>",
    skip: "</skip:1047903145218547864>",
    song: "</song:1047903145218547865>",
    pause: "</pause:1047903145071759424>",
    search: "</search:1047903145071759430>",
    seek: "</seek:1047903145218547862>",
    repeat: "</repeat:1047903145071759428>",
    filter: "</filter:1047903144752984073>",
    lyrics: "</lyrics:1100831574787891240>",
    leave: "</leave:1047903145071759422>",
    previous: "</previous:1128669764013797467>",
    insert: "</insert:1115953411985244180>",
    replay: "</replay:1161072793220296766>",
    favorite_play: "</favorite play:1108681222764367962>",
    favorite_view: "</favorite view:1108681222764367962>",
    favorite_add: "</favorite add:1108681222764367962>",
    favorite_remove: "</favorite remove:1108681222764367962>",
  },
  gifs: {
    avatar: "</avatar:1047903145218547869>",
    finger: "</finger:1047903145407295498>",
    fuch: "</fuch:1047903145407295499>",
    kish: "</kish:1047903145407295502>",
    kiss: "</kiss:1047903145407295503>",
    space: "</space:1050160950583513189>",
    spank: "</spank:1142109421795807355>",
  },
  mods: {
    simjoin: "</simjoin:1047903145218547868>",
    clear: "</clear:1047903145218547871>",
    xp: "</xp:1047903144752984071>",
    yell: "</yell:1047903145625407488>",
  },
  tools: {
    birthday: "</birthday:1047903145218547870>",
    social: "</social:1047903145407295506>",
    rank: "</rank:1051248003723304963>",
    leaderboard: "</leaderboard:1047903144752984069>",
    weather: "</weather:1047903145407295507>",
    currency: "</currency:1100722765587284050>",
    movie: "</movie:1100722765587284051>",
    system: "</system:1171177751022157895>",
    qr: "<qr:>",
  },
  games: {
    apex: "</apex:1079842730752102551>",
    roll: "</roll:1047903145407295505>",
    steam_market: "</steam market:1100722765587284048>",
    steam_store: "</steam store:1100722765587284048>",
    wow: "</wow:1079842730752102553>",
  },
};

module.exports = {
  titles,
  presences,
  labels,
  colors,
  footers,
  thumbnails,
  texts,
  tag,
  urls,
  warnPenalties,
  formats,
  formatsLabel,
  bannedWords,
  tags,
};
