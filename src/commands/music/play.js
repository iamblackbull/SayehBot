const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const errorHandler = require("../../utils/main/handleErrors");
const { response } = require("../../utils/player/createResponse");
const { handleData } = require("../../utils/player/handlePlayerData");
const { createQueue } = require("../../utils/player/createQueue");
const { createTrackEmbed } = require("../../utils/player/createMusicEmbed");
const { search } = require("../../utils/player/handleSearch");
const { createButtons } = require("../../utils/main/createButtons");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription(
      "Play a track (YouTube / Spotify / Soundcloud / Apple Music)"
    )
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Input track / playlist name or url.")
        .setRequired(true)
        .setAutocomplete(true)
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

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.Speak
      )
    ) {
      errorHandler.handlePermissionError(interaction);
    } else if (!interaction.member.voice.channel) {
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
          ////////////// play track //////////////
          await interaction.deferReply({
            fetchReply: true,
          });

          try {
            const song = result.tracks[0];
            const target = result.playlist ? result.tracks : song;

            const entry = queue.tasksQueue.aquire();

            await entry.getTask();
            await queue.addTrack(target);

            const { embed, nowPlaying } = createTrackEmbed(
              interaction,
              queue,
              result,
              song
            );

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
