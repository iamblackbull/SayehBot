const { SlashCommandBuilder } = require("discord.js");
const errorHandler = require("../../utils/handleErrors");
const embedCreator = require("../../utils/createEmbed");
const buttonCreator = require("../../utils/createButtons");
const deletionHandler = require("../../utils/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("replay")
    .setDescription("Replay the currently playing track back from the top.")
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

        ////////////// replay track //////////////
        const song = queue.currentTrack;

        await queue.node.seek(0);

        ////////////// original response //////////////
        const { embed, nowPlaying } = embedCreator.createTrackEmbed(
          interaction,
          queue,
          false,
          song
        );

        const button = buttonCreator.createButtons(nowPlaying);

        await interaction.editReply({ embeds: [embed], components: [button] });
        success = true;
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
