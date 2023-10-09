const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const playerDB = require("../../schemas/player-schema");
const { useMainPlayer, QueryType } = require("discord-player");
const { musicChannelID } = process.env;
const errorHandler = require("../../utils/handleErrors");
const queueCreator = require("../../utils/createQueue");
const footerSetter = require("../../utils/setFooter");
const buttonCreator = require("../../utils/createButtons");

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
        .setName("tracknumber")
        .setDescription("Input a track number to insert.")
        .setMinValue(1)
        .setRequired(true)
    )
    .setDMPermission(false),

  async autocompleteRun(interaction, client) {
    const player = useMainPlayer();
    const query = interaction.options.getString("query", true);
    if (!query) return;

    let results;

    if (query.toLowerCase().startsWith("https")) {
      results = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });
    } else {
      results = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE,
      });
    }

    if (!results.hasTracks()) {
      results = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });
    }

    let respond = results.tracks.slice(0, 5).map((song) => ({
      name: `[${song.duration}] ${song.title} -- ${song.author} -- ${song.raw.source}`,
      value: song.url,
    }));

    try {
      await interaction.respond(respond);
    } catch (error) {
      return;
    }
  },

  async execute(interaction, client) {
    let success = false;
    let timer;

    if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else {
      const player = useMainPlayer();
      const query = interaction.options.getString("query", true);

      let noResult = false;
      let result;

      if (query.toLowerCase().startsWith("https")) {
        result = await player.search(query, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        });
      } else {
        result = await player.search(query, {
          requestedBy: interaction.user,
          searchEngine: QueryType.YOUTUBE,
        });
      }

      if (!result.hasTracks()) {
        result = await player.search(query, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        });

        if (!result.hasTracks()) {
          noResult = true;
        }
      }
      if (noResult) {
        errorHandler.handleNoResultError(interaction);
      } else {
        const queue =
          client.player.nodes.get(interaction.guildId) ||
          await queueCreator.createQueue(client, interaction, result);

        if (!queue.connection) {
          await queue.connect(interaction.member.voice.channel);
        }
        const sameChannel =
          queue.connection.joinConfig.channelId ===
          interaction.member.voice.channel.id;

        if (!sameChannel) {
          errorHandler.handleBusyError(interaction);
        } else {
          await interaction.deferReply({
            fetchReply: true,
          });

          let embed = new EmbedBuilder();
          let nowPlaying = false;

          let trackNum = interaction.options.getInteger("tracknumber");
          if (trackNum > queue.tracks.data.size) {
            trackNum = queue.tracks.data.size + 1;
          }

          const song = result.tracks[0];

          try {
            await queue.insertTrack(song, trackNum - 1);

            let queueSize = queue.tracks.size;

            if (!queue.node.isPlaying()) {
              queueSize = 0;
              await queue.node.play();
            }

            nowPlaying = queueSize === 0;

            if (nowPlaying) {
              embed.setTitle("🎵 Now Playing");

              await playerDB.updateOne(
                { guildId: interaction.guildId },
                { isJustAdded: true }
              );
            } else {
              embed.setTitle(`🎵 Track #${trackNum}`);

              await playerDB.updateOne(
                { guildId: interaction.guildId },
                { isJustAdded: false }
              );
            }

            embed
              .setDescription(
                `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
              )
              .setThumbnail(song.thumbnail);

            footerSetter.setFooter(embed, song);

            if (song.duration.length >= 7) {
              timer = 10 * 60;
            } else {
              const duration = song.duration;
              const convertor = duration.split(":");
              timer = +convertor[0] * 60 + +convertor[1];
            }

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
            }
          }
        }
      }
    }
    success ? timer : (timer = 2 * 60);
    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;

    const timeoutLog = success
      ? `Failed to delete ${interaction.commandName} interaction.`
      : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) {
        interaction.editReply({ components: [] });
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timer * 1000);
  },
};
