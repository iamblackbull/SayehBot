const { EmbedBuilder, Events } = require("discord.js");
const utils = require("../../utils/main/mainUtils");
const { getUser } = require("../../utils/level/handleLevel");
const { calculateXP } = require("../../utils/level/handleXPRate");
const { handleInteractionXp } = require("../../utils/level/handleLevel");

const xpCooldown = new Set();

const failedEmbed = new EmbedBuilder()
  .setTitle(utils.titles.error)
  .setColor(utils.colors.error)
  .setThumbnail(utils.thumbnails.error);

const notFoundError = "COMMAND_NOT_FOUND";

module.exports = {
  name: Events.InteractionCreate,

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
      const { commandName, user } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);

        console.log(
          `${utils.consoleTags.app} ${user.username} executed ${commandName} command.`
        );
      } catch (error) {
        const errorText = error.code || error.message;

        failedEmbed.setDescription(
          `Something went wrong while executing ${commandName} command.\nCode: ${errorText}`
        );

        console.error(
          `${utils.consoleTags.error} While executing ${commandName} command.`,
          error
        );

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
      const { commandName, user } = interaction;
      const contextCommand = commands.get(commandName);
      if (!contextCommand) return;

      try {
        await contextCommand.execute(interaction, client);

        console.log(
          `${utils.consoleTags.app} ${user.username} executed ${commandName} context menu command.`
        );
      } catch (error) {
        const errorText = error.code || error.message;

        failedEmbed.setDescription(
          `Something went wrong while executing ${commandName} context Menu command.\nCode: ${errorText}`
        );

        console.error(
          `${utils.consoleTags.error} While executing ${commandName} context menu command.`,
          error
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
      const { customId, user } = interaction;
      const button = buttons.get(customId);

      if (!button)
        return new Error(
          `${utils.consoleTags.error} While executing ${customId} button.\nCode: ${notFoundError}`
        );

      try {
        await button.execute(interaction, client);

        console.log(
          `${utils.consoleTags.app} ${user.username} executed ${customId} button.`
        );
      } catch (error) {
        const errorText = error.code || error.message;

        return new Error(
          `${utils.consoleTags.error} While executing ${customId} button.\nCode: ${errorText}`
        );
      }
    } else if (interaction.isModalSubmit()) {
      const { modals } = client;
      const { customId, user } = interaction;
      const modal = modals.get(customId);

      if (!modal)
        return new Error(
          `${utils.consoleTags.error} While executing ${customId} modal.\nCode: ${notFoundError}`
        );

      try {
        await modal.execute(interaction, client);

        console.log(
          `${utils.consoleTags.app} ${user.username} executed ${customId} modal.`
        );
      } catch (error) {
        const errorText = error.code || error.message;

        return new Error(
          `${utils.consoleTags.error} While executing ${customId} modal.\nCode: ${errorText}`
        );
      }
    }

    const { commandName, guildId, user } = interaction;

    if (commandName === "roll" || commandName === "blackjack") return;
    if (interaction.isAutocomplete()) return;
    if (!guildId) return;

    if (xpCooldown.has(user.id)) return;
    xpCooldown.add(user.id);

    const levelProfile = await getUser(guildId, user);
    const XP = await calculateXP(interaction, levelProfile);

    await handleInteractionXp(interaction, XP);

    setTimeout(() => {
      xpCooldown.delete(user.id);
    }, 10_000);
  },
};
