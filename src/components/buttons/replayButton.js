const { EmbedBuilder } = require("discord.js");
const { musicChannelID } = process.env;
const footerSetter = require("../../functions/utils/setFooter");
const buttonCreator = require("../../functions/utils/createButtons");

module.exports = {
  data: {
    name: `replay-button`,
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

    let success = false;
    let timer;

    const user = interaction.user;
    const avatar = user.displayAvatarURL({ size: 1024, dynamic: true });

    const song = queue.currentTrack;

    if (song.duration.length >= 7) {
      timer = 10 * 60;
    } else {
      const duration = song.duration;
      const convertor = duration.split(":");
      timer = +convertor[0] * 60 + +convertor[1];
    }

    await queue.node.seek(0);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.member.nickname || user.username,
        iconURL: avatar,
        url: avatar,
      })
      .setTitle(`🔄 Replay`)
      .setDescription(
        `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
      )
      .setThumbnail(song.thumbnail)
      .setColor(0x25bfc4);

    footerSetter.setFooter(embed, song);

    const button = buttonCreator.createButtons(true);

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
      if (success && interaction.channel.id === musicChannelID) return;
      else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timer * 1000);
  },
};
