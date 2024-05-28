const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
const fs = require("fs");
const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync("./src/commands");

    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      const { commands, commandArray } = client;

      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);

        commands.set(command.data.name, command);

        commandArray.push(command.data.toJSON());
      }
    }

    const clientID = process.env.clientID;
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
      console.log("[Application Commands] Refreshing....");

      await rest.put(Routes.applicationCommands(clientID), {
        body: client.commandArray,
      });

      console.log("[Application Commands] Successfully refreshed.");
    } catch (error) {
      console.error(`${consoleTags.error} While refreshing commands: `, error);
    }
  };
};
