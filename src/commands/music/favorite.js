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
const { QueryType } = require("discord-player");
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
        .setMaxValue(10)
        .setRequired(false);
    })
    .setDMPermission(false),
  async execute(interaction, client) {
    const favoriteEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let connection = false;
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

    if (mongoose.connection.readyState !== 1) {
      failedEmbed
        .setTitle(`**Connection Timed out!**`)
        .setDescription(
          `Connection to database has been timed out. please try again later.`
        )
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
            `You don't have a favorite playlist. Like at least **1** song to create your own playlist.`
          )
          .setColor(0xffea00)
          .setThumbnail(
            `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
          );
        interaction.editReply({
          embeds: [failedEmbed],
        });
      } else if (interaction.options.get("action").value === "list") {
        let song1 = `[${favoriteList.Name1}](${favoriteList.Song1})`;
        let song2 = `[${favoriteList.Name2}](${favoriteList.Song2})`;
        let song3 = `[${favoriteList.Name3}](${favoriteList.Song3})`;
        let song4 = `[${favoriteList.Name4}](${favoriteList.Song4})`;
        let song5 = `[${favoriteList.Name5}](${favoriteList.Song5})`;
        let song6 = `[${favoriteList.Name6}](${favoriteList.Song6})`;
        let song7 = `[${favoriteList.Name7}](${favoriteList.Song7})`;
        let song8 = `[${favoriteList.Name8}](${favoriteList.Song8})`;
        let song9 = `[${favoriteList.Name9}](${favoriteList.Song9})`;
        let song10 = `[${favoriteList.Name10}](${favoriteList.Song10})`;

        if (!favoriteList.Name1) {
          song1 = `Empty`;
        }
        if (!favoriteList.Name2) {
          song2 = `Empty`;
        }
        if (!favoriteList.Name3) {
          song3 = `Empty`;
        }
        if (!favoriteList.Name4) {
          song4 = `Empty`;
        }
        if (!favoriteList.Name5) {
          song5 = `Empty`;
        }
        if (!favoriteList.Name6) {
          song6 = `Empty`;
        }
        if (!favoriteList.Name7) {
          song7 = `Empty`;
        }
        if (!favoriteList.Name8) {
          song8 = `Empty`;
        }
        if (!favoriteList.Name9) {
          song9 = `Empty`;
        }
        if (!favoriteList.Name10) {
          song10 = `Empty`;
        }

        const favoriteString = `**1.** ${song1}\n**2.** ${song2}\n**3.** ${song3}\n**4.** ${song4}\n**5.** ${song5}\n**6.** ${song6}\n**7.** ${song7}\n**8.** ${song8}\n**9.** ${song9}\n**10.** ${song10}`;

        if (interaction.options.getInteger("tracknumber")) {
          const target = interaction.options.getInteger("tracknumber");
          let targetRes;
          if (target === 1) {
            targetRes = song1;
          }
          if (target === 2) {
            targetRes = song2;
          }
          if (target === 3) {
            targetRes = song3;
          }
          if (target === 4) {
            targetRes = song4;
          }
          if (target === 5) {
            targetRes = song5;
          }
          if (target === 6) {
            targetRes = song6;
          }
          if (target === 7) {
            targetRes = song7;
          }
          if (target === 8) {
            targetRes = song8;
          }
          if (target === 9) {
            targetRes = song9;
          }
          if (target === 10) {
            targetRes = song10;
          }

          const removeButton = new ButtonBuilder()
            .setCustomId(`remove-favorite`)
            .setEmoji(`💔`)
            .setStyle(ButtonStyle.Secondary);
          favoriteEmbed
            .awaitMessageComponent({
              componentType: ComponentType.Button,
              time: 5 * 60 * 1000,
            })
            .then(async (interaction) => {
              if (target === 1) {
                await favorite.updateOne(
                  { User: interaction.user.id },
                  { Song1: null, Name1: null }
                );
              }
              if (target === 2) {
                await favorite.updateOne(
                  { User: interaction.user.id },
                  { Song2: null, Name2: null }
                );
              }
              if (target === 3) {
                await favorite.updateOne(
                  { User: interaction.user.id },
                  { Song3: null, Name3: null }
                );
              }
              if (target === 4) {
                await favorite.updateOne(
                  { User: interaction.user.id },
                  { Song4: null, Name4: null }
                );
              }
              if (target === 5) {
                await favorite.updateOne(
                  { User: interaction.user.id },
                  { Song5: null, Name5: null }
                );
              }
              if (target === 6) {
                await favorite.updateOne(
                  { User: interaction.user.id },
                  { Song6: null, Name6: null }
                );
              }
              if (target === 7) {
                await favorite.updateOne(
                  { User: interaction.user.id },
                  { Song7: null, Name7: null }
                );
              }
              if (target === 8) {
                await favorite.updateOne(
                  { User: interaction.user.id },
                  { Song8: null, Name8: null }
                );
              }
              if (target === 9) {
                await favorite.updateOne(
                  { User: interaction.user.id },
                  { Song9: null, Name9: null }
                );
              }
              if (target === 10) {
                await favorite.updateOne(
                  { User: interaction.user.id },
                  { Song10: null, Name10: null }
                );
              }
              const removeEmbed = new EmbedBuilder()
                .setTitle(`Remove Favorite`)
                .setDescription(
                  `Song **#${target}** has been removed from your favorite playlist.`
                )
                .setColor(0x25bfc4)
                .setThumbnail(
                  `https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Broken_heart.svg/586px-Broken_heart.svg.png`
                )
                .setFooter({
                  iconURL: `https://www.linkpicture.com/q/2753995-201.png`,
                  text: "Favorite",
                });
              await interaction.reply({
                embeds: [removeEmbed],
                ephemeral: true,
              });
              console.log(
                `${interaction.user.username} just removed their song #${target} from their favorite playlist.`
              );
            })
            .catch((e) => {
              console.log(
                `Remove Favortie collector of Favorite List did not recieve any interactions before ending.`
              );
            });

          embed.setDescription(`**${target}.** ${targetRes}`);
          await interaction.editReply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(removeButton)],
          });
        } else {
          embed.setDescription(`${favoriteString}`);
          await interaction.editReply({
            embeds: [embed],
          });
        }
      } else if (interaction.options.get("action").value === "remove") {
        let removeEmbed = new EmbedBuilder()
          .setColor(0x25bfc4)
          .setThumbnail(
            `https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Broken_heart.svg/586px-Broken_heart.svg.png`
          )
          .setFooter({
            iconURL: `https://www.linkpicture.com/q/2753995-201.png`,
            text: "Favorite",
          });
        if (interaction.options.getInteger("tracknumber")) {
          const target = interaction.options.getInteger("tracknumber");
          if (target === 1) {
            await favorite.updateOne(
              { User: interaction.user.id },
              { Song1: null, Name1: null }
            );
          }
          if (target === 2) {
            await favorite.updateOne(
              { User: interaction.user.id },
              { Song2: null, Name2: null }
            );
          }
          if (target === 3) {
            await favorite.updateOne(
              { User: interaction.user.id },
              { Song3: null, Name3: null }
            );
          }
          if (target === 4) {
            await favorite.updateOne(
              { User: interaction.user.id },
              { Song4: null, Name4: null }
            );
          }
          if (target === 5) {
            await favorite.updateOne(
              { User: interaction.user.id },
              { Song5: null, Name5: null }
            );
          }
          if (target === 6) {
            await favorite.updateOne(
              { User: interaction.user.id },
              { Song6: null, Name6: null }
            );
          }
          if (target === 7) {
            await favorite.updateOne(
              { User: interaction.user.id },
              { Song7: null, Name7: null }
            );
          }
          if (target === 8) {
            await favorite.updateOne(
              { User: interaction.user.id },
              { Song8: null, Name8: null }
            );
          }
          if (target === 9) {
            await favorite.updateOne(
              { User: interaction.user.id },
              { Song9: null, Name9: null }
            );
          }
          if (target === 10) {
            await favorite.updateOne(
              { User: interaction.user.id },
              { Song10: null, Name10: null }
            );
          }
          removeEmbed
            .setTitle(`Remove Favorite`)
            .setDescription(
              `Song **#${target}** has been removed from your favorite playlist.`
            );
          console.log(
            `${interaction.user.username} just removed their song #${target} from their favorite playlist.`
          );
        } else {
          await favorite.findOneAndDelete({
            User: interaction.user.id,
          });
          removeEmbed
            .setTitle(`Clear Favorite`)
            .setDescription(`Your favorite playlist has been cleared.`);
          console.log(
            `${interaction.user.username} just cleared their favorite playlist.`
          );
        }
        await interaction.editReply({
          embeds: [removeEmbed],
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
        const queue = await client.player.createQueue(interaction.guild, {
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
          await queue.connect(interaction.member.voice.channel);
        }
        if (
          queue.connection.channel.id === interaction.member.voice.channel.id
        ) {
          connection = true;
        }
        if (connection === true) {
          let favoriteLength;
          if (interaction.options.getInteger("tracknumber")) {
            const target = interaction.options.getInteger("tracknumber");
            let url;
            if (target === 1) {
              url = favoriteList.Song1;
              favoriteLength = 1;
            }
            if (target === 2) {
              url = favoriteList.Song2;
              favoriteLength = 2;
            }
            if (target === 3) {
              url = favoriteList.Song3;
              favoriteLength = 3;
            }
            if (target === 4) {
              url = favoriteList.Song4;
              favoriteLength = 4;
            }
            if (target === 5) {
              url = favoriteList.Song5;
              favoriteLength = 5;
            }
            if (target === 6) {
              url = favoriteList.Song6;
              favoriteLength = 6;
            }
            if (target === 7) {
              url = favoriteList.Song7;
              favoriteLength = 7;
            }
            if (target === 8) {
              url = favoriteList.Song8;
              favoriteLength = 8;
            }
            if (target === 9) {
              url = favoriteList.Song9;
              favoriteLength = 9;
            }
            if (target === 10) {
              url = favoriteList.Song10;
              favoriteLength = 10;
            }
            const result = await client.player.search(url, {
              requestedBy: interaction.user,
              searchEngine: QueryType.AUTO,
            });
            if (result.tracks.length === 0) {
              failedEmbed
                .setTitle(`**No Result**`)
                .setDescription(
                  `Make sure you have a valid song at position **${favoriteLength}** in your playlist.`
                )
                .setColor(0xffea00)
                .setThumbnail(
                  `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                );
              interaction.editReply({
                embeds: [failedEmbed],
              });
            } else {
              let song = result.tracks[0];
              timer = parseInt(song.duration);
              await queue.addTrack(song);
              embed
                .setThumbnail(song.thumbnail)
                .setDescription(
                  `${interaction.user}\nSong **#${favoriteLength}**`
                );
              if (!queue.playing) await queue.play();

              await interaction.editReply({
                embeds: [embed],
              });
              success = true;
            }
          } else {
            if (favoriteList.Song1) {
              let url = favoriteList.Song1;
              favoriteLength = 1;
              const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO,
              });
              if (result.tracks.length === 0) {
                failedEmbed
                  .setTitle(`**No Result**`)
                  .setDescription(
                    `Make sure you have a valid song at position **${favoriteLength}** in your playlist.`
                  )
                  .setColor(0xffea00)
                  .setThumbnail(
                    `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                  );
                interaction.editReply({
                  embeds: [failedEmbed],
                });
              } else {
                let song = result.tracks[0];
                timer = parseInt(song.duration);
                await queue.addTrack(song);
                embed.setThumbnail(song.thumbnail);

                if (favoriteList.Song2) {
                  url = favoriteList.Song2;
                  favoriteLength = 2;
                  const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO,
                  });
                  if (result.tracks.length === 0) {
                    failedEmbed
                      .setTitle(`**No Result**`)
                      .setDescription(
                        `Make sure you have a valid song at position **${favoriteLength}** in your playlist.`
                      )
                      .setColor(0xffea00)
                      .setThumbnail(
                        `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                      );
                    interaction.editReply({
                      embeds: [failedEmbed],
                    });
                  } else {
                    let song = result.tracks[0];
                    await queue.addTrack(song);

                    if (favoriteList.Song3) {
                      url = favoriteList.Song3;
                      favoriteLength = 3;
                      const result = await client.player.search(url, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.AUTO,
                      });
                      if (result.tracks.length === 0) {
                        failedEmbed
                          .setTitle(`**No Result**`)
                          .setDescription(
                            `Make sure you have a valid song at position **${favoriteLength}** in your playlist.`
                          )
                          .setColor(0xffea00)
                          .setThumbnail(
                            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                          );
                        interaction.editReply({
                          embeds: [failedEmbed],
                        });
                      } else {
                        let song = result.tracks[0];
                        await queue.addTrack(song);

                        if (favoriteList.Song4) {
                          url = favoriteList.Song4;
                          favoriteLength = 4;
                          const result = await client.player.search(url, {
                            requestedBy: interaction.user,
                            searchEngine: QueryType.AUTO,
                          });
                          if (result.tracks.length === 0) {
                            failedEmbed
                              .setTitle(`**No Result**`)
                              .setDescription(
                                `Make sure you have a valid song at position **${favoriteLength}** in your playlist.`
                              )
                              .setColor(0xffea00)
                              .setThumbnail(
                                `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                              );
                            interaction.editReply({
                              embeds: [failedEmbed],
                            });
                          } else {
                            let song = result.tracks[0];
                            await queue.addTrack(song);

                            if (favoriteList.Song5) {
                              url = favoriteList.Song5;
                              favoriteLength = 5;
                              const result = await client.player.search(url, {
                                requestedBy: interaction.user,
                                searchEngine: QueryType.AUTO,
                              });
                              if (result.tracks.length === 0) {
                                failedEmbed
                                  .setTitle(`**No Result**`)
                                  .setDescription(
                                    `Make sure you have a valid song at position **${favoriteLength}** in your playlist.`
                                  )
                                  .setColor(0xffea00)
                                  .setThumbnail(
                                    `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                                  );
                                interaction.editReply({
                                  embeds: [failedEmbed],
                                });
                              } else {
                                let song = result.tracks[0];
                                await queue.addTrack(song);

                                if (favoriteList.Song6) {
                                  url = favoriteList.Song6;
                                  favoriteLength = 6;
                                  const result = await client.player.search(
                                    url,
                                    {
                                      requestedBy: interaction.user,
                                      searchEngine: QueryType.AUTO,
                                    }
                                  );
                                  if (result.tracks.length === 0) {
                                    failedEmbed
                                      .setTitle(`**No Result**`)
                                      .setDescription(
                                        `Make sure you have a valid song at position **${favoriteLength}** in your playlist.`
                                      )
                                      .setColor(0xffea00)
                                      .setThumbnail(
                                        `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                                      );
                                    interaction.editReply({
                                      embeds: [failedEmbed],
                                    });
                                  } else {
                                    let song = result.tracks[0];
                                    await queue.addTrack(song);

                                    if (favoriteList.Song7) {
                                      url = favoriteList.Song7;
                                      favoriteLength = 7;
                                      const result = await client.player.search(
                                        url,
                                        {
                                          requestedBy: interaction.user,
                                          searchEngine: QueryType.AUTO,
                                        }
                                      );
                                      if (result.tracks.length === 0) {
                                        failedEmbed
                                          .setTitle(`**No Result**`)
                                          .setDescription(
                                            `Make sure you have a valid song at position **${favoriteLength}** in your playlist.`
                                          )
                                          .setColor(0xffea00)
                                          .setThumbnail(
                                            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                                          );
                                        interaction.editReply({
                                          embeds: [failedEmbed],
                                        });
                                      } else {
                                        let song = result.tracks[0];
                                        await queue.addTrack(song);

                                        if (favoriteList.Song8) {
                                          url = favoriteList.Song8;
                                          favoriteLength = 8;
                                          const result =
                                            await client.player.search(url, {
                                              requestedBy: interaction.user,
                                              searchEngine: QueryType.AUTO,
                                            });
                                          if (result.tracks.length === 0) {
                                            failedEmbed
                                              .setTitle(`**No Result**`)
                                              .setDescription(
                                                `Make sure you have a valid song at position **${favoriteLength}** in your playlist.`
                                              )
                                              .setColor(0xffea00)
                                              .setThumbnail(
                                                `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                                              );
                                            interaction.editReply({
                                              embeds: [failedEmbed],
                                            });
                                          } else {
                                            let song = result.tracks[0];
                                            await queue.addTrack(song);

                                            if (favoriteList.Song9) {
                                              url = favoriteList.Song9;
                                              favoriteLength = 9;
                                              const result =
                                                await client.player.search(
                                                  url,
                                                  {
                                                    requestedBy:
                                                      interaction.user,
                                                    searchEngine:
                                                      QueryType.AUTO,
                                                  }
                                                );
                                              if (result.tracks.length === 0) {
                                                failedEmbed
                                                  .setTitle(`**No Result**`)
                                                  .setDescription(
                                                    `Make sure you have a valid song at position **${favoriteLength}** in your playlist.`
                                                  )
                                                  .setColor(0xffea00)
                                                  .setThumbnail(
                                                    `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                                                  );
                                                interaction.editReply({
                                                  embeds: [failedEmbed],
                                                });
                                              } else {
                                                let song = result.tracks[0];
                                                await queue.addTrack(song);

                                                if (favoriteList.Song10) {
                                                  url = favoriteList.Song10;
                                                  favoriteLength = 10;
                                                  const result =
                                                    await client.player.search(
                                                      url,
                                                      {
                                                        requestedBy:
                                                          interaction.user,
                                                        searchEngine:
                                                          QueryType.AUTO,
                                                      }
                                                    );
                                                  if (
                                                    result.tracks.length === 0
                                                  ) {
                                                    failedEmbed
                                                      .setTitle(`**No Result**`)
                                                      .setDescription(
                                                        `Make sure you have a valid song at position **${favoriteLength}** in your playlist.`
                                                      )
                                                      .setColor(0xffea00)
                                                      .setThumbnail(
                                                        `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                                                      );
                                                    interaction.editReply({
                                                      embeds: [failedEmbed],
                                                    });
                                                  } else {
                                                    let song = result.tracks[0];
                                                    await queue.addTrack(song);

                                                    embed.setDescription(
                                                      `${interaction.user}\n**${favoriteLength}** songs`
                                                    );
                                                    if (!queue.playing)
                                                      await queue.play();

                                                    await interaction.editReply(
                                                      {
                                                        embeds: [embed],
                                                      }
                                                    );
                                                    success = true;
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
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
    }
    if (success === false) {
      timer = 5;
    }
    if (timer > 10) timer = 10;
    if (timer < 1) timer = 1;
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) return;
        else {
          interaction.deleteReply().catch((e) => {
            console.log(`Failed to delete Favortie interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Favorite interaction.`);
        });
      }
    }, timer * 60 * 1000);
  },
};
