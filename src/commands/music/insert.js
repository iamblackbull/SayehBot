const { SlashCommandBuilder } = require("discord.js");
const { titles } = require("../../utils/player/musicUtils");
const playerDataHandler = require("../../utils/player/handlePlayerData");
const responseCreator = require("../../utils/player/createResponse");
const queueCreator = require("../../utils/player/createQueue");
const embedCreator = require("../../utils/player/createMusicEmbed");
const searchHandler = require("../../utils/player/handleSearch");
const errorHandler = require("../../utils/main/handleErrors");
const buttonCreator = require("../../utils/main/createButtons");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("insert")
    .setDescription(
      "Insert a track in a certain position in the current queue."
    )
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription(
          "Input a track from YouTube / Spotify / Soundcloud / Apple Music."
        )
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("position")
        .setDescription("Input a queue position to insert the track in.")
        .setMinValue(1)
        .setRequired(true)
    )
    .setDMPermission(false),

  async autocompleteRun(interaction, client) {
    ////////////// autocomplete response //////////////
    const query = interaction.options.getString("query", true);
    if (!query) return;

    const result = await searchHandler.search(query);
    if (!result.hasTracks()) return;

    const respond = responseCreator.response(result);

    try {
      await interaction.respond(respond);
    } catch (error) {
      return;
    }
  },

  async execute(interaction, client) {
    ////////////// base variables //////////////
    let success = false;

    if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else {
      const query = interaction.options.getString("query", true);

      const result = await searchHandler.search(query);

      if (!result.hasTracks()) {
        errorHandler.handleNoResultError(interaction);
      } else {
        const queue =
          client.player.nodes.get(interaction.guildId) ||
          (await queueCreator.createQueue(client, interaction, result));

        if (!queue.connection) {
          await queue.connect(interaction.member.voice.channel);
        }

        const sameChannel =
          queue.connection.joinConfig.channelId ===
          interaction.member.voice.channel.id;

        if (!sameChannel) {
          errorHandler.handleBusyError(interaction);
        } else {
          ////////////// inserting the track //////////////
          await interaction.deferReply({
            fetchReply: true,
          });

          let target = interaction.options.getInteger("position");
          if (target > queue.tracks.size) {
            target = queue.tracks.size + 1;
          }

          const song = result.tracks[0];

          try {
            await queue.insertTrack(song, target - 1);

            const { embed, nowPlaying } = embedCreator.createTrackEmbed(
              interaction,
              queue,
              result,
              song
            );

            if (!nowPlaying) {
              embed.setTitle(`**${titles.track} ${target}**`);
            }

            await playerDataHandler.handleData(interaction, nowPlaying);

            if (!queue.node.isPlaying() && !queue.node.isPaused())
              await queue.node.play();

            const button = buttonCreator.createButtons(nowPlaying);

            await interaction.editReply({
              embeds: [embed],
              components: [button],
            });

            success = true;
          } catch (error) {
            if (
              error.message.includes("Sign in to confirm your age.") ||
              error.message.includes("The following content may contain")
            ) {
              errorHandler.handleRestriceError(interaction);
            } else if (
              error.message ===
                "Cannot read properties of null (reading 'createStream')" ||
              error.message.includes(
                "Failed to fetch resources for ytdl streaming"
              ) ||
              error.message.includes("Could not extract stream for this track")
            ) {
              errorHandler.handleThirdPartyError(interaction);
            } else {
              errorHandler.handleUnknownError(interaction);

              console.log(error);
            }
          }
        }
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
