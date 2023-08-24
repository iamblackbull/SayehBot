const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { musicChannelID } = process.env;

module.exports = {
  isNew: true,
  isBeta: true,
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

    queue.node.skip();
    const nextSong = queue.tracks.at(0) || null;
    const currentSong = queue.currentSong;

    let source;
    let embed = new EmbedBuilder().setColor(0xc42525);
    let success = false;
    let timer;

    if (nextSong == null || !nextSong) {
      embed
        .setTitle("**Skipped**")
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
      const skipButton = new ButtonBuilder()
        .setCustomId(`skipper`)
        .setEmoji(`⏭`)
        .setStyle(ButtonStyle.Secondary);

      embed
        .setTitle(`**Next**`)
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
      }

      if (!queue.node.isPlaying()) await queue.node.play();

      success = true;
      if (nextSong.duration.length >= 7) {
        timer = 10 * 60;
      } else {
        const duration = nextSong.duration;
        const convertor = duration.split(":");
        timer = +convertor[0] * 60 + +convertor[1];
      }

      if (timer < 10 * 60) {
        if (source === "public") {
          await interaction.reply({
            embeds: [embed],
            components: [
              new ActionRowBuilder()
                .addComponents(favoriteButton)
                .addComponents(lyricsButton)
                .addComponents(downloadButton)
                .addComponents(skipButton),
            ],
          });
        } else {
          await interaction.reply({
            embeds: [embed],
            components: [
              new ActionRowBuilder()
                .addComponents(favoriteButton)
                .addComponents(lyricsButton)
                .addComponents(skipButton),
            ],
          });
        }
      } else {
        await interaction.reply({
          embeds: [embed],
        });
      }
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
