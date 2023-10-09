const { EmbedBuilder } = require("discord.js");
const playerDB = require("../../schemas/player-schema");
const { musicChannelID } = process.env;
const footerSetter = require("../../utils/setFooter");
const buttonCreator = require("../../utils/createButtons");

module.exports = {
  data: {
    name: `previous-button`,
  },
  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    if (!queue || !queue.history) return;
    if (!interaction.member.voice.channel) return;
    if (
      queue.connection.joinConfig.channelId !==
      interaction.member.voice.channel.id
    )
      return;

    let success = false;
    let nowPlaying = false;
    let timer;

    const user = interaction.user;
    const avatar = user.displayAvatarURL({ size: 1024, dynamic: true });

    await queue.history.back();

    const song = queue.currentTrack;

    nowPlaying = queue.tracks.size === 1;

    if (nowPlaying) {
      embed.title(`🎵 Now Playing`);

      await playerDB.updateOne(
        { guildId: interaction.guildId },
        { isSkipped: true }
      );
    } else {
      embed.setTitle(`🎵 Previous`);
    }

    let embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.member.nickname || user.username,
        iconURL: avatar,
        url: avatar,
      })
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

    const button = buttonCreator.createButtons(nowPlaying);

    await interaction.reply({
      embeds: [embed],
      components: [button],
    });
    success = true;

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
