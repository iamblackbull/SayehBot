require("dotenv").config();
const { TOKEN, DBTOKEN } = process.env;
const { connect, mongoose } = require("mongoose");
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const fs = require("fs");
const { Player } = require("discord-player");
const executing = require("node:process");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
  shards: "auto",
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
  ],
});

client.player = new Player(client, {
  useLegacyFFmpeg: false,
  leaveOnEnd: true,
  leaveOnEmpty: true,
  leaveOnEndCooldown: 5 * 60 * 1000,
  leaveOnEmptyCooldown: 5 * 1000,
  smoothVolume: true,
  ytdlOptions: {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
});
client.player.extractors.loadDefault();
client.player.events.on("connection", function (queue) {
  queue.connection.on(
    "stateChange",
    function (oldState, newState) {
      var oldNetworking = Reflect.get(oldState, "networking");
      var newNetworking = Reflect.get(newState, "networking");
      var networkStateChangeHandler = function (
        oldNetworkState,
        newNetworkState
      ) {
        var newUdp = Reflect.get(newNetworkState, "udp");
        clearInterval(
          newUdp === null || newUdp === void 0
            ? void 0
            : newUdp.keepAliveInterval
        );
      };
      oldNetworking === null || oldNetworking === void 0
        ? void 0
        : oldNetworking.off("stateChange", networkStateChangeHandler);
      newNetworking === null || newNetworking === void 0
        ? void 0
        : newNetworking.on("stateChange", networkStateChangeHandler);
    }
  );
});

executing.on("unhandledRejection", (reason) => {
  console.log(`Unhandled Rejection with reason:\n`, reason);
});
executing.on("uncaughtException", (reason) => {
  console.log(`Uncaugh Exception with reason:\n`, reason);
});

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(TOKEN);

mongoose.set("strictQuery", false);

(async () => {
  await connect(DBTOKEN).catch(console.error);
})();
