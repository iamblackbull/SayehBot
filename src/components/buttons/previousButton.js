const { PermissionFlagsBits } = require("discord.js");
const { useTimeline } = require("discord-player");
const { createVoteEmbed } = require("../../utils/player/createMusicEmbed");
const { previous } = require("../../utils/player/handleSkip");
const { voteReact } = require("../../utils/main/handleReaction");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: {
    name: "previous-button",
  },

  async execute(interaction, client) {
    ////////////// return checks //////////////
    const { guildId, member } = interaction;

    const queue = client.player.nodes.get(guildId);
    let success = false;

    if (!queue) return;
    if (queue.connection.joinConfig.channelId !== member.voice?.channel?.id)
      return;

    let previousMode;

    if (queue.node.isPlaying()) {
      const { timestamp } = useTimeline(guildId);

      const currentDuration = timestamp.current.label;
      const currentConvertor = currentDuration.split(":");
      const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

      if (currentTimer > 10) {
        previousMode = false;
      } else if (currentTimer <= 10 && queue.history) {
        previousMode = true;
      } else return;
    } else if (queue.history?.length === 0) return;

    const previousEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    ////////////// vote requirement check //////////////
    const requiredVotes = Math.ceil(member.voice.channel.members.size - 1);

    const allowed =
      member.permissions.has(PermissionFlagsBits.ManageMessages) ||
      requiredVotes <= 1;

    success = true;

    if (allowed) {
      await previous(interaction, queue, previousMode);
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

            await previous(interaction, queue, previousMode);
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
