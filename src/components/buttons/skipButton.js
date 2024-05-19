const { PermissionFlagsBits } = require("discord.js");
const embedCreator = require("../../utils/player/createMusicEmbed");
const skipHandler = require("../../utils/player/handleSkip");
const reactHandler = require("../../utils/main/handleReaction");
const deletionHandler = require("../../utils/main/handleDeletion");

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
      interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) ||
      requiredVotes <= 1;

    success = true;

    if (allowed) {
      await skipHandler.skip(interaction, queue);
    } else {
      ////////////// vote phase //////////////
      let embed = embedCreator.createVoteEmbed(requiredVotes, "start");

      await interaction.editReply({
        embeds: [embed],
      });

      let votes = 0;
      let skip = false;
      const timer = requiredVotes * 10 * 1000;

      const collector = reactHandler.voteReact(interaction, skipEmbed, timer);

      collector.on("collect", async (user) => {
        if (user.bot) return;

        if (!skip) {
          votes++;

          if (votes >= requiredVotes) {
            skip = true;
            collector.stop();

            embed = embedCreator.createVoteEmbed(requiredVotes, "success");

            await interaction.editReply({
              embeds: [embed],
            });

            await skipHandler.skip(interaction, queue);
          }
        }
      });

      collector.on("end", async () => {
        if (!skip) {
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
