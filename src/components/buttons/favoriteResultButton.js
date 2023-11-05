const { mongoose } = require("mongoose");
const favorite = require("../../commands/music/favorite");
const embedCreator = require("../../utils/createEmbed");
const favoriteHandler = require("../../utils/handleFavorite");
const errorHandler = require("../../utils/handleErrors");

module.exports = {
  data: {
    name: "favorite-result-button",
  },

  async execute(interaction) {
    ////////////// return checks //////////////
    if (mongoose.connection.readyState !== 1) {
      return errorHandler.handleDatabaseError(interaction);
    }

    const { song } = favorite;
    if (!song) return;

    ////////////// original response //////////////
    await interaction.deferReply({
      fetchReply: true,
      ephemeral: true,
    });

    const favoriteMode = await favoriteHandler.handleTrack(interaction);
    const embed = embedCreator.createFavoriteEmbed(song, favoriteMode);

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
