const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jump")
    .setDescription("Jump to a certain track #")
    .addIntegerOption((option) =>
      option
        .setName("tracknumber")
        .setDescription("Track # to jump to")
        .setMinValue(1)
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);
    let trackNum = interaction.options.getInteger("tracknumber");

    let source;
    let timer;
    let success = false;
    let failedEmbed = new EmbedBuilder();
    let embed = new EmbedBuilder();

    if (!queue) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `Queue is empty. Add at least 1 song to the queue to use this command.\nTry again with </jump:1047903145071759421>.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else if (!interaction.member.voice.channel) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `You need to be in a voice channel to use this command.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else if (
      queue.connection.joinConfig.channelId ===
      interaction.member.voice.channel.id
    ) {
      if (trackNum > queue.tracks.size) {
        trackNum = queue.tracks.size;
      }
      queue.node.skipTo(trackNum - 1);
      const nextSong = queue.tracks.at(0);

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

      embed
        .setTitle(`⏭ Jump`)
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
                .addComponents(downloadButton),
            ],
          });
        } else {
          await interaction.reply({
            embeds: [embed],
            components: [
              new ActionRowBuilder()
                .addComponents(favoriteButton)
                .addComponents(lyricsButton),
            ],
          });
        }
      } else {
        await interaction.reply({
          embeds: [embed],
        });
      }
    } else {
      failedEmbed
        .setTitle(`**Busy**`)
        .setDescription(`Bot is busy in another voice channel.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    }
    success ? timer : (timer = 2 * 60);
    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;
    const timeoutLog = success
      ? "Failed to delete Jump interaction."
      : "Failed to delete unsuccessfull Jump interaction.";
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
