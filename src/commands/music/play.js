const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { useMainPlayer, QueryType } = require("discord-player");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription(
      "Play a track from YouTube / Spotify / Soundcloud / Apple Music."
    )
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Input track name or url.")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .setDMPermission(false),

  async autocompleteRun(interaction, client) {
    const player = useMainPlayer();
    const query = interaction.options.getString("query", true);
    if (!query) return;

    const results = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: QueryType.AUTO,
    });

    let length;
    if (results.playlist) {
      length = results.tracks.length;
      if (length > 26) length = 26;
    } else {
      length = 5;
    }

    let respond = results.tracks.slice(0, length).map((song) => ({
      name: `[${song.duration}] ${song.title} -- ${song.author} -- ${
        song.raw.source.charAt(0).toUpperCase() + song.raw.source.slice(1)
      }`,
      value: song.url,
    }));

    try {
      await interaction.respond(respond);
    } catch (error) {
      return;
    }
  },

  async execute(interaction, client) {
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
    } else {
      const player = useMainPlayer();
      const query = interaction.options.getString("query", true);

      const result = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      if (!result.hasTracks()) {
        if (query.toLowerCase().startsWith("https")) {
          failedEmbed.setDescription(`Make sure you input a valid link.`);
        } else {
          failedEmbed.setDescription(`Make sure you input a valid track name.`);
        }
        failedEmbed
          .setTitle(`**No Result**`)
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );
        interaction.reply({
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
            useLegacyFFmpeg: false,
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
        const sameChannel =
          queue.connection.joinConfig.channelId ===
          interaction.member.voice.channel.id;

        if (!sameChannel) {
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
          await interaction.deferReply({
            fetchReply: true,
          });

          let embed = new EmbedBuilder();
          let source;

          const entry = queue.tasksQueue.acquire();
          await entry.getTask();

          const song = result.tracks[0];
          await queue.addTrack(song);

          if (!queue.node.isPlaying()) await queue.node.play();
          await queue.tasksQueue.release();

          const currentSong = queue.currentTrack;
          const nowPlaying = currentSong.url === song.url;

          if (nowPlaying) {
            embed.setTitle("🎵 Now Playing");
          } else {
            embed.setTitle(`🎵 Track #${queue.tracks.size}`);
          }

          embed
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
            .addComponents(nowPlaying ? skipButton : null)
            .addComponents(
              nowPlaying && timer < 10 * 60 ? favoriteButton : null
            )
            .addComponents(nowPlaying ? lyricsButton : null)
            .addComponents(
              nowPlaying && timer < 10 * 60 && source === public
                ? downloadButton
                : null
            );

          await interaction.editReply({
            embeds: [embed],
            components: [button],
          });
          success = true;
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
