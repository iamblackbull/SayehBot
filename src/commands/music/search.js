const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { handleData } = require("../../utils/player/handlePlayerData");
const { search } = require("../../utils/player/handleSearch");
const { createQueue } = require("../../utils/player/createQueue");
const embedCreator = require("../../utils/player/createMusicEmbed");
const errorHandler = require("../../utils/main/handleErrors");
const { createButtons } = require("../../utils/main/createButtons");
const { searchReact } = require("../../utils/main/handleReaction");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search in YouTube")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Input a track name or url")
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
      const result = await search(query, "youtubeSearch");

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
        const collector = searchReact(interaction, searchEmbed, isLink);

        collector.on("collect", async (reaction, user) => {
          const queue =
            client.player.nodes.get(interaction.guildId) ||
            (await createQueue(client, interaction, result));

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

          try {
            ////////////// set target song //////////////
            const index = parseInt(reaction.emoji.name.charAt(0)) - 1;
            const song = result.tracks[index];

            ////////////// add track to queue //////////////
            const entry = queue.tasksQueue.aquire();

            await entry.getTask();
            await queue.addTrack(song);

            ////////////// follow-up response //////////////
            const { embed, nowPlaying } = embedCreator.createTrackEmbed(
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

            const msg = await interaction.followUp({
              embeds: [embed],
              components: [button],
            });

            deletionHandler.handleFollowUpDeletion(interaction, msg, success);
          } catch (error) {
            errorHandler.handleMusicError(interaction, error);
          }
        });
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
