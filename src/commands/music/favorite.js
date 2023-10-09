const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const favorite = require("../../schemas/favorite-schema");
const playerDB = require("../../schemas/player-schema");
const { mongoose } = require("mongoose");
const { useMainPlayer, useMetadata, QueryType } = require("discord-player");
const { musicChannelID } = process.env;
const errorHandler = require("../../utils/handleErrors");
const queueCreator = require("../../utils/createQueue");
const buttonCreator = require("../../utils/createButtons");

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
    let success = false;
    let timer = 2 * 60;

    const action = interaction.options.get("action").value;
    const interactor = interaction.user;
    const owner = interaction.options.getUser("user") || interactor;
    const user = owner.username;
    let favoriteList = await favorite.findOne({
      User: owner.id,
    });

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (!favoriteList || favoriteList.Playlist.length === 0) {
      errorHandler.handleEmptyPlaylistError(interaction, owner);
    } else if (action === "play" && !interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else {
      const favoriteEmbed = await interaction.deferReply({
        fetchReply: true,
      });

      let embed = new EmbedBuilder()
        .setTitle(`🎶 ${user}'s Playlist`)
        .setColor(0x256fc4)
        .setFooter({
          iconURL: `https://sendabuddy.com/cdn/shop/files/newlogo_8_2048x2048.png?v=1661517305`,
          text: "Favorite",
        });

      const queue =
        client.player.nodes.get(interaction.guildId) ||
        await queueCreator.createFavoriteQueue(client, interaction);

      let sameChannel = false;

      if (action === "play") {
        if (!queue.connection) {
          await queue.connect(interaction.member.voice.channel);
        }

        sameChannel =
          queue.connection.joinConfig.channelId ===
          interaction.member.voice.channel.id;
      }

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

        mappedResultString[0] = `**${target}.** [${song.title} -- ${song.author}](${song.url})`;
        mappedArray.push(mappedResultString[0]);

        if (action === "play" && sameChannel) {
          await queue.addTrack(song);
          setMetadata(song);
        }
      } else {
        for (let i = 0; i < playlistLength; ++i) {
          result = await player.search(splitPlaylist[i], {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
          });

          mappedResultString[i] = `**${i + 1}.** [${
            result.tracks[0].title
          } -- ${result.tracks[0].author}](${result.tracks[0].url})`;
          mappedArray.push(mappedResultString[i]);

          if (action === "play" && sameChannel) {
            if (i === 0) {
              song = result.tracks[0];
              setMetadata(song);
            }

            await queue.addTrack(result.tracks[0]);
          }
        }
      }

      if (mappedArray.length === 0) {
        errorHandler.handleNoResultError(interaction);
      } else {
        switch (action) {
          case "play":
            if (song.duration.length >= 7) {
              timer = 10 * 60;
            } else {
              const duration = song.duration;
              const convertor = duration.split(":");
              timer = +convertor[0] * 60 + +convertor[1];
            }

            let nowPlaying = false;

            let queueSize = queue.tracks.size;

            if (!queue.node.isPlaying()) {
              queueSize = 0;
              await queue.node.play();
            }

            nowPlaying = queueSize === 0;

            if (!sameChannel) {
              errorHandler.handleBusyError(interaction);
            } else if (target) {
              if (nowPlaying) {
                embed.setTitle("🎵 Now Playing");

                await playerDB.updateOne(
                  { guildId: interaction.guildId },
                  { isJustAdded: true }
                );
              } else {
                embed.setTitle(`🎵 Track #${queueSize}`);

                await playerDB.updateOne(
                  { guildId: interaction.guildId },
                  { isJustAdded: false }
                );
              }

              embed
                .setThumbnail(song.thumbnail)
                .setDescription(
                  `${user}'s Playlist, Track #${target}\n**[${song.title}](${song.url})**\n**${song.author}**`
                );
            } else {
              embed
                .setThumbnail(song.thumbnail)
                .setDescription(
                  `**[${song.title}](${song.url})**\n**And ${
                    mappedArray.length - 1
                  } other tracks**`
                );
            }

            const button = buttonCreator.createButtons(nowPlaying);

            await interaction.editReply({
              embeds: [embed],
              components: [button],
            });

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
              let page = 0;

              let joinedPlaylist = mappedArray
                .slice(page * 10, page * 10 + 10)
                .join("\n");

              embed.setDescription(`${joinedPlaylist}`);

              await interaction.editReply({
                embeds: [embed],
              });

              if (totalPages > 1) {
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
            }
            success = true;
            break;

          case "remove":
            if (favoriteList.User !== interactor.id) {
              errorHandler.handleAccessDeniedError(interaction);
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
