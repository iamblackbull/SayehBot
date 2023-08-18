const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { useMainPlayer, useTimeline, QueryType } = require("discord-player");
const { musicChannelID } = process.env;
const replay = require("../../schemas/replay-schema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a track from YouTube / Spotify / Soundcloud")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Input song name or url")
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
    let respond = results.tracks.slice(0, 5).map((song) => ({
      name: `${song.title} -- ${song.author} \`[${song.duration}]\``,
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
    let song;
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
      let queue = client.player.nodes.get(interaction.guildId);
      if (!queue) {
        queue = await client.player.nodes.create(interaction.guild, {
          metadata: {
            channel: interaction.channel,
            client: interaction.guild.members.me,
            requestedBy: interaction.user,
          },
          useLegacyFFmpeg: false,
          leaveOnEnd: true,
          leaveOnEmpty: true,
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
        let embed = new EmbedBuilder();

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

        const player = useMainPlayer();
        const query = interaction.options.getString("query", true);
        const result = await player.search(query, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        });

        if (result.tracks.length === 0) {
          if (query.toLowerCase().startsWith("https")) {
            failedEmbed.setDescription(`Make sure you input a valid link.`);
          } else {
            failedEmbed.setDescription(
              `Make sure you input a valid song name.`
            );
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
          const entry = queue.tasksQueue.acquire();
          await entry.getTask();

          song = result.tracks[0];
          await queue.addTrack(song);

          embed
            .setTitle(`🎵 Track`)
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
              text: "spotify",
            });
          } else if (song.url.includes("soundcloud")) {
            source = "public";
            embed.setColor(0xeb5534).setFooter({
              iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
              text: `Soundcloud`,
            });
          }

          if (!queue.node.isPlaying()) await queue.node.play();
          await queue.tasksQueue.release();

          success = true;

          const { timestamp } = useTimeline(interaction.guildId);
          if (song.duration.length >= 7) {
            timer = 10 * 60;
          } else {
            const duration = song.duration;
            const convertor = duration.split(":");
            const totalTimer = +convertor[0] * 60 + +convertor[1];

            const currentDuration = timestamp.current.label;
            const currentConvertor = currentDuration.split(":");
            const currentTimer =
              +currentConvertor[0] * 60 + +currentConvertor[1];

            timer = totalTimer - currentTimer;
          }
          if (timer < 10 * 60) {
            if (source === "public") {
              await interaction.editReply({
                embeds: [embed],
                components: [
                  new ActionRowBuilder()
                    .addComponents(favoriteButton)
                    .addComponents(lyricsButton)
                    .addComponents(downloadButton),
                ],
              });
            } else {
              await interaction.editReply({
                embeds: [embed],
                components: [
                  new ActionRowBuilder()
                    .addComponents(favoriteButton)
                    .addComponents(lyricsButton),
                ],
              });
            }
          } else {
            await interaction.editReply({
              embeds: [embed],
            });
          }
          const { guild } = interaction;
          let replayList = await replay.findOne({
            guild: guild.id,
          });
          if (!replayList) {
            replayList = new replay({
              guild: guild.id,
              Song: song.url,
              Name: song.title,
            });
            await replayList.save().catch(console.error);
          } else {
            replayList = await replay.updateOne(
              { guild: guild.id },
              {
                Song: song.url,
                Name: song.title,
              }
            );
          }
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
    success ? timer : (timer = 2 * 60);
    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;
    const timeoutLog = success
      ? "Failed to delete Play interaction."
      : "Failed to delete unsuccessfull Play interaction.";
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
