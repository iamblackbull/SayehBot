const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require("discord.js");
const { QueryType } = require("discord-player");
require("dotenv").config();
const { musicChannelID } = process.env;

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    let failedEmbed = new EmbedBuilder();
    let song;
    let type;
    let timer;
    let msg;
    let source;

    if (message.channel.id === musicChannelID) {
      if (
        !message.guild.members.me.permissions.has(
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
        msg = await message.reply({
          embeds: [failedEmbed],
        });
        setTimeout(() => {
          msg.delete().catch((e) => {
            console.log(`Failed to delete unsuccessfull Play message.`);
          });
        }, 2 * 60 * 1000);
      } else if (!message.member.voice.channel) {
        failedEmbed
          .setTitle(`**Action Failed**`)
          .setDescription(
            `You need to be in a voice channel to use this command.`
          )
          .setColor(0xffea00)
          .setThumbnail(
            `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
          );
        msg = await message.reply({
          embeds: [failedEmbed],
        });
        setTimeout(() => {
          msg.delete().catch((e) => {
            console.log(`Failed to delete unsuccessfull Play message.`);
          });
        }, 2 * 60 * 1000);
      } else {
        let url = message.content;
        let result;

        if (
          url.toLowerCase().startsWith("https") &&
          url.toLowerCase().includes("playlist")
        )
          type = "playlist";
        else if (
          url.toLowerCase().startsWith("https") &&
          url.toLowerCase().includes("album")
        )
          type = "album";
        else type = "track";

        if (type === "track") {
          result = await client.player.search(url, {
            requestedBy: message.author,
            searchEngine: QueryType.AUTO,
          });
        } else if (url.toLowerCase().includes("youtube")) {
          result = await client.player.search(url, {
            requestedBy: message.author,
            searchEngine: QueryType.YOUTUBE_PLAYLIST,
          });
        } else if (url.toLowerCase().includes("spotify")) {
          result = await client.player.search(url, {
            requestedBy: message.author,
            searchEngine: QueryType.SPOTIFY_PLAYLIST,
          });
        } else if (url.toLowerCase().includes("soundcloud")) {
          result = await client.player.search(url, {
            requestedBy: message.author,
            searchEngine: QueryType.SOUNDCLOUD_PLAYLIST,
          });
        } else if (url.toLowerCase().includes("apple") && type === "playlist") {
          result = await client.player.search(url, {
            requestedBy: message.author,
            searchEngine: QueryType.APPLE_MUSIC_PLAYLIST,
          });
        } else if (url.toLowerCase().includes("apple") && type === "album") {
          result = await client.player.search(url, {
            requestedBy: message.author,
            searchEngine: QueryType.APPLE_MUSIC_ALBUM,
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
          msg = await message.reply({
            embeds: [failedEmbed],
          });
          setTimeout(() => {
            msg.delete().catch((e) => {
              console.log(`Failed to delete unsuccessfull Play message.`);
            });
          }, 2 * 60 * 1000);
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
          }
          if (!queue.connection) {
            await queue.connect(message.member.voice.channel);
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
            const skipButton = new ButtonBuilder()
              .setCustomId(`skipper`)
              .setEmoji(`⏭`)
              .setStyle(ButtonStyle.Secondary);

            if (type === "track") {
              song = result.tracks[0];
              await queue.addTrack(song);

              if (newQueue) {
                embed.setTitle(`🎵 Now Playing`);
              } else {
                embed.setTitle(`🎵 Track #${queue.tracks.size}`);
              }

              embed
                .setDescription(
                  `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
                )
                .setThumbnail(song.thumbnail);
            } else {
              const playlist = result.playlist;
              await queue.addTrack(result.tracks);

              embed
                .setDescription(
                  `**[${playlist.title}](${playlist.url})**\n**${result.tracks.length} songs**`
                )
                .setThumbnail(playlist.thumbnail);
              song = result.tracks[result.tracks.length - 1];

              if (type === "playlist") embed.setTitle(`🎶 Playlist`);
              if (type === "album") embed.setTitle(`🎶 Album`);
            }

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

            if (type === "playlist" || type === "album") {
              await message.reply({
                embeds: [embed],
              });
            } else {
              if (newQueue && timer < 10 * 60) {
                if (source === "public") {
                  msg = await message.reply({
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
                  msg = await message.reply({
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
                msg = await message.reply({
                  embeds: [embed],
                });
              }
              if (result.tracks[0].duration.length >= 7) {
                timer = 10 * 60;
              } else {
                const duration = result.tracks[0].duration;
                const convertor = duration.split(":");
                timer = +convertor[0] * 60 + +convertor[1];
              }

              if (timer > 10 * 60) timer = 10 * 60;
              if (timer < 1 * 60) timer = 1 * 60;
              setTimeout(() => {
                msg.edit({ components: [] });
              }, timer * 1000);
            }
          } else {
            failedEmbed
              .setTitle(`**Busy**`)
              .setDescription(`Bot is busy in another voice channel.`)
              .setColor(0x256fc4)
              .setThumbnail(
                `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
              );
            msg = await message.reply({
              embeds: [failedEmbed],
            });
            setTimeout(() => {
              msg.delete().catch((e) => {
                console.log(`Failed to delete unsuccessfull Play message.`);
              });
            }, 2 * 60 * 1000);
          }
        }
      }
    }
  });
};
