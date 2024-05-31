const { PermissionFlagsBits } = require("discord.js");
const { createVoteEmbed } = require("../../utils/player/createMusicEmbed");
const { skip } = require("../../utils/player/handleSkip");
const { voteReact } = require("../../utils/main/handleReaction");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: {
    name: "skip-button",
  },

  async execute(interaction, client) {
    ////////////// return checks //////////////
    const { guildId, member } = interaction;

    const queue = client.player.nodes.get(guildId);
    let success = false;

    if (!queue) return;
    if (!queue.currentTrack) return;
    if (queue.connection.joinConfig.channelId !== member.voice?.channel?.id)
      return;

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

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
