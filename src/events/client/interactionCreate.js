const { Events } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { titles, colors, thumbnails } = require("../../utils/main/mainUtils");
const { calculateXP } = require("../../utils/level/handleXPRate");
const { handleInteractionXp } = require("../../utils/level/handleLevel");
const Levels = require("discord-xp");

Levels.setURL(process.env.DBTOKEN);

const failedEmbed = new EmbedBuilder()
  .setTitle(titles.error)
  .setColor(colors.error)
  .setThumbnail(thumbnails.error);

const notFoundError = "COMMAND_NOT_FOUND";

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    if (interaction.commandName !== "roll") {
      const user = await Levels.fetch(
        interaction.user.id,
        interaction.guild.id
      );
      const { finalXp } = calculateXP(interaction, user);

      await handleInteractionXp(interaction, finalXp);
    }

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
        failedEmbed.setDescription(
          `Something went wrong while executing ${commandName} command.\nCode: ${error.code}`
        );

        console.error(error);

        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({
            embeds: [failedEmbed],
          });
        } else {
          await interaction.reply({
            embeds: [failedEmbed],
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
        failedEmbed.setDescription(
          `Something went wrong while executing ${commandName} Context Menu command.\nCode: ${error.code}`
        );

        console.error(error);

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
          `Something went wrong while executing ${customId} button command.\nCode: ${notFoundError}`
        );

      try {
        await button.execute(interaction, client);
      } catch (error) {
        console.log(error);

        return new Error(
          `Something went wrong while executing ${customId} button command.\nCode: ${error.code}`
        );
      }
    } else if (interaction.isModalSubmit()) {
      const { modals } = client;
      const { customId } = interaction;
      const modal = modals.get(customId);

      if (!modal)
        return new Error(
          `Something went wrong while executing ${customId} modal command.\nCode: ${notFoundError}`
        );

      try {
        await modal.execute(interaction, client);
      } catch (error) {
        console.log(error);

        return new Error(
          `Something went wrong while executing ${customId} modal command.\nCode: ${error.code}`
        );
      }
    }
  },
};
