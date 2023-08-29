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
        .setName("query")
        .setDescription("Input playlist name or url.")
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

    let respond;
    if (results.playlist) {
      respond = results.playlist.slice(0, 1).map((playlist) => ({
        name: `${playlist.title} -- ${playlist.author} -- ${
          playlist.length
        } tracks -- ${
          playlist.raw.source.charAt(0).toUpperCase() +
          playlist.raw.source.slice(1)
        }`,
        value: playlist.url,
      }));
    } else return;

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

      if (!result.hasPlaylist()) {
        if (query.toLowerCase().startsWith("https")) {
          failedEmbed.setDescription(`Make sure you input a valid link.`);
        } else {
          failedEmbed.setDescription(
            `Make sure you input a valid playlist name.`
          );
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

          let embed = new EmbedBuilder()
            .setTitle(`🎶 Playlist`)
            .setColor(0x256fc4);

          const playlist = result.playlist;
          await queue.addTrack(result.tracks);
          if (!queue.node.isPlaying()) await queue.node.play();

          embed
            .setDescription(
              `**[${playlist.title}](${playlist.url})\n**${playlist.length} tracks**\n**${playlist.author}**`
            )
            .setThumbnail(playlist.thumbnail);

          if (playlist.url.toLowerCase().includes("album")) {
            embed.setTitle(`🎶 Album`);
          }
          if (playlist.url.includes("youtube")) {
            embed.setColor(0xff0000).setFooter({
              iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
              text: `YouTube`,
            });
          } else if (playlist.url.includes("spotify")) {
            embed.setColor(0x34eb58).setFooter({
              iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
              text: "Spotify",
            });
          } else if (playlist.url.includes("soundcloud")) {
            embed.setColor(0xeb5534).setFooter({
              iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
              text: `Soundcloud`,
            });
          } else if (playlist.url.includes("apple")) {
            embed.setColor(0xfb4f67).setFooter({
              iconURL: `https://music.apple.com/assets/knowledge-graph/music.png`,
              text: `Apple Music`,
            });
          }

          if (result.tracks[0].duration.length >= 7) {
            timer = 10 * 60;
          } else {
            const duration = result.tracks[0].duration;
            const convertor = duration.split(":");
            timer = +convertor[0] * 60 + +convertor[1];
          }

          await interaction.editReply({
            embeds: [embed],
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
