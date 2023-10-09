const { EmbedBuilder } = require("discord.js");
const playerDB = require("../../schemas/player-schema");
const { musicChannelID } = process.env;
const footerSetter = require("../../functions/utils/setFooter");
const buttonCreator = require("../../functions/utils/createButtons");

module.exports = {
  data: {
    name: `skip-button`,
  },
  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);
    if (!queue) return;
    if (!queue.node.isPlaying()) return;
    if (!interaction.member.voice.channel) return;
    if (
      queue.connection.joinConfig.channelId !==
      interaction.member.voice.channel.id
    )
      return;

    const previousSong = queue.currentTrack;

    await queue.node.skip();

    const song = queue.tracks.at(0) || null;

    await playerDB.updateOne(
      { guildId: interaction.guildId },
      { isSkipped: true }
    );

    const user = interaction.user;
    const avatar = user.displayAvatarURL({ size: 1024, dynamic: true });

    let embed = new EmbedBuilder().setColor(0xc42525).setAuthor({
      name: interaction.member.nickname || user.username,
      iconURL: avatar,
      url: avatar,
    });

    let success = false;
    let timer;

    if (song == null || !song) {
      embed
        .setTitle("⏭ **Skipped**")
        .setDescription(
          `**[${previousSong.title}](${previousSong.url})**\n**${previousSong.author}**`
        )
        .setThumbnail(previousSong.thumbnail);

      success = true;
      timer = 2 * 60;

      await interaction.reply({
        embeds: [embed],
      });
    } else {
      embed
        .setTitle(`🎵 **Playing Next**`)
        .setDescription(
          `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
        )
        .setThumbnail(song.thumbnail);

      footerSetter.setFooter(embed, song);

      if (!queue.node.isPlaying()) await queue.node.play();

      if (song.duration.length >= 7) {
        timer = 10 * 60;
      } else {
        const duration = song.duration;
        const convertor = duration.split(":");
        timer = +convertor[0] * 60 + +convertor[1];
      }

      const button = buttonCreator.createButtons(true);

      await interaction.reply({
        embeds: [embed],
        components: [button],
      });
      success = true;
    }
    success ? timer : (timer = 2 * 60);
    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;

    const timeoutLog = success
      ? `Failed to delete ${interaction.commandName} interaction.`
      : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) {
        interaction.editReply({ components: [] });
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timer * 1000);
  },
};
