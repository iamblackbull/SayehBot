const { EmbedBuilder } = require("discord.js");

let failedEmbed = new EmbedBuilder()
  .setTitle(`Error`)
  .setDescription(`Something went wrong while executing this command...`)
  .setColor(0xe01010)
  .setThumbnail(
    `https://cdn.pixabay.com/photo/2015/06/09/16/12/error-803716_1280.png`
  );

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isAutocomplete()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.autocompleteRun(interaction, client);
      } catch (error) {
        return;
      }
    } else if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        if (interaction.deferReply) {
          await interaction.editReply({
            embeds: [failedEmbed],
          });
        } else {
          await interaction.reply({
            embeds: [failedEmbed],
            ephemeral: true,
          });
        }
        setTimeout(() => {
          interaction.deleteReply().catch(console.error);
        }, 2 * 60 * 1000);
      }
    } else if (interaction.isContextMenuCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const contextCommand = commands.get(commandName);
      if (!contextCommand) return;

      try {
        await contextCommand.execute(interaction, client);
      } catch (error) {
        console.error(error);
        failedEmbed.setDescription(
          `Something went wrong while executing this Context Menu command...`
        );
        if (!interaction.reply) {
          await interaction.reply({
            embeds: [failedEmbed],
            ephemeral: true,
          });
        } else {
          await interaction.editReply({
            embeds: [failedEmbed],
          });
        }
        setTimeout(() => {
          interaction.deleteReply().catch(console.error);
        }, 2 * 60 * 1000);
      }
    } else if (interaction.isButton()) {
      const { buttons } = client;
      const { customId } = interaction;
      const button = buttons.get(customId);
      if (!button)
        return new Error(
          `Something went wrong while executing this button command...`
        );

      try {
        await button.execute(interaction, client);
      } catch (error) {
        console.log(error);
      }
    } else if (interaction.isModalSubmit()) {
      const { modals } = client;
      const { customId } = interaction;
      const modal = modals.get(customId);
      if (!modal)
        return new Error(
          `Something went wrong while executing this modal command...`
        );

      try {
        await modal.execute(interaction, client);
      } catch (error) {
        console.log(error);
      }
    }
  },
};
