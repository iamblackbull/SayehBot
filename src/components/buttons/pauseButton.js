const { EmbedBuilder } = require("discord.js");
const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;

module.exports = {
  data: {
    name: `pause-button`,
  },
  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);
    const { timestamp, paused, pause, resume } = useTimeline(
      interaction.guildId
    );

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

    let embed = new EmbedBuilder().setAuthor({
      name: interaction.member.nickname || user.username,
      iconURL: avatar,
      url: avatar,
    });

    if (!paused) {
      await pause();

      embed
        .setTitle(`⏸ Paused`)
        .setDescription(
          "Use </pause:1047903145071759424> or click the button again to resume the music."
        )
        .setColor(0x256fc4)
        .setThumbnail(`https://cdn-icons-png.flaticon.com/512/148/148746.png`);
    } else {
      await resume();
      if (!queue.node.isPlaying()) await queue.node.play();

      embed
        .setTitle(`▶ Resumed`)
        .setDescription(
          "Use </pause:1047903145071759424> or click the button again to pause the music."
        )
        .setColor(0x256fc4)
        .setThumbnail(`https://cdn-icons-png.flaticon.com/512/148/148746.png`);
    }

    const duration = timestamp.total.label;
    const convertor = duration.split(":");
    const totalTimer = +convertor[0] * 60 + +convertor[1];

    const currentDuration = timestamp.current.label;
    const currentConvertor = currentDuration.split(":");
    const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

    timer = totalTimer - currentTimer;

    await interaction.reply({
      embeds: [embed],
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
