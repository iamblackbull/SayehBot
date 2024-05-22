const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createVoteEmbed } = require("../../utils/player/createMusicEmbed");
const { skip } = require("../../utils/player/handleSkip");
const errorHandler = require("../../utils/main/handleErrors");
const { voteReact } = require("../../utils/main/handleReaction");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current track.")
    .addIntegerOption((option) =>
      option
        .setName("position")
        .setDescription("Input a track number to skip to.")
        .setMinValue(1)
        .setRequired(false)
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    ////////////// base variables //////////////
    const { guildId, member } = interaction;

    const queue = client.player.nodes.get(guildId);
    let success = false;

    if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (!queue || !queue.currentTrack) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId === member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        const skipEmbed = await interaction.deferReply({
          fetchReply: true,
        });

        ////////////// vote requirement check //////////////
        const requiredVotes = member.voice.channel.members.size - 1;

        const allowed =
          member.permissions.has(PermissionFlagsBits.ManageMessages) ||
          requiredVotes <= 1;

        success = true;

        if (allowed) {
          await skip(interaction, queue);
        } else {
          ////////////// vote phase //////////////
          let embed = createVoteEmbed(requiredVotes, "start");

          await interaction.editReply({
            embeds: [embed],
          });

          let votes = 0;
          let skip = false;
          const timer = requiredVotes * 10 * 1000;

          const collector = voteReact(interaction, skipEmbed, timer);

          collector.on("collect", async (user) => {
            if (user.bot) return;

            if (!skip) {
              votes++;

              if (votes >= requiredVotes) {
                skip = true;
                collector.stop();

                embed = createVoteEmbed(requiredVotes, "success");

                await interaction.editReply({
                  embeds: [embed],
                });

                await skip(interaction, queue);
              }
            }
          });

          collector.on("end", async () => {
            if (!skip) {
              embed = createVoteEmbed(requiredVotes, "fail");

              await interaction.editReply({
                embeds: [embed],
              });
            }
          });
        }
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
