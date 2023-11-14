const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const responseCreator = require("../../utils/createResponse");
const playerDataHandler = require("../../utils/handlePlayerData");
const errorHandler = require("../../utils/handleErrors");
const queueCreator = require("../../utils/createQueue");
const embedCreator = require("../../utils/createEmbed");
const buttonCreator = require("../../utils/createButtons");
const searchHandler = require("../../utils/handleSearch");
const deletionHandler = require("../../utils/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play from YouTube / Spotify / Soundcloud / Apple Music.")
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
          ////////////// play track //////////////
          await interaction.deferReply({
            fetchReply: true,
          });

          try {
            const song = result.tracks[0];

            const target = result.playlist ? result.tracks : song;
            await queue.addTrack(target);

            const { embed, nowPlaying } = embedCreator.createTrackEmbed(
              interaction,
              queue,
              result,
              song
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
