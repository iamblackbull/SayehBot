const { mongoose } = require("mongoose");
const { handleDatabaseError } = require("../../utils/main/handleErrors");
const { handleTrack } = require("../../utils/player/handleFavorite");
const { createFavoriteEmbed } = require("../../utils/player/createMusicEmbed");

module.exports = {
  data: {
    name: "favorite-button",
  },

  async execute(interaction, client) {
    ////////////// return checks //////////////
    if (mongoose.connection.readyState !== 1) {
      return handleDatabaseError(interaction);
    }

    const queue = client.player.nodes.get(interaction.guildId);
    if (!queue) return;

    const song = queue.currentTrack;
    if (!song) return;

    ////////////// original response //////////////
    await interaction.deferReply({
      fetchReply: true,
      ephemeral: true,
    });

    const { favoriteMode, favoriteLength } = await handleTrack(
      interaction,
      client
    );

    const embed = createFavoriteEmbed(
      interaction.user,
      song,
      favoriteMode,
      favoriteLength
    );

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
