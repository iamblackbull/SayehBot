const embedCreator = require("../../utils/player/createMusicEmbed");
const buttonCreator = require("../../utils/main/createButtons");
const deletionHandler = require("../../utils/main/handleDeletion");

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
    const embed = await embedCreator.createPauseEmbed(interaction, queue);
    const button = buttonCreator.createPauseButtons();

    await interaction.reply({
      embeds: [embed],
      components: [button],
    });

    success = true;

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
