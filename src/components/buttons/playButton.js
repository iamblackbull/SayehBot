const favorite = require("../../commands/music/favorite");
const queueCreator = require("../../utils/createQueue");
const embedCreator = require("../../utils/createEmbed");
const playerDataHandler = require("../../utils/handlePlayerData");
const buttonCreator = require("../../utils/createButtons");
const deletionHandler = require("../../utils/handleDeletion");

module.exports = {
  data: {
    name: "play-button",
  },

  async execute(interaction, client) {
    ////////////// return checks //////////////
    let success = false;

    const { song } = favorite;
    if (!song) return;

    const queue =
      client.player.nodes.get(interaction.guildId) ||
      (await queueCreator.createFavoriteQueue(client, interaction, song));

    if (
      queue.connection.joinConfig.channelId !==
      interaction.member.voice?.channel?.id
    )
      return;

    ////////////// play track //////////////
    await queue.addTrack(song);

    ////////////// original response //////////////
    const { embed, nowPlaying } = embedCreator.createTrackEmbed(
      interaction,
      queue,
      false,
      song
    );

    await playerDataHandler.handleData(interaction, nowPlaying);

    if (!queue.node.isPlaying() && !queue.node.isPaused())
      await queue.node.play();

    const button = buttonCreator.createButtons(nowPlaying);

    await interaction.reply({
      embeds: [embed],
      components: [button],
    });

    success = true;

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
