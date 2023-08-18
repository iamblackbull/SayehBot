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
        let queue = client.player.nodes.get(interaction.guildId);
        if (!queue) {
          queue = await client.player.nodes.create(message.guild, {
            metadata: {
              channel: interaction.channel,
              client: interaction.guild.members.me,
              requestedBy: interaction.user,
            },
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

          let url = message.content;
          let result;

          if (
            url.toLowerCase().startsWith("https") &&
            url.toLowerCase().includes("playlist")
          )
            type = "playlist";
          else type = "track";

          if (type === "playlist") {
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
              timer = 10 * 60;
            } else {
              const duration = result.tracks[0].duration;
              const convertor = duration.split(":");
              timer = +convertor[0] * 60 + +convertor[1];
            }
            await queue.addTrack(result.tracks);
            embed
              .setTitle(`🎶 Playlist`)
              .setDescription(
                `**[${playlist.title}](${playlist.url})**\n**${result.tracks.length} songs**`
              );
            song = result.tracks[result.tracks.length - 1];
          }
          if (type === "track") {
            result = await client.player.search(url, {
              requestedBy: message.author,
              searchEngine: QueryType.AUTO,
            });
            song = result.tracks[0];
            if (song.duration.length >= 7) {
              timer = 10 * 60;
            } else {
              const duration = song.duration;
              const convertor = duration.split(":");
              timer = +convertor[0] * 60 + +convertor[1];
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
            msg = await message.reply({
              embeds: [failedEmbed],
            });
            setTimeout(() => {
              msg.delete().catch((e) => {
                console.log(`Failed to delete unsuccessfull Play message.`);
              });
            }, 2 * 60 * 1000);
          } else {
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
            }
            if (!queue.node.isPlaying()) await queue.node.play();

            if (type === "playlist") {
              await message.reply({
                embeds: [embed],
              });
            } else {
              if (timer < 10 * 60) {
                if (source === "public") {
                  msg = await message.reply({
                    embeds: [embed],
                    components: [
                      new ActionRowBuilder()
                        .addComponents(favoriteButton)
                        .addComponents(lyricsButton)
                        .addComponents(downloadButton),
                    ],
                  });
                } else {
                  msg = await message.reply({
                    embeds: [embed],
                    components: [
                      new ActionRowBuilder()
                        .addComponents(favoriteButton)
                        .addComponents(lyricsButton),
                    ],
                  });
                }
              } else {
                msg = await message.reply({
                  embeds: [embed],
                });
              }
              if (timer > 10 * 60) timer = 10 * 60;
              if (timer < 1 * 60) timer = 1 * 60;
              setTimeout(() => {
                msg.edit({ components: [] });
              }, timer * 1000);
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
  });
};
