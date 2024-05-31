const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");
const { mongoose } = require("mongoose");
const favoriteModel = require("../../database/favoriteModel");
const errorHandler = require("../../utils/main/handleErrors");
const { createFavoriteQueue } = require("../../utils/player/createQueue");
const { search, searchFavorite } = require("../../utils/player/handleSearch");
const embedCreator = require("../../utils/player/createMusicEmbed");
const { handleData } = require("../../utils/player/handlePlayerData");
const { createButtons } = require("../../utils/main/createButtons");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("play favorite")
    .setType(ApplicationCommandType.User)
    .setDMPermission(false),

  async execute(interaction, client) {
    ////////////// base variables //////////////
    let success = false;
    const owner = interaction.targetUser;

    const favoriteList = await favoriteModel.findOne({
      User: owner.id,
    });

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (!favoriteList || favoriteList.Playlist.length === 0) {
      errorHandler.handleEmptyPlaylistError(interaction, owner);
    } else if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      let queue = client.player.nodes.get(interaction.guildId) || false;

      const playlist = favoriteList.Playlist.map((song) => song.Url).join("\n");
      const splitPlaylist = playlist.split("\n");
      const playlistLength = splitPlaylist.length;

      ////////////// first song data //////////////
      const query = splitPlaylist[0];
      const result = await search(query);

      const song = result.tracks[0];

      if (!queue) {
        queue = await createFavoriteQueue(client, interaction, song);
      }

      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel);
      }

      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        if (!result.hasTracks()) {
          errorHandler.handleNoResultError(interaction);
        } else {
          ////////////// add first track to queue //////////////
          await queue.addTrack(song);

          ////////////// original response //////////////
          const embedData = embedCreator.createPlayFavoriteEmbed(
            owner,
            queue,
            song,
            false,
            playlistLength
          );

          await handleData(interaction, embedData.nowPlaying);

          if (!queue.node.isPlaying() && !queue.node.isPaused())
            await queue.node.play();

          const button = createButtons(embedData.nowPlaying);

          await interaction.editReply({
            embeds: [embedData.embed],
            components: [button],
          });

          success = true;

          ////////////// add rest of tracks to queue //////////////
          const { resultArray } = await searchFavorite(splitPlaylist, 1);

          await queue.addTrack(resultArray);
        }
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
