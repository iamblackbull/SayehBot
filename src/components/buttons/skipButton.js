const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { musicChannelID } = process.env;

module.exports = {
  data: {
    name: `skipper`,
  },
  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);
    if (!queue) return;
    if (!interaction.member.voice.channel) return;
    if (
      queue.connection.joinConfig.channelId !==
      interaction.member.voice.channel.id
    )
      return;

    const currentSong = queue.currentSong;

    queue.node.skip();

    const nextSong = queue.tracks.at(0) || null;

    const user = interaction.user;
    const avatar = user.displayAvatarURL({ size: 1024, dynamic: true });

    let embed = new EmbedBuilder().setAuthor({
      name: interaction.member.nickname || user.username,
      iconURL: avatar,
      url: avatar,
    });

    let source;
    let success = false;
    let timer;

    if (nextSong == null || !nextSong) {
      embed
        .setTitle("⏭ **Skipped**")
        .setDescription(
          `**[${currentSong.title}](${currentSong.url})**\n**${currentSong.author}**`
        )
        .setThumbnail(currentSong.thumbnail);

      success = true;
      timer = 2 * 60;

      await interaction.reply({
        embeds: [embed],
      });
    } else {
      embed
        .setTitle(`🎵 **Playing Next**`)
        .setDescription(
          `**[${nextSong.title}](${nextSong.url})**\n**${nextSong.author}**\n${nextSong.duration}`
        )
        .setThumbnail(nextSong.thumbnail);

      if (nextSong.url.includes("youtube")) {
        source = "public";
        embed.setColor(0xff0000).setFooter({
          iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
          text: `YouTube`,
        });
      } else if (nextSong.url.includes("spotify")) {
        source = "private";
        embed.setColor(0x34eb58).setFooter({
          iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
          text: `Spotify`,
        });
      } else if (nextSong.url.includes("soundcloud")) {
        source = "public";
        embed.setColor(0xeb5534).setFooter({
          iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
          text: `Soundcloud`,
        });
      } else if (song.url.includes("apple")) {
        source = "private";
        embed.setColor(0xfb4f67).setFooter({
          iconURL: `https://music.apple.com/assets/knowledge-graph/music.png`,
          text: `Apple Music`,
        });
      }

      if (!queue.node.isPlaying()) await queue.node.play();

      if (nextSong.duration.length >= 7) {
        timer = 10 * 60;
      } else {
        const duration = nextSong.duration;
        const convertor = duration.split(":");
        timer = +convertor[0] * 60 + +convertor[1];
      }

      const skipButton = new ButtonBuilder()
        .setCustomId(`skipper`)
        .setEmoji(`⏭`)
        .setStyle(ButtonStyle.Secondary);
      const favoriteButton = new ButtonBuilder()
        .setCustomId(`favorite`)
        .setEmoji(`🤍`)
        .setStyle(ButtonStyle.Danger);
      const lyricsButton = new ButtonBuilder()
        .setCustomId(`lyrics`)
        .setEmoji(`🎤`)
        .setStyle(ButtonStyle.Primary);
      const downloadButton = new ButtonBuilder()
        .setCustomId(`downloader`)
        .setEmoji(`⬇`)
        .setStyle(ButtonStyle.Secondary);

      const button = new ActionRowBuilder()
        .addComponents(skipButton)
        .addComponents(timer < 10 * 60 ? favoriteButton : null)
        .addComponents(lyricsButton)
        .addComponents(
          timer < 10 * 60 && source === public ? downloadButton : null
        );

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
