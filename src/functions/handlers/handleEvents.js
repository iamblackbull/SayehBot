const fs = require("fs");
const { connection } = require("mongoose");
const { useMainPlayer } = require("discord-player");
const { setupTwitch } = require("../../utils/api/setupTwitch");
const executing = require("node:process");

module.exports = (client) => {
  client.handleEvents = async () => {
    const eventFolders = fs.readdirSync(`./src/events`);
    const tracker = setupTwitch();

    for (const folder of eventFolders) {
      const eventFiles = fs
        .readdirSync(`./src/events/${folder}`)
        .filter((file) => file.endsWith(".js"));

      switch (folder) {
        case "client":
        case "logs":
        case "music":
        case "server":
        case "level":
        case "notifications":
          for (const file of eventFiles) {
            const event = require(`../../events/${folder}/${file}`);

            if (event.once) {
              client.once(event.name, (...args) =>
                event.execute(...args, client)
              );
            } else {
              client.on(event.name, (...args) =>
                event.execute(...args, client)
              );
            }
          }
          break;

        case "mongo":
          for (const file of eventFiles) {
            const event = require(`../../events/${folder}/${file}`);

            if (event.once) {
              connection.once(event.name, (...args) =>
                event.execute(...args, client)
              );
            } else {
              connection.on(event.name, (...args) =>
                event.execute(...args, client)
              );
            }
          }
          break;

        case "player":
          for (const file of eventFiles) {
            const event = require(`../../events/${folder}/${file}`);
            const player = useMainPlayer();

            if (event.isPlayerEvent) {
              player.events.on(event.name, (...args) => event.execute(...args));
            } else {
              player.on(event.name, (...args) => event.execute(...args));
            }
          }
          break;

        case "executing":
          for (const file of eventFiles) {
            const event = require(`../../events/${folder}/${file}`);

            executing.on(event.name, (reason) => event.execute(reason));
          }
          break;

        case "tracker":
          for (const file of eventFiles) {
            const event = require(`../../events/${folder}/${file}`);

            tracker.on(event.name, (...args) => event.execute(...args, client));
          }
          break;

        default:
          break;
      }
    }
  };
};
