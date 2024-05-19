require("dotenv").config();
const { TOKEN, DBTOKEN } = process.env;
const { connect, mongoose } = require("mongoose");
const fs = require("fs");
const { Player } = require("discord-player");
const executing = require("node:process");
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const {
  booleans,
  cooldowns,
  ytdlOptions,
} = require("./utils/player/queueUtils");
const { getClient } = require("./utils/main/handleNotifications");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  shards: "auto",
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
  ],
});

getClient(client);

client.player = new Player(client, {
  ...booleans,
  ...cooldowns,
  ...ytdlOptions,
});
client.player.extractors.loadDefault();

executing.on("unhandledRejection", (reason) => {
  console.log("Unhandled Rejection with reason:\n", reason);
});
executing.on("uncaughtException", (reason) => {
  console.log("Uncaugh Exception with reason:\n", reason);
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
