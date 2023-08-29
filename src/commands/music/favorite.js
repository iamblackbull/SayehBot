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
const { useMainPlayer, useMetadata, QueryType } = require("discord-player");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("favorite")
    .setDescription("Interact with your favortie playlist.")
    .addStringOption((option) => {
      return option
        .setName(`action`)
        .setDescription(
          `Choose an action to perform on your favorite playlist.`
        )
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
        .setDescription(`Input a track number from your favorite playlist.`)
        .setMinValue(1)
        .setRequired(false);
    })
    .addUserOption((option) => {
      return option
        .setName("user")
        .setDescription("Pick any member to see their favorite playlist.")
        .setRequired(false);
    })
    .setDMPermission(false),

  async execute(interaction, client) {
    let failedEmbed = new EmbedBuilder();
    let success = false;
    let timer;

    const action = interaction.options.get("action").value;
    const target = interaction.options.getUser("user") || interaction.user;
    const user = target.username;
    let favoriteList = await favorite.findOne({
      User: target.id,
    });

    if (mongoose.connection.readyState !== 1) {
      failedEmbed
        .setTitle(`**Connection Timed out!**`)
        .setDescription(`Connection to database has been timed out.`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://cdn.iconscout.com/icon/premium/png-256-thumb/error-in-internet-959268.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else if (!favoriteList || favoriteList.Playlist.length === 0) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `**${target}** doesn't have a favorite playlist. Like at least **1** track to create your own playlist.\nTry again with </favorite:1108681222764367962>.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else if (action === "play" && !interaction.member.voice.channel) {
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
      const favoriteEmbed = await interaction.deferReply({
        fetchReply: true,
      });

      let embed = new EmbedBuilder()
        .setTitle(`🎶 ${user}'s Playlist`)
        .setColor(0x256fc4)
        .setFooter({
          iconURL: `https://www.linkpicture.com/q/2753995-201.png`,
          text: "Favorite",
        });

      let queue = client.player.nodes.get(interaction.guildId);

      if (action === "play") {
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
      }

      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel);
      }

      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      const playlist = favoriteList.Playlist.map((song) => song.Url).join("\n");
      const splitPlaylist = playlist.split("\n");
      const playlistLength = splitPlaylist.length;

      const player = useMainPlayer();
      const [setMetadata] = useMetadata(interaction.guild.id);

      let result;
      let mappedResultString = {};
      let mappedArray = [];
      let song;

      let target = interaction.options.getInteger("tracknumber");

      if (target) {
        if (target > playlistLength) target = playlistLength;

        result = await player.search(splitPlaylist[target - 1], {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        });

        song = result.tracks[0];

        if (action === "play" && sameChannel) {
          await queue.addTrack(song);
          setMetadata(song);

          if (!queue.node.isPlaying()) await queue.node.play();
        }
      } else {
        for (let i = 0; i < playlistLength; ++i) {
          result = await player.search(splitPlaylist[i], {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
          });

          while (i === 0) {
            song = result.tracks[0];
            if (action === "play") {
              setMetadata(song);
            }
          }

          mappedResultString[i] = `**${i + 1}.** [${
            result.tracks[0].title
          } -- ${result.tracks[0].author}](${result.tracks[0].url})`;
          mappedArray.push(mappedResultString[i]);

          if (action === "play" && sameChannel) {
            await queue.addTrack(result.tracks[0]);

            if (!queue.node.isPlaying()) await queue.node.play();
          }
        }
      }

      if (mappedArray.length === 0) {
        failedEmbed
          .setTitle(`**No Result**`)
          .setDescription(
            `Make sure you have a valid track url in your playlist.\nTry again with </favorite:1108681222764367962>.`
          )
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );
        await interaction.editReply({
          embeds: [failedEmbed],
        });
      } else {
        if (song.duration.length >= 7) {
          timer = 10 * 60;
        } else {
          const duration = song.duration;
          const convertor = duration.split(":");
          timer = +convertor[0] * 60 + +convertor[1];
        }

        switch (action) {
          case "play":
            if (!sameChannel) {
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
            } else if (target) {
              const currentSong = queue.currentTrack;
              const nowPlaying = currentSong.url === song.url;

              if (nowPlaying) {
                embed.setTitle("🎵 Now Playing");
              } else {
                embed.setTitle(`🎵 Track #${queue.tracks.size}`);
              }

              embed
                .setThumbnail(song.thumbnail)
                .setDescription(
                  `${user}'s Playlist, Track #${target}\n**[${song.title}](${song.url})**\n**${song.author}**`
                );

              let source;
              if (song.url.includes("spotify")) source = "private";
              else source = "public";

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
            } else {
              embed
                .setThumbnail(song.thumbnail)
                .setDescription(
                  `**[${song.title}](${song.url})**\n**And ${
                    mappedArray.length - 1
                  } other tracks**`
                );

              await interaction.editReply({
                embeds: [embed],
              });
            }
            success = true;
            break;

          case "list":
            if (target) {
              embed
                .setThumbnail(song.thumbnail)
                .setDescription(
                  `**Track #${target}**\n**[${song.title}](${song.url})**\n**${song.author}**`
                );

              await interaction.editReply({
                embeds: [embed],
              });
            } else {
              let totalPages =
                mappedArray.length > 10
                  ? Math.ceil(mappedArray.length / 10)
                  : 1;
              let page = totalPages - 1;

              let joinedPlaylist = mappedArray
                .slice(page * 10, page * 10 + 10)
                .join("\n");

              embed.setDescription(`${joinedPlaylist}`);

              await interaction.editReply({
                embeds: [embed],
              });

              favoriteEmbed.react("⬅");
              favoriteEmbed.react("➡");

              const filter = (reaction, user) => {
                [`⬅`, `➡`].includes(reaction.emoji.name) &&
                  user.id === interaction.user.id;
              };
              const collector = favoriteEmbed.createReactionCollector(filter);
              collector.on("collect", async (reaction, user) => {
                if (user.bot) return;
                reaction.users.remove(reaction.users.cache.get(user.id));

                if (reaction.emoji.name === `➡`) {
                  if (page < totalPages - 1) {
                    page++;

                    joinedPlaylist = mappedArray
                      .slice(page * 10, page * 10 + 10)
                      .join("\n");

                    embed.setDescription(`${joinedPlaylist}`);

                    await interaction.editReply({
                      embeds: [embed],
                    });
                  }
                } else if (page !== 0) {
                  --page;

                  joinedPlaylist = mappedArray
                    .slice(page * 10, page * 10 + 10)
                    .join("\n");

                  embed.setDescription(`${joinedPlaylist}`);

                  await interaction.editReply({
                    embeds: [embed],
                  });
                }
              });
            }
            success = true;
            break;

          case "remove":
            if (favoriteList.User !== target.id) {
              failedEmbed
                .setTitle(`**Access denied**`)
                .setDescription(`You don't have access to perform this action.`)
                .setColor(0xe01010)
                .setThumbnail(
                  `https://cdn-icons-png.flaticon.com/512/4201/4201965.png`
                );
              await interaction.editReply({
                embeds: [failedEmbed],
              });
            } else {
              let warningEmbed = new EmbedBuilder()
                .setThumbnail(
                  `https://cdn3.iconfinder.com/data/icons/flat-common-4/32/delete-warning-512.png`
                )
                .setColor(0xffea00);

              const continueButton = new ButtonBuilder()
                .setCustomId(`continue`)
                .setLabel(`Continue`)
                .setStyle(ButtonStyle.Success);
              const cancelButton = new ButtonBuilder()
                .setCustomId(`cancel`)
                .setLabel(`Cancel`)
                .setStyle(ButtonStyle.Danger);
              if (target) {
                warningEmbed
                  .setTitle("**Deletion Warning**")
                  .setDescription(
                    `You are about to remove track #${target} from your playlist:\n**[${song.title}](${song.url})**\nAre you sure you want to continue?`
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
                        (favSong) => favSong.Url === song.url
                      );
                      favoriteSongs.splice(songIndex, 1);
                      await favoriteList.save().catch(console.error);

                      embed
                        .setTitle(`**Delete Track**`)
                        .setThumbnail(
                          `https://static.wikia.nocookie.net/logopedia/images/f/fe/Recycle_Bin_Windows_11_empty.png/revision/latest/scale-to-width-down/250?cb=20210616182845`
                        )
                        .setDescription(
                          `**${song.title}**\nhas been removed from your favorite playlist.`
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
                  .catch((error) => {
                    if (error.code === "InteractionCollectorError") {
                      console.log(
                        `Interaction response timed out for command ${interaction.commandName}.`
                      );
                    } else {
                      console.log(
                        `Something went wrong while awaiting interaction response for command ${interaction.commandName}.`
                      );
                    }
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
                        .setDescription(
                          `Clearation process has been canceled.`
                        );

                      await interaction.editReply({
                        embeds: [embed],
                        components: [],
                      });
                    }
                  })
                  .catch((error) => {
                    if (error.code === "InteractionCollectorError") {
                      console.log(
                        `Interaction response timed out for command ${interaction.commandName}.`
                      );
                    } else {
                      console.log(
                        `Something went wrong while awaiting interaction response for command ${interaction.commandName}.`
                      );
                    }
                  });
              }
              success = true;
            }
            break;
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
