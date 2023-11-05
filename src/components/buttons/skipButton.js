const embedCreator = require("../../utils/createEmbed");
const reactHandler = require("../../utils/handleReaction");
const skipHandler = require("../../utils/handleSkip");
const deletionHandler = require("../../utils/handleDeletion");

module.exports = {
  data: {
    name: "skip-button",
  },

  async execute(interaction, client) {
    ////////////// return checks //////////////
    const queue = client.player.nodes.get(interaction.guildId);
    let success = false;

    if (!queue) return;
    if (!queue.currentTrack) return;
    if (
      queue.connection.joinConfig.channelId !==
      interaction.member.voice?.channel?.id
    )
      return;

    const skipEmbed = await interaction.deferReply({
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
      await skipHandler.skip(interaction, queue, true);
    } else {
      ////////////// vote phase //////////////
      let embed = embedCreator.createVoteEmbed(requiredVotes, "start");

      await interaction.editReply({
        embeds: [embed],
      });

      let votes = 0;
      let skip = false;
      const timer = requiredVotes * 5 * 1000;

      const collector = reactHandler.voteReact(interaction, skipEmbed, timer);

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

            await skipHandler.skip(interaction, queue, true);
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

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
