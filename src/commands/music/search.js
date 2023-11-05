const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const playerDataHandler = require("../../utils/handlePlayerData");
const errorHandler = require("../../utils/handleErrors");
const searchHandler = require("../../utils/handleSearch");
const queueCreator = require("../../utils/createQueue");
const embedCreator = require("../../utils/createEmbed");
const buttonCreator = require("../../utils/createButtons");
const reactHandler = require("../../utils/handleReaction");
const deletionHandler = require("../../utils/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search in YouTube.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Input something to search about.")
        .setRequired(true)
    )
    .setDMPermission(false),

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
      const result = await searchHandler.searchYouTube(query);

      if (!result.hasTracks()) {
        errorHandler.handleNoResultError(interaction);
      } else {
        ////////////// original response //////////////
        const searchEmbed = await interaction.deferReply({
          fetchReply: true,
        });

        const isLink = query.startsWith("https");

        const resultEmbed = embedCreator.createSearchEmbed(result, isLink);

        await interaction.editReply({
          embeds: [resultEmbed],
        });

        success = true;

        ////////////// add result to queue collector //////////////
        const collector = reactHandler.searchReact(
          interaction,
          searchEmbed,
          isLink
        );

        collector.on("collect", async (reaction, user) => {
          const queue =
            client.player.nodes.get(interaction.guildId) ||
            (await queueCreator.createQueue(client, interaction, result));

          if (user.bot) return;
          if (!interaction.member.voice.channel) return;

          if (!queue.connection) {
            await queue.connect(interaction.member.voice.channel);
          }

          if (
            queue.connection.joinConfig.channelId !==
            interaction.member.voice.channel.id
          )
            return;

          await reaction.users.remove(user.id);

          ////////////// set target song //////////////
          const index = parseInt(reaction.emoji.name.charAt(0)) - 1;
          const song = result.tracks[index];

          try {
            ////////////// add track to queue //////////////
            await queue.addTrack(song);

            ////////////// follow-up response //////////////
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

            const msg = await interaction.followUp({
              embeds: [embed],
              components: [button],
            });

            deletionHandler.handleFollowUpDeletion(interaction, msg, success);
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
        });
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
