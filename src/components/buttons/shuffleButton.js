const { createShuffleEmbed } = require("../../utils/player/createMusicEmbed");
const { handleQueueError } = require("../../utils/main/handleErrors");
const { createShuffleButton } = require("../../utils/main/createButtons");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: {
    name: "shuffle-button",
  },

  async execute(interaction, client) {
    ////////////// base variables //////////////
    if (!interaction.member.voice.channel) return;

    const queue = client.player.nodes.get(interaction.guildId);
    if (!queue) return;

    const queueChannel = queue.connection.joinConfig.channelId;
    const userChannel = interaction.member.voice.channel.id;
    if (queueChannel !== userChannel) return;

    const sameChannel =
      queue.connection.joinConfig.channelId ===
      interaction.member.voice.channel.id;

    if (!sameChannel) return;

    let success = false;

    if (queue.tracks.size === 0) {
      handleQueueError(interaction);
    } else {
      ////////////// original response //////////////
      await interaction.deferReply({
        fetchReply: true,
      });

      const reminder = "Use shuffle button again or react below to reshuffle.";

      const description = `Queue of **${queue.tracks.data.length} tracks** has been shuffled!\n${reminder}`;

      const embed = createShuffleEmbed(description);
      const button = createShuffleButton();

      ////////////// shuffle queue //////////////
      await queue.tracks.shuffle();

      await interaction.editReply({
        embeds: [embed],
        components: [button],
      });

      success = true;
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
