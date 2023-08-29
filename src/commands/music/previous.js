const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("previous")
    .setDescription("Play previously played track in the current queue."),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    const sameChannel =
      queue.connection.joinConfig.channelId ===
      interaction.member.voice.channel.id;

    let failedEmbed = new EmbedBuilder();
    let success = false;
    let timer;

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.Speak
      )
    ) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(`Bot doesn't have the required permission!`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.reply({
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
    } else if (!queue || !queue.history) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(`There is no queue or queue history is not available.`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else if (!sameChannel) {
      failedEmbed
        .setTitle(`**Busy**`)
        .setDescription(`Bot is busy in another voice channel.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
        );
      interaction.reply({
        embeds: [failedEmbed],
      });
    } else {
      let embed = new EmbedBuilder();

      await queue.history.back();
      if (!queue.node.isPlaying()) await queue.node.play();

      let song = queue.currentTrack;
      let source;

      embed
        .setTitle(`🎵 Previous`)
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
          text: `Spotify`,
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

      if (song.duration.length >= 7) {
        timer = 10 * 60;
      } else {
        const duration = song.duration;
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
