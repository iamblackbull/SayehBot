const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const favorite = require("../../schemas/favorite-schema");
const { mongoose } = require("mongoose");
const { useMainPlayer, QueryType } = require("discord-player");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("favorite")
    .setDescription("Returns user favortie playlist")
    .addStringOption((option) => {
      return option
        .setName(`action`)
        .setDescription(`Choose action`)
        .setRequired(true)
        .addChoices(
          {
            name: `Play`,
            value: `play`,
          },
          {
            name: `List`,
            value: `list`,
          },
          {
            name: `Remove`,
            value: `remove`,
          }
        );
    })
    .addIntegerOption((option) => {
      return option
        .setName(`tracknumber`)
        .setDescription(
          `Input the number of the track you want from your favorite playlist`
        )
        .setMinValue(1)
        .setRequired(false);
    })
    .setDMPermission(false),
  async execute(interaction, client) {
    const favoriteEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let target = interaction.options.getInteger("tracknumber");
    let success = false;
    let timer;
    let failedEmbed = new EmbedBuilder();
    let embed = new EmbedBuilder()
      .setTitle(`🎶 Playlist`)
      .setColor(0x256fc4)
      .setFooter({
        iconURL: `https://www.linkpicture.com/q/2753995-201.png`,
        text: "Favorite",
      });

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
    const continueButton = new ButtonBuilder()
      .setCustomId(`continue`)
      .setLabel(`Continue`)
      .setStyle(ButtonStyle.Success);
    const cancelButton = new ButtonBuilder()
      .setCustomId(`cancel`)
      .setLabel(`Cancel`)
      .setStyle(ButtonStyle.Danger);

    if (mongoose.connection.readyState !== 1) {
      failedEmbed
        .setTitle(`**Connection Timed out!**`)
        .setDescription(`Connection to database has been timed out.`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://cdn.iconscout.com/icon/premium/png-256-thumb/error-in-internet-959268.png`
        );
      interaction.editReply({
        embeds: [failedEmbed],
      });
    } else {
      let favoriteList = await favorite.findOne({
        User: interaction.user.id,
      });
      if (!favoriteList) {
        failedEmbed
          .setTitle(`**Action Failed**`)
          .setDescription(
            `You don't have a favorite playlist. Like at least **1** song to create your own playlist.\nTry again with </favorite:1108681222764367962>.`
          )
          .setColor(0xffea00)
          .setThumbnail(
            `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
          );
        await interaction.editReply({
          embeds: [failedEmbed],
        });
      } else {
        const mappedURLs = favoriteList.Playlist.map(
          (song, index) => `**${index + 1}.** ${song.Url}`
        ).join("\n");

        const playlist = favoriteList.Playlist.map((song) => song.Url).join(
          "\n"
        );

        const splitPlaylist = playlist.split("\n");
        const playlistLength = splitPlaylist.length;

        const player = useMainPlayer();
        let result;
        let resultArray = {};
        let mappedArray = [];

        for (let i = 0; i < playlistLength; ++i) {
          result = await player.search(splitPlaylist[i], {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
          });
          resultArray[i] = `**${i + 1}.** [${result.tracks[0].title} -- ${
            result.tracks[0].author
          }](${result.tracks[0].url})`;
          mappedArray.push(resultArray[i]);
        }

        if (result.tracks.length === 0) {
          failedEmbed
            .setTitle(`**No Result**`)
            .setDescription(
              `Make sure you have a valid track url in your playlist.\nTry again with </favorite:1108681222764367962>.`
            )
            .setColor(0xffea00)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
            );
          interaction.editReply({
            embeds: [failedEmbed],
          });
        } else {
          const joinedPlaylist = mappedArray.join("\n");
          const mappedSongsLength = mappedArray.length;

          if (interaction.options.get("action").value === "list") {
            if (target) {
              if (target > mappedSongsLength) target = mappedSongsLength;
              const targetSong = mappedArray[target - 1];

              embed.setDescription(`${targetSong}`);
              await interaction.editReply({
                embeds: [embed],
              });
            } else {
              embed.setDescription(`${joinedPlaylist}`);
              await interaction.editReply({
                embeds: [embed],
              });
            }
          } else if (interaction.options.get("action").value === "remove") {
            let warningEmbed = new EmbedBuilder()
              .setThumbnail(
                `https://cdn3.iconfinder.com/data/icons/flat-common-4/32/delete-warning-512.png`
              )
              .setColor(0xffea00);
            if (target) {
              if (target > playlistLength) target = playlistLength;
              const targetURL = splitPlaylist[target - 1];
              const targetSong = mappedArray[target - 1];

              warningEmbed
                .setTitle("**Deletion Warning**")
                .setDescription(
                  `You are about to remove this track from your playlist:\n${targetSong}\nAre you sure you want to continue?`
                );
              await interaction.editReply({
                embeds: [warningEmbed],
                components: [
                  new ActionRowBuilder()
                    .addComponents(cancelButton)
                    .addComponents(continueButton),
                ],
              });
              favoriteEmbed
                .awaitMessageComponent({
                  componentType: ComponentType.Button,
                  time: 5 * 60 * 1000,
                })
                .then(async (messageComponentInteraction) => {
                  if (
                    messageComponentInteraction.customId === `continue` &&
                    messageComponentInteraction.user.id === favoriteList.User
                  ) {
                    const favoriteSongs = favoriteList.Playlist;
                    const songIndex = favoriteSongs.findIndex(
                      (favSong) => favSong.Url === targetURL
                    );
                    favoriteSongs.splice(songIndex, 1);
                    await favoriteList.save().catch(console.error);

                    embed
                      .setTitle(`**Delete Track**`)
                      .setThumbnail(
                        `https://static.wikia.nocookie.net/logopedia/images/f/fe/Recycle_Bin_Windows_11_empty.png/revision/latest/scale-to-width-down/250?cb=20210616182845`
                      )
                      .setDescription(
                        `**${targetSong}**\nhas been removed from your favorite playlist.`
                      );

                    console.log(
                      `${messageComponentInteraction.user.username} just removed track #${target} from their favorite playlist.`
                    );

                    await interaction.editReply({
                      embeds: [embed],
                      components: [],
                    });
                  } else if (
                    messageComponentInteraction.customId === `cancel` &&
                    messageComponentInteraction.user.id === favoriteList.User
                  ) {
                    embed
                      .setTitle(`**Deletion Canceled**`)
                      .setThumbnail(
                        `https://cdn-icons-png.flaticon.com/512/5268/5268671.png`
                      )
                      .setDescription(`Deletion process has been canceled.`);
                    await interaction.editReply({
                      embeds: [embed],
                      components: [],
                    });
                  }
                })
                .catch((e) => {
                  console.log(e);
                  console.log(
                    `Delete collector of Favorite did not receive any interactions before ending.`
                  );
                });
            } else {
              warningEmbed
                .setTitle("**Clearation Warning**")
                .setDescription(
                  "You are about to **clear your playlist completely!**\nAre you sure you want to continue?"
                );
              await interaction.editReply({
                embeds: [warningEmbed],
                components: [
                  new ActionRowBuilder()
                    .addComponents(cancelButton)
                    .addComponents(continueButton),
                ],
              });
              favoriteEmbed
                .awaitMessageComponent({
                  componentType: ComponentType.Button,
                  time: 5 * 60 * 1000,
                })
                .then(async (messageComponentInteraction) => {
                  if (
                    messageComponentInteraction.customId === `continue` &&
                    messageComponentInteraction.user.id === favoriteList.User
                  ) {
                    await favorite.findOneAndDelete({
                      User: messageComponentInteraction.user.id,
                    });

                    embed
                      .setTitle(`**Clear Playlist**`)
                      .setThumbnail(
                        `https://static.wikia.nocookie.net/logopedia/images/f/fe/Recycle_Bin_Windows_11_empty.png/revision/latest/scale-to-width-down/250?cb=20210616182845`
                      )
                      .setDescription(`Your playlist has been cleared.`);

                    console.log(
                      `${messageComponentInteraction.user.username} just cleared their favorite playlist.`
                    );

                    await interaction.editReply({
                      embeds: [embed],
                      components: [],
                    });
                  } else if (
                    messageComponentInteraction.customId === `cancel` &&
                    messageComponentInteraction.user.id === favoriteList.User
                  ) {
                    embed
                      .setTitle(`**Clearation Canceled**`)
                      .setThumbnail(
                        `https://cdn-icons-png.flaticon.com/512/5268/5268671.png`
                      )
                      .setDescription(`Clearation process has been canceled.`);

                    await interaction.editReply({
                      embeds: [embed],
                      components: [],
                    });
                  }
                })
                .catch((e) => {
                  console.log(e);
                  console.log(
                    `Clear collector of Favorite did not receive any interactions before ending.`
                  );
                });
            }
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
              if (target) {
                if (target > playlistLength) target = playlistLength;
                const song = splitPlaylist[target - 1];
                if (song.duration.length >= 7) {
                  timer = 10 * 60;
                } else {
                  const duration = song.duration;
                  const convertor = duration.split(":");
                  timer = +convertor[0] * 60 + +convertor[1];
                }
                await queue.addTrack(song);
                embed
                  .setThumbnail(song.thumbnail)
                  .setDescription(
                    `**[${song.title}](${song.url})**\n**${song.author}**\n${interaction.user}'s Playlist, Track #${target}`
                  );
                if (!queue.node.isPlaying()) await queue.node.play();

                let source;
                if (song.url.includes("spotify")) source = "private";
                else source = "public";

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
                success = true;
              } else {
                await queue.addTrack(splitPlaylist);
                let favoriteLength = queue.tracks.size;
                const song = result.tracks[0];
                if (song.duration.length >= 7) {
                  timer = 10 * 60;
                } else {
                  const duration = song.duration;
                  const convertor = duration.split(":");
                  timer = +convertor[0] * 60 + +convertor[1];
                }
                embed
                  .setThumbnail(song.thumbnail)
                  .setDescription(
                    `**${interaction.user}'s Playlist**\n**${favoriteLength}** tracks`
                  );
                if (!queue.node.isPlaying()) await queue.node.play();

                await interaction.editReply({
                  embeds: [embed],
                });
                success = true;
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
      }
    }
    success ? timer : (timer = 2 * 60);
    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;
    const timeoutLog = success
      ? "Failed to delete Favorite interaction."
      : "Failed to delete unsuccessfull Favorite interaction.";
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
