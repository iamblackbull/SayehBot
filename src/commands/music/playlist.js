const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const { useMainPlayer, QueryType } = require("discord-player");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription(
      "Play a playlist or album from YouTube / Spotify / Soundcloud / Apple Music."
    )
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Input a playlist url.")
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;
    let timer;
    let failedEmbed = new EmbedBuilder();

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
      interaction.editReply({
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
      await interaction.editReply({
        embeds: [failedEmbed],
      });
    } else {
      const player = useMainPlayer();
      const url = interaction.options.getString("url", true);
      let result;

      if (url.toLowerCase().startsWith("https")) {
        if (url.toLowerCase().includes("spotify")) {
          result = await player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.SPOTIFY_PLAYLIST,
          });
          embed.setColor(0x34eb58).setFooter({
            iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
            text: `Spotify`,
          });
        }
        if (url.toLowerCase().includes("soundcloud")) {
          result = await player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.SOUNDCLOUD_PLAYLIST,
          });
          embed.setColor(0xeb5534).setFooter({
            iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
            text: `Soundcloud`,
          });
        }
        if (url.toLowerCase().includes("apple")) {
          if (url.toLowerCase().includes("playlist")) {
            result = await player.search(url, {
              requestedBy: interaction.user,
              searchEngine: QueryType.APPLE_MUSIC_PLAYLIST,
            });
          }
          if (url.toLowerCase().includes("album")) {
            result = await player.search(url, {
              requestedBy: interaction.user,
              searchEngine: QueryType.APPLE_MUSIC_ALBUM,
            });
          }
          embed.setColor(0xeb5534).setFooter({
            iconURL: `https://music.apple.com/assets/knowledge-graph/music.png`,
            text: `Apple Music`,
          });
        } else {
          result = await player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.YOUTUBE_PLAYLIST,
          });
          embed.setColor(0xff0000).setFooter({
            iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
            text: `YouTube`,
          });
        }
      }
      if (!url.toLowerCase().startsWith("https")) {
        failedEmbed
          .setTitle(`**No Result**`)
          .setDescription(`You should input a link that starts with https.`)
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );
        interaction.editReply({
          embeds: [failedEmbed],
        });
      }
      if (result.tracks.length === 0) {
        failedEmbed
          .setTitle(`**No Result**`)
          .setDescription(`Make sure you input a valid link.`)
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );
        interaction.editReply({
          embeds: [failedEmbed],
        });
      } else {
        let queue = client.player.nodes.get(interaction.guildId);
        if (!queue) {
          queue = await client.player.nodes.create(interaction.guild, {
            metadata: {
              channel: interaction.member.voice.channel,
              client: interaction.guild.members.me,
              requestedBy: interaction.user,
              track: result.tracks[0],
            },
            leaveOnEnd: true,
            leaveOnEmpty: true,
            leaveOnStop: true,
            leaveOnStopCooldown: 5 * 60 * 1000,
            leaveOnEndCooldown: 5 * 60 * 1000,
            leaveOnEmptyCooldown: 5 * 1000,
            smoothVolume: true,
            ytdlOptions: {
              filter: "audioonly",
              quality: "highestaudio",
              highWaterMark: 1 << 25,
            },
          });
        }
        if (!queue.connection) {
          await queue.connect(interaction.member.voice.channel);
        }
        const connection =
          queue.connection.joinConfig.channelId ===
          interaction.member.voice.channel.id;
        if (connection) {
          let embed = new EmbedBuilder()
            .setTitle(`🎶 Playlist`)
            .setColor(0x256fc4);

          if (url.toLowerCase().includes("album")) {
            embed.setTitle(`🎶 Album`);
          }

          const playlist = result.playlist;
          await queue.addTrack(result.tracks);
          embed
            .setDescription(
              `**[${playlist.title}](${playlist.url})**\n**${result.tracks.length} songs**`
            )
            .setThumbnail(playlist.thumbnail);
          if (!queue.node.isPlaying()) await queue.node.play();
          await interaction.editReply({
            embeds: [embed],
          });
          success = true;
          if (result.tracks[0].duration.length >= 7) {
            timer = 10 * 60;
          } else {
            const duration = result.tracks[0].duration;
            const convertor = duration.split(":");
            timer = +convertor[0] * 60 + +convertor[1];
          }
        } else {
          failedEmbed
            .setTitle(`**Busy**`)
            .setDescription(`Bot is busy in another voice channel.`)
            .setColor(0x256fc4)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
            );
          interaction.editReply({
            embeds: [failedEmbed],
          });
        }
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
