const { SlashCommandBuilder } = require("discord.js");
const { createPauseEmbed } = require("../../utils/player/createMusicEmbed");
const { createPauseButton } = require("../../utils/main/createButtons");
const errorHandler = require("../../utils/main/handleErrors");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Toggle pause mode the current track.")
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
        ////////////// toggle pause mode of queue //////////////
        const embed = await createPauseEmbed(interaction, queue);
        const button = createPauseButton();

        await interaction.reply({
          embeds: [embed],
          components: [button],
        });
        success = true;
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
