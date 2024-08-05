const playerModel = require("../../database/playerModel");
const { createTrackEmbed } = require("../../utils/player/createMusicEmbed");
const { createButtons } = require("../../utils/main/createButtons");
const { handleEventDelection } = require("../../utils/main/handleDeletion");

module.exports = {
  name: "playerStart",
  isPlayerEvent: true,

  async execute(queue, song) {
    ////////////// return checks //////////////
    const playerList = await playerModel.findOne(
      {
        guildId: queue.metadata.guild,
      },
      {
        upsert: true,
      }
    );

    if (playerList.isSkipped || playerList.isJustAdded)
      return await playerModel.updateOne(
        { guildId: queue.metadata.guild },
        { isSkipped: false, isJustAdded: false }
      );

    if (queue.repeatMode !== 0 && queue.repeatMode < 3) return;
    if (!song.url || song.url === undefined || song.url === null) return;
    if (queue.metadata.track === undefined) return;
    if (queue.metadata.track.url === song.url) return;

    const channel = queue.metadata.channel;
    if (!channel) return;

    ////////////// original response //////////////
    const { embed, nowPlaying } = createTrackEmbed(
      "playerStart",
      queue,
      false,
      song
    );

    const button = createButtons(nowPlaying);

    const msg = await channel.send({
      embeds: [embed],
      components: [button],
    });

    handleEventDelection(msg, true);
  },
};
