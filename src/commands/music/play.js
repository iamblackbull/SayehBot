const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const errorHandler = require("../../utils/main/handleErrors");
const { response } = require("../../utils/player/createResponse");
const { handleData } = require("../../utils/player/handlePlayerData");
const { createQueue } = require("../../utils/player/createQueue");
const { createTrackEmbed } = require("../../utils/player/createMusicEmbed");
const { search } = require("../../utils/player/handleSearch");
const { createButtons } = require("../../utils/main/createButtons");
const { consoleTags } = require("../../utils/main/mainUtils");
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

    const result = await search(query);
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

      const result = await search(query);

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
            await queue.addTrack(target);

            const { embed, nowPlaying } = createTrackEmbed(
              interaction,
              queue,
              result,
              song
            );

            await handleData(interaction, nowPlaying);

            if (!queue.node.isPlaying() && !queue.node.isPaused())
              await queue.node.play();

            const button = createButtons(nowPlaying);

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

              console.error(
                `${consoleTags.error} While executing ${interaction.commandName} command: `,
                error
              );
            }
          }
        }
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
