const { mongoose } = require("mongoose");
const embedCreator = require("../../utils/player/createMusicEmbed");
const favoriteHandler = require("../../utils/player/handleFavorite");
const errorHandler = require("../../utils/main/handleErrors");

module.exports = {
  data: {
    name: "favorite-button",
  },

  async execute(interaction, client) {
    ////////////// return checks //////////////
    if (mongoose.connection.readyState !== 1) {
      return errorHandler.handleDatabaseError(interaction);
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

    const { favoriteMode, favoriteLength } = await favoriteHandler.handleTrack(
      interaction,
      client
    );

    const embed = embedCreator.createFavoriteEmbed(
      song,
      favoriteMode,
      favoriteLength
    );

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
