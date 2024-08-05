const { SlashCommandBuilder } = require("discord.js");
const errorHandler = require("../../utils/main/handleErrors");
const { titles } = require("../../utils/player/musicUtils");
const { handleData } = require("../../utils/player/handlePlayerData");
const { response } = require("../../utils/player/createResponse");
const { createQueue } = require("../../utils/player/createQueue");
const { createTrackEmbed } = require("../../utils/player/createMusicEmbed");
const { search } = require("../../utils/player/handleSearch");
const { createButtons } = require("../../utils/main/createButtons");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("insert")
    .setDescription("Insert a track in a certain position in the current queue")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Input a track name or url")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("position")
        .setDescription("Input a queue position to insert the track in")
        .setMinValue(1)
        .setRequired(true)
    )
    .setDMPermission(false),

  async autocompleteRun(interaction) {
    ////////////// autocomplete response //////////////
    const query = interaction.options.getString("query", true);
    if (!query) return;

    const engine = query.startsWith("https") ? "auto" : "youtube";
    const result = await search(query, engine);
    if (!result.hasTracks()) return;

    const respond = response(result);

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
      const engine = query.startsWith("https") ? "auto" : "youtube";
      const result = await search(query, engine);

      if (!result.hasTracks()) {
        errorHandler.handleNoResultError(interaction);
      } else {
        const queue =
          client.player.nodes.get(interaction.guildId) ||
          (await createQueue(client, interaction, result));

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

          try {
            const song = result.tracks[0];
            const entry = queue.tasksQueue.aquire();

            await entry.getTask();
            await queue.insertTrack(song, target - 1);

            const { embed, nowPlaying } = createTrackEmbed(
              interaction,
              queue,
              result,
              song
            );

            if (!nowPlaying) {
              embed.setTitle(`**${titles.track} ${target}**`);
            }

            await handleData(interaction.guildId, nowPlaying);

            if (!queue.node.isPlaying() && !queue.node.isPaused())
              await queue.node.play();

            await queue.tasksQueue.release();

            const button = createButtons(nowPlaying);

            await interaction.editReply({
              embeds: [embed],
              components: [button],
            });

            success = true;
          } catch (error) {
            errorHandler.handleMusicError(interaction, error);
          }
        }
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
