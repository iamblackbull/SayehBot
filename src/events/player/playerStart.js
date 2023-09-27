const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const playerDB = require("../../schemas/player-schema");

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

    if (playerList.isSkipped) {
      return await playerDB.updateOne(
        { guildId: queue.metadata.guild },
        { isSkipped: false }
      );
    }
    if (playerList.isJustAdded) {
      return await playerDB.updateOne(
        { guildId: queue.metadata.guild },
        { isJustAdded: false }
      );
    }

    const channel = queue.metadata.channel;
    let source;
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

    if (song.url.includes("youtube")) {
      source = "public";
      embed.setColor(0xff0000).setFooter({
        iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
        text: `YouTube`,
      });
    } else if (song.url.includes("spotify")) {
      source = "private";
      embed.setColor(0x34eb58).setFooter({
        iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
        text: "Spotify",
      });
    } else if (song.url.includes("soundcloud")) {
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

    const skipButton = new ButtonBuilder()
      .setCustomId(`skipper`)
      .setEmoji(`⏭`)
      .setDisabled(false)
      .setStyle(ButtonStyle.Secondary);
    const favoriteButton = new ButtonBuilder()
      .setCustomId(`favorite`)
      .setEmoji(`🤍`)
      .setDisabled(false)
      .setStyle(ButtonStyle.Danger);
    const lyricsButton = new ButtonBuilder()
      .setCustomId(`lyrics`)
      .setEmoji(`🎤`)
      .setDisabled(false)
      .setStyle(ButtonStyle.Primary);

    const button = new ActionRowBuilder()
      .addComponents(skipButton)
      .addComponents(favoriteButton)
      .addComponents(lyricsButton);

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
