const { SlashCommandBuilder } = require("discord.js");
const { mongoose } = require("mongoose");
const favorite = require("../../schemas/favorite-schema");
const errorHandler = require("../../utils/handleErrors");
const queueCreator = require("../../utils/createQueue");
const searchHandler = require("../../utils/handleSearch");
const playerDataHandler = require("../../utils/handlePlayerData");
const embedCreator = require("../../utils/createEmbed");
const favoriteHandler = require("../../utils/handleFavorite");
const buttonCreator = require("../../utils/createButtons");
const reactHandler = require("../../utils/handleReaction");
const deletionHandler = require("../../utils/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("favorite")
    .setDescription("Interact with favortie playlists.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("play")
        .setDescription("Play a favorite playlist.")
        .addIntegerOption((option) =>
          option
            .setName("position")
            .setDescription("Input a favorite playlist track position to play.")
            .setMinValue(1)
            .setRequired(false)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Pick any member to play their favorite playlist.")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View and interact with a favorite playlist.")
        .addIntegerOption((option) =>
          option
            .setName("position")
            .setDescription("Input a favorite playlist track position to view.")
            .setMinValue(1)
            .setRequired(false)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Pick any member to view their favorite playlist.")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a track to your own favorite playlist.")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Input a track url.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription(
          "Delete a track or clear all tracks from your own favorite playlist."
        )
        .addIntegerOption((option) =>
          option
            .setName("position")
            .setDescription(
              "Input a favorite playlist track position to delete."
            )
            .setMinValue(1)
            .setRequired(false)
        )
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    ////////////// base variables //////////////
    let success = false;
    const { options } = interaction;
    const sub = options.getSubcommand();
    const owner = options.getUser("user") || interaction.user;

    let favoriteList = await favorite.findOne({
      User: owner.id,
    });

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (favoriteList?.Playlist.length === 0) {
      errorHandler.handleEmptyPlaylistError(interaction, owner);
    } else if (sub === "play" && !interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else {
      const favoriteEmbed = await interaction.deferReply({
        fetchReply: true,
      });

      const playlist = favoriteList.Playlist.map((song) => song.Url).join("\n");
      const splitPlaylist = playlist.split("\n");
      const playlistLength = splitPlaylist.length;

      let target = options.getInteger("position") || false;
      if (target > playlistLength) target = playlistLength;

      let queue = client.player.nodes.get(interaction.guildId) || false;
      let sameChannel = false;

      ////////////// first song data //////////////
      const inputQuery = options.getString("query") || false;

      const query = target
        ? splitPlaylist[target - 1]
        : inputQuery
        ? inputQuery
        : splitPlaylist[0];

      const result = await searchHandler.search(query);

      const song = result.tracks[0];

      module.exports = { song };

      switch (sub) {
        ////////////// handling play subcommand //////////////
        case "play":
          if (!queue) {
            queue = await queueCreator.createFavoriteQueue(
              client,
              interaction,
              song
            );
          }

          if (!queue.connection) {
            await queue.connect(interaction.member.voice.channel);
          }

          sameChannel =
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

              const length = playlistLength - 1;

              ////////////// original response //////////////
              const { embed, nowPlaying } =
                embedCreator.createPlayFavoriteEmbed(
                  owner,
                  queue,
                  song,
                  target,
                  length
                );

              await playerDataHandler.handleData(interaction, nowPlaying);

              if (!queue.node.isPlaying() && !queue.node.isPaused())
                await queue.node.play();

              const button = buttonCreator.createButtons(nowPlaying);

              await interaction.editReply({
                embeds: [embed],
                components: [button],
              });

              success = true;

              ////////////// add rest of tracks to queue //////////////
              if (!target) {
                const { mappedArray, resultArray } =
                  await searchHandler.searchFavorite(splitPlaylist, 1);

                await queue.addTrack(resultArray);
              }
            }
          }

          break;

        ////////////// handling view subcommand //////////////
        case "view":
          const { mappedArray, resultArray } =
            await searchHandler.searchFavorite(splitPlaylist, 0);

          if (mappedArray.length === 0) {
            errorHandler.handleNoResultError(interaction);
          } else {
            let page = 0;
            let totalPages =
              mappedArray.length > 10 ? Math.ceil(mappedArray.length / 10) : 1;

            let embed = embedCreator.createViewFavoriteEmbed(
              owner,
              song,
              target,
              page,
              mappedArray
            );

            if (target) {
              const button = buttonCreator.createFavoriteButtons();

              await interaction.editReply({
                embeds: [embed],
                components: [button],
              });
            } else {
              await interaction.editReply({
                embeds: [embed],
              });
            }

            success = "favorite";

            if (totalPages > 1 && !target) {
              const collector = reactHandler.pageReact(
                interaction,
                favoriteEmbed
              );

              collector.on("collect", async (reaction, user) => {
                if (user.bot) return;

                await reaction.users.remove(user.id);

                if (reaction.emoji.name === "➡" && page < totalPages - 1) {
                  page++;
                } else if (reaction.emoji.name === "⬅" && page !== 0) {
                  --page;
                } else return;

                embed = embedCreator.createViewFavoriteEmbed(
                  owner,
                  song,
                  target,
                  page,
                  mappedArray
                );

                await interaction.editReply({
                  embeds: [embed],
                });
              });
            }
          }

          break;

        ////////////// handling add subcommand //////////////
        case "add":
          if (!result.hasTracks()) {
            errorHandler.handleNoResultError(interaction);
          } else {
            const favoriteMode = await favoriteHandler.handleResult(
              interaction,
              result
            );

            const embed = embedCreator.createFavoriteEmbed(song, favoriteMode);
            const button = buttonCreator.createFavoriteButtons();

            await interaction.editReply({
              embeds: [embed],
              components: [button],
            });

            success = "favorite";
          }

          break;

        ////////////// handling delete subcommand //////////////
        case "delete":
          if (favoriteList.User !== interaction.user.id) {
            errorHandler.handleAccessDeniedError(interaction);
          } else {
            const embed = embedCreator.createDeleteWarningFavoriteEmbed(
              owner,
              song,
              target
            );

            const button = buttonCreator.createWarningButtons();

            await interaction.editReply({
              embeds: [embed],
              components: [button],
            });

            success = "favorite";

            await favoriteHandler.handleDeletion(
              interaction,
              favoriteEmbed,
              embed,
              favoriteList,
              favorite,
              target,
              song
            );
          }

          break;

        ////////////// handling default subcommad just in case //////////////
        default: {
          console.log(
            `Something went wrong while executing ${interaction.commandName} subcommand.`
          );
        }
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
