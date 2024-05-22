const {
  SlashCommandBuilder,
  PermissionsBitField,
  PermissionFlagsBits,
} = require("discord.js");
const { createVoteEmbed } = require("../../utils/player/createMusicEmbed");
const { previous } = require("../../utils/player/handleSkip");
const errorHandler = require("../../utils/main/handleErrors");
const { voteReact } = require("../../utils/main/handleReaction");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("previous")
    .setDescription("Skip to previous track in the current queue."),

  async execute(interaction, client) {
    ////////////// base variables //////////////
    const { guildId, member } = interaction;

    const queue = client.player.nodes.get(guildId);
    let success = false;

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.Speak
      )
    ) {
      errorHandler.handlePermissionError(interaction);
    } else if (!member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (queue?.history?.length === 0) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId === member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        const previousEmbed = await interaction.deferReply({
          fetchReply: true,
        });

        ////////////// vote requirement check //////////////
        const requiredVotes = member.voice.channel.members.size - 1;

        const allowed =
          member.permissions.has(PermissionFlagsBits.ManageMessages) ||
          requiredVotes <= 1;

        success = true;

        if (allowed) {
          await previous(interaction, queue, true);
        } else {
          ////////////// vote phase //////////////
          let embed = createVoteEmbed(requiredVotes, "start");

          await interaction.editReply({
            embeds: [embed],
          });

          let votes = 0;
          let skip = false;
          const timer = requiredVotes * 10 * 1000;

          const collector = voteReact(interaction, previousEmbed, timer);

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

                await previous(interaction, queue, true);
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
