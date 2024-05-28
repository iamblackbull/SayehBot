const { SlashCommandBuilder } = require("discord.js");
const errorHandler = require("../../utils/main/handleErrors");
const { createSongEmbed } = require("../../utils/player/createMusicEmbed");
const { createButtons } = require("../../utils/main/createButtons");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("current")
    .setDescription("Get info about the current track")
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
        const embed = createSongEmbed(queue, interaction);
        const button = createButtons(true);

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
