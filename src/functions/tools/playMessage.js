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
const replay = require("../../schemas/replay-schema");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    const { guild } = message;

    let failedEmbed = new EmbedBuilder();
    let connection = false;
    let song;
    let success = false;
    let timer;

    if (message.channel.id === `744591209359474728`) {
      const channel = await guild.channels
        .fetch(musicChannelID)
        .catch(console.error);
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
        await channel.send({
          embeds: [failedEmbed],
        });
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
        await channel.send({
          embeds: [failedEmbed],
        });
      } else {
        const queue = await client.player.createQueue(message.guild, {
          leaveOnEnd: true,
          leaveOnEmpty: true,
          leaveOnEndCooldown: 5 * 60 * 1000,
          leaveOnEmptyCooldown: 5 * 60 * 1000,
          smoothVolume: true,
          ytdlOptions: {
            quality: "highestaudio",
            highWaterMark: 1 << 25,
          },
        });
        if (!queue.connection) {
          await queue.connect(message.member.voice.channel);
        }
        if (queue.connection.channel.id === message.member.voice.channel.id) {
          connection = true;
        }
        if (connection === true) {
          let embed = new EmbedBuilder();

          const addButton = new ButtonBuilder()
            .setCustomId(`favorite`)
            .setEmoji(`🤍`)
            .setStyle(ButtonStyle.Danger);
          const removeButton = new ButtonBuilder()
            .setCustomId(`remove-favorite`)
            .setEmoji(`💔`)
            .setStyle(ButtonStyle.Secondary);
          const lyricsButton = new ButtonBuilder()
            .setCustomId(`lyrics`)
            .setEmoji(`🎤`)
            .setStyle(ButtonStyle.Primary);
          const downloadButton = new ButtonBuilder()
            .setCustomId(`downloader`)
            .setEmoji(`⬇`)
            .setStyle(ButtonStyle.Primary);

          let url = message.content;
          let result;
          if (url.toLowerCase().startsWith("https")) {
            if (url.toLowerCase().includes("playlist")) {
              if (url.toLowerCase().includes("youtube")) {
                result = await client.player.search(url, {
                  requestedBy: message.author,
                  searchEngine: QueryType.YOUTUBE_PLAYLIST,
                });
              }
              if (url.toLowerCase().includes("spotify")) {
                result = await client.player.search(url, {
                  requestedBy: message.author,
                  searchEngine: QueryType.SPOTIFY_PLAYLIST,
                });
              }
              if (url.toLowerCase().includes("soundcloud")) {
                result = await client.player.search(url, {
                  requestedBy: message.author,
                  searchEngine: QueryType.SOUNDCLOUD_PLAYLIST,
                });
              }
              const playlist = result.playlist;
              if (result.tracks[0].duration.length >= 7) {
                timer = 10;
              } else {
                timer = parseInt(result.tracks[0].duration);
              }
              await queue.addTracks(result.tracks);
              embed
                .setTitle(`🎶 Playlist`)
                .setDescription(
                  `**[${playlist.title}](${playlist.url})**\n**${result.tracks.length} songs**`
                );
              song = result.tracks[result.tracks.length - 1];
            } else {
              result = await client.player.search(url, {
                requestedBy: message.author,
                searchEngine: QueryType.AUTO,
              });
              song = result.tracks[0];
              if (song.duration.length >= 7) {
                timer = 10;
              } else {
                timer = parseInt(song.duration);
              }
              embed
                .setTitle(`🎵 Track`)
                .setDescription(
                  `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
                )
                .setThumbnail(song.thumbnail);
            }
          } else {
            result = await client.player.search(url, {
              requestedBy: interaction.user,
              searchEngine: QueryType.AUTO,
            });
            song = result.tracks[0];
            if (song.duration.length >= 7) {
              timer = 10;
            } else {
              timer = parseInt(song.duration);
            }
            await queue.addTrack(song);
            embed
              .setTitle(`🎵 Track`)
              .setDescription(
                `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
              )
              .setThumbnail(song.thumbnail);
          }
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
          if (result.tracks.length === 0) {
            failedEmbed
              .setTitle(`**No Result**`)
              .setDescription(`Make sure you input a valid link.`)
              .setColor(0xffea00)
              .setThumbnail(
                `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
              );
            message.reply({
              embeds: [failedEmbed],
            });
          } else {
            if (song.url.includes("youtube")) {
              embed.setColor(0xff0000).setFooter({
                iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
                text: `YouTube`,
              });
            } else if (song.url.includes("spotify")) {
              embed.setColor(0x34eb58).setFooter({
                iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
                text: `Spotify`,
              });
            } else if (song.url.includes("soundcloud")) {
              embed.setColor(0xeb5534).setFooter({
                iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
                text: `Soundcloud`,
              });
            }
            if (!queue.playing) await queue.play();

            if (url.toLowerCase().includes("playlist")) {
              await message.reply({
                embeds: [embed],
              });
            } else {
              success = true;
              let msg;
              if (timer < 10) {
                msg = await interaction.replay({
                  embeds: [embed],
                  components: [
                    new ActionRowBuilder()
                      .addComponents(addButton)
                      .addComponents(removeButton)
                      .addComponents(lyricsButton)
                      .addComponents(downloadButton),
                  ],
                });
              } else {
                msg = await interaction.replay({
                  embeds: [embed],
                });
              }
              if (timer > 10) timer = 10;
              if (timer < 1) timer = 1;
              setTimeout(() => {
                msg.edit({ components: [] });
              }, timer * 60 * 1000);
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
          message.reply({
            embeds: [failedEmbed],
          });
        }
      }
    }
    setTimeout(() => {
      if (success === false) {
        message.delete().catch((e) => {
          console.log(`Failed to delete unsuccessfull Play message.`);
        });
      }
    }, 2 * 60 * 1000);
  });
};
