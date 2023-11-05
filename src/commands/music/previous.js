const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const errorHandler = require("../../utils/handleErrors");
const embedCreator = require("../../utils/createEmbed");
const reactHandler = require("../../utils/handleReaction");
const skipHandler = require("../../utils/handleSkip");
const deletionHandler = require("../../utils/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("previous")
    .setDescription("Skip to previous track in the current queue."),

  async execute(interaction, client) {
    ////////////// base variables //////////////
    const queue = client.player.nodes.get(interaction.guildId);
    let success = false;

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.Speak
      )
    ) {
      errorHandler.handlePermissionError(interaction);
    } else if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (queue?.history?.length === 0) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        const previousEmbed = await interaction.deferReply({
          fetchReply: true,
        });

        ////////////// vote requirement check //////////////
        const requiredVotes = Math.ceil(
          (interaction.member.voice.channel.members.size - 1) / 2
        );

        const allowed =
          interaction.member.permissions.has("MANAGE_MESSAGES") ||
          requiredVotes <= 1;

        success = true;

        if (allowed) {
          await skipHandler.previous(interaction, queue, true);
        } else {
          ////////////// vote phase //////////////
          let embed = embedCreator.createVoteEmbed(requiredVotes, "start");

          await interaction.editReply({
            embeds: [embed],
          });

          let votes = 0;
          let skip = false;
          const timer = requiredVotes * 5 * 1000;

          const collector = reactHandler.voteReact(
            interaction,
            previousEmbed,
            timer
          );

          collector.on("collect", async (user) => {
            if (user.bot) return;

            if (!skip) {
              votes++;

              if (votes >= requiredVotes) {
                skip = true;
                collector.stop();

                await interaction.reactions.removeAll();

                embed = embedCreator.createVoteEmbed(requiredVotes, "success");

                await interaction.editReply({
                  embeds: [embed],
                });

                await skipHandler.previous(interaction, queue, true);
              }
            }
          });

          collector.on("end", async (reason) => {
            await interaction.reactions.removeAll();

            if (reason === "time" && !skip) {
              embed = embedCreator.createVoteEmbed(requiredVotes, "fail");

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
