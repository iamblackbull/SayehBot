const chalk = require("chalk");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
const fs = require("fs");

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
      console.log(chalk.cyan("Retrieving application slash commands..."));

      await rest.put(Routes.applicationCommands(clientID), {
        body: client.commandArray,
      });

      console.log(
        chalk.green("Successfully retrieved application slash commands.")
      );
    } catch (error) {
      console.error(error);
    }
  };
};
