const { SlashCommandBuilder } = require("discord.js");
const errorHandler = require("../../utils/handleErrors");
const embedCreator = require("../../utils/createEmbed");
const buttonCreator = require("../../utils/createButtons");
const deletionHandler = require("../../utils/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("song")
    .setDescription("Get info about the current track.")
    .setDMPermission(false),

  async execute(interaction, client) {
    ////////////// base variables //////////////
    const queue = client.player.nodes.get(interaction.guildId);
    let success = false;

    if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (!queue || !queue.currentTrack) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        await interaction.deferReply({
          fetchReply: true,
        });

        ////////////// original response //////////////
        const embed = embedCreator.createSongEmbed(queue);
        const button = buttonCreator.createButtons();

        await interaction.editReply({
          embeds: [embed],
          components: [button],
        });

        success = true;
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
