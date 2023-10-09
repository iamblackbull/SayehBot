const { EmbedBuilder } = require("discord.js");
const playerDB = require("../../schemas/player-schema");
const footerSetter = require("../../utils/setFooter");
const buttonCreator = require("../../utils/createButtons");

module.exports = {
  name: "playerStart",
  isPlayerEvent: true,
  async execute(queue, song) {
    if (!song.url || song.url === undefined || song.url === null) return;
    if (queue.metadata.track === undefined) return;
    if (queue.metadata.track.url === song.url) return;

    const playerList = await playerDB.findOne({
      guildId: queue.metadata.guild,
    });

    if (playerList.isSkipped || playerList.isJustAdded) {
      return await playerDB.updateOne(
        { guildId: queue.metadata.guild },
        { isSkipped: false, isJustAdded: false }
      );
    }

    const channel = queue.metadata.channel;
    if (!channel) return;

    let timer;

    if (song.duration.length >= 7) {
      timer = 10 * 60;
    } else {
      const duration = song.duration;
      const convertor = duration.split(":");
      timer = +convertor[0] * 60 + +convertor[1];
    }

    let embed = new EmbedBuilder()
      .setTitle("🎵 Now Playing")
      .setDescription(
        `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
      )
      .setThumbnail(song.thumbnail);

    footerSetter.setFooter(embed, song);

    const button = buttonCreator.createButtons(true);

    const msg = await channel.send({
      embeds: [embed],
      components: [button],
    });

    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;
    setTimeout(() => {
      msg.delete().catch((e) => {
        console.log("Failed to delete playStart event message.");
      });
    }, timer * 1000);
  },
};
