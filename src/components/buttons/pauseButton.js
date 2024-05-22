const { createPauseEmbed } = require("../../utils/player/createMusicEmbed");
const { createPauseButton } = require("../../utils/main/createButtons");
const deleteHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: {
    name: "pause-button",
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

    ////////////// toggle pause mode of queue //////////////
    const embed = await createPauseEmbed(interaction, queue);
    const button = createPauseButton();

    await interaction.reply({
      embeds: [embed],
      components: [button],
    });

    success = true;

    deleteHandler.handleInteractionDeletion(interaction, success);
  },
};
