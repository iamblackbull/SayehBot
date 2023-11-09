const { mongoose } = require("mongoose");
const embedCreator = require("../../utils/createEmbed");
const favoriteHandler = require("../../utils/handleFavorite");
const errorHandler = require("../../utils/handleErrors");

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
    if (queue.tracks.size === 0) return;

    const song = queue.currentTrack;
    if (!song) return;

    ////////////// original response //////////////
    await interaction.deferReply({
      fetchReply: true,
      ephemeral: true,
    });

    const favoriteMode = await favoriteHandler.handleTrack(interaction, client);
    const embed = embedCreator.createFavoriteEmbed(song, favoriteMode);

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
