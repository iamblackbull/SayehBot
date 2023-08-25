const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { useMainPlayer, QueryType } = require("discord-player");
const { musicChannelID } = process.env;

module.exports = {
  isNew: true,
  data: new SlashCommandBuilder()
    .setName("insert")
    .setDescription(
      "Insert a track in a certain position in the current queue."
    )
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription(
          "Input a track from YouTube / Spotify / Soundcloud / Apple Music."
        )
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("tracknumber")
        .setDescription("Input a track number to insert.")
        .setMinValue(1)
        .setRequired(true)
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
    let respond = results.tracks.slice(0, 5).map((song) => ({
      name: `${song.title} -- ${song.author} [${song.duration}] ${song.raw.source}`,
      value: song.url,
    }));

    try {
      await interaction.respond(respond);
    } catch (error) {
      return;
    }
  },

  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let source;
    let timer;
    let success = false;
    let failedEmbed = new EmbedBuilder();
    let embed = new EmbedBuilder();

    let trackNum = interaction.options.getInteger("tracknumber");

    const player = useMainPlayer();
    const query = interaction.options.getString("query", true);
    const result = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: QueryType.AUTO,
    });
    if (result.tracks.length === 0) {
      if (url.toLowerCase().startsWith("https")) {
        failedEmbed.setDescription(`Make sure you input a valid link.`);
      } else {
        failedEmbed.setDescription(`Make sure you input a valid song name.`);
      }
      failedEmbed
        .setTitle(`**No Result**`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
        );
      interaction.editReply({
        embeds: [failedEmbed],
      });
    } else {
      let newQueue = false;
      let queue = client.player.nodes.get(interaction.guildId);
      if (!queue) {
        newQueue = true;
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
      } else if (
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id
      ) {
        if (trackNum > queue.tracks.size) {
          trackNum = queue.tracks.size + 1;
        }
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

        const song = result.tracks[0];
        await queue.insertTrack(song, trackNum - 1);

        if (newQueue || queue.tracks.size === 0) {
          embed.setTitle(`🎵 Now Playing`);
        } else {
          embed.setTitle(`🎵 Track #${trackNum}`);
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

        if (!queue.node.isPlaying()) await queue.node.play();
        success = true;
        if (song.duration.length >= 7) {
          timer = 10 * 60;
        } else {
          const duration = song.duration;
          const convertor = duration.split(":");
          timer = +convertor[0] * 60 + +convertor[1];
        }
        if (newQueue && timer < 10 * 60) {
          if (source === "public") {
            await interaction.editReply({
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
            await interaction.editReply({
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
          await interaction.editReply({
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
        await interaction.editReply({
          embeds: [failedEmbed],
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
