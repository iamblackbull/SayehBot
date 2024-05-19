const playerDB = require("../../schemas/player-schema");
const embedCreator = require("../../utils/player/createMusicEmbed");
const buttonCreator = require("../../utils/main/createButtons");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  name: "playerStart",
  isPlayerEvent: true,

  async execute(queue, song) {
    ////////////// return checks //////////////
    const playerList = await playerDB.findOne({
      guildId: queue.metadata.guild,
    });

    if (playerList.isSkipped || playerList.isJustAdded) {
      return await playerDB.updateOne(
        { guildId: queue.metadata.guild },
        { isSkipped: false, isJustAdded: false }
      );
    }

    if (queue.repeatMode !== 0 && queue.repeatMode < 3) return;
    if (!song.url || song.url === undefined || song.url === null) return;
    if (queue.metadata.track === undefined) return;
    if (queue.metadata.track.url === song.url) return;

    const channel = queue.metadata.channel;
    if (!channel) return;

    ////////////// original response //////////////
    const { embed, nowPlaying } = embedCreator.createTrackEmbed(
      "playerStart",
      queue,
      false,
      song
    );

    const button = buttonCreator.createButtons(nowPlaying);

    const msg = await channel.send({
      embeds: [embed],
      components: [button],
    });

    deletionHandler.handleEventDelection(msg);
  },
};
