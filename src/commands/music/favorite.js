const { SlashCommandBuilder } = require("discord.js");
const { mongoose } = require("mongoose");
const favoriteModel = require("../../database/favoriteModel");
const errorHandler = require("../../utils/main/handleErrors");
const { createFavoriteQueue } = require("../../utils/player/createQueue");
const { search, searchFavorite } = require("../../utils/player/handleSearch");
const { handleData } = require("../../utils/player/handlePlayerData");
const embedCreator = require("../../utils/player/createMusicEmbed");
const favoriteHandler = require("../../utils/player/handleFavorite");
const buttonCreator = require("../../utils/main/createButtons");
const { pageReact } = require("../../utils/main/handleReaction");
const { consoleTags } = require("../../utils/main/mainUtils");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("favorite")
    .setDescription("Interact with favortie playlists")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("play")
        .setDescription("Play tracks from a favorite playlist")
        .addIntegerOption((option) =>
          option
            .setName("position")
            .setDescription("Input a favorite playlist track position")
            .setMinValue(1)
            .setRequired(false)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Pick a member to play their favorite playlist")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View a favorite playlist")
        .addIntegerOption((option) =>
          option
            .setName("position")
            .setDescription("Input a favorite playlist track position")
            .setMinValue(1)
            .setRequired(false)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Pick a member to view their favorite playlist")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a track to your own favorite playlist")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Input a track url")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete tracks from your own favorite playlist")
        .addIntegerOption((option) =>
          option
            .setName("position")
            .setDescription("Input a favorite playlist track position")
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

    const favoriteList = await favoriteModel.findOne({
      User: owner.id,
    });

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (!favoriteList || favoriteList.Playlist.length === 0) {
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

      const result = await search(query, "auto");

      const song = result.tracks[0];

      switch (sub) {
        ////////////// handling play subcommand //////////////
        case "play":
          if (!queue) {
            queue = await createFavoriteQueue(client, interaction, song);
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

              ////////////// original response //////////////
              const { embed, nowPlaying } =
                embedCreator.createPlayFavoriteEmbed(
                  owner,
                  queue,
                  song,
                  target,
                  playlistLength
                );

              await handleData(interaction.guildId, nowPlaying);

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
                const { resultArray } = await searchFavorite(splitPlaylist, 1);

                await queue.addTrack(resultArray);
              }
            }
          }

          break;

        ////////////// handling view subcommand //////////////
        case "view":
          if (target) {
            const embed = embedCreator.createViewFavoriteEmbed(
              owner,
              song,
              target,
              0,
              0
            );

            const button = buttonCreator.createFavoriteButtons();

            await interaction.editReply({
              embeds: [embed],
              components: [button],
            });

            await favoriteHandler.handleButtons(client, interaction, song);
          } else {
            const stringPlaylist = favoriteList.Playlist.map(
              (song, index) =>
                `**${index + 1}.** ["${song.Name}" by "${song.Author}"](${
                  song.Url
                })`
            ).join("\n");

            const mappedArray = stringPlaylist.split("\n");

            if (mappedArray.length === 0) {
              errorHandler.handleNoResultError(interaction);
            } else {
              let page = 0;
              let totalPages =
                mappedArray.length > 10
                  ? Math.ceil(mappedArray.length / 10)
                  : 1;

              let embed = embedCreator.createViewFavoriteEmbed(
                owner,
                mappedArray,
                target,
                page,
                totalPages
              );

              await interaction.editReply({
                embeds: [embed],
              });

              success = "favorite";

              if (totalPages > 1 && !target) {
                const collector = pageReact(interaction, favoriteEmbed);

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
                    mappedArray,
                    target,
                    page,
                    totalPages
                  );

                  await interaction.editReply({
                    embeds: [embed],
                  });
                });
              }
            }
          }

          break;

        ////////////// handling add subcommand //////////////
        case "add":
          if (!result.hasTracks()) {
            errorHandler.handleNoResultError(interaction);
          } else {
            const { favoriteMode, favoriteLength } =
              await favoriteHandler.handleResult(interaction, result);

            const embed = embedCreator.createFavoriteEmbed(
              interaction.user,
              song,
              favoriteMode,
              favoriteLength
            );
            const button = buttonCreator.createFavoriteButtons();

            await interaction.editReply({
              embeds: [embed],
              components: [button],
            });

            success = "favorite";

            await favoriteHandler.handleButtons(client, interaction, song);
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
              favoriteModel,
              target,
              song
            );
          }

          break;

        ////////////// handling default subcommad just in case //////////////
        default: {
          console.error(
            `${consoleTags.error} Something went wrong while executing ${interaction.commandName} ${sub} command.`
          );
        }
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
