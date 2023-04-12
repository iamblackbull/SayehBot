const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const favorite = require("../../schemas/favorite-schema");
const { QueryType } = require("discord-player");
const { musicChannelID } = process.env;
let success = false;
let timer;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("favortie")
    .setDescription("Returns user favortie playlist")
    .addStringOption((option) => {
      return option
        .setName(`action`)
        .setDescription(`Choose action`)
        .setRequired(true)
        .addChoices(
          {
            name: `▶ Play`,
            value: `play`,
          },
          {
            name: `📄 Show list`,
            value: `list`,
          }
        );
    }),
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let connection = false;
    let failedEmbed = new EmbedBuilder();
    let embed = new EmbedBuilder()
      .setTitle(`🎶 Playlist`)
      .setColor(0x256fc4)
      .setFooter({
        iconURL: `https://www.linkpicture.com/q/2753995-201.png`,
        text: "Favorite",
      });

    let favoriteList = await favorite.findOne({
      User: interaction.user.id,
    });
    if (!favoriteList) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `You don't have a favorite playlist. Like at least 1 song to create your own playlist.`
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
        song1 = ``;
      }
      if (!favoriteList.Name2) {
        song2 = ``;
      }
      if (!favoriteList.Name3) {
        song3 = ``;
      }
      if (!favoriteList.Name4) {
        song4 = ``;
      }
      if (!favoriteList.Name5) {
        song5 = ``;
      }
      if (!favoriteList.Name6) {
        song6 = ``;
      }
      if (!favoriteList.Name7) {
        song7 = ``;
      }
      if (!favoriteList.Name8) {
        song8 = ``;
      }
      if (!favoriteList.Name9) {
        song9 = ``;
      }
      if (!favoriteList.Name10) {
        song10 = ``;
      }

      const favoriteString = `**1.** ${song1}\n**2.** ${song2}\n**3.** ${song3}\n**4.** ${song4}\n**5.** ${song5}\n**6.** ${song6}\n**7.** ${song7}\n**8.** ${song8}\n**9.** ${song9}\n**10.** ${song10}`;

      embed.setDescription(`${favoriteString}`);
      await interaction.editReply({
        embeds: [embed],
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
        ytdlOptions: {
          quality: "highestaudio",
          highWaterMark: 1 << 25,
        },
      });
      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel);
      }
      if (queue.connection.channel.id === interaction.member.voice.channel.id) {
        connection = true;
      }
      if (connection === true) {
        let favoriteLength;
        if (favoriteList.Song1) {
          let url = favoriteList.Song1;
          favoriteLength = 1;
          const result = await client.player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
          });
          if (result.tracks.length === 0) {
            failedEmbed
              .setTitle(`**No results**`)
              .setDescription(
                `Make sure you have valid song at position **${favoriteLength}** in your playlist.`
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
                  .setTitle(`**No results**`)
                  .setDescription(
                    `Make sure you have valid song at position **${favoriteLength}** in your playlist.`
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
                      .setTitle(`**No results**`)
                      .setDescription(
                        `Make sure you have valid song at position **${favoriteLength}** in your playlist.`
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
                          .setTitle(`**No results**`)
                          .setDescription(
                            `Make sure you have valid song at position **${favoriteLength}** in your playlist.`
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
                              .setTitle(`**No results**`)
                              .setDescription(
                                `Make sure you have valid song at position **${favoriteLength}** in your playlist.`
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
                              const result = await client.player.search(url, {
                                requestedBy: interaction.user,
                                searchEngine: QueryType.AUTO,
                              });
                              if (result.tracks.length === 0) {
                                failedEmbed
                                  .setTitle(`**No results**`)
                                  .setDescription(
                                    `Make sure you have valid song at position **${favoriteLength}** in your playlist.`
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
                                      .setTitle(`**No results**`)
                                      .setDescription(
                                        `Make sure you have valid song at position **${favoriteLength}** in your playlist.`
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
                                      const result = await client.player.search(
                                        url,
                                        {
                                          requestedBy: interaction.user,
                                          searchEngine: QueryType.AUTO,
                                        }
                                      );
                                      if (result.tracks.length === 0) {
                                        failedEmbed
                                          .setTitle(`**No results**`)
                                          .setDescription(
                                            `Make sure you have valid song at position **${favoriteLength}** in your playlist.`
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
                                            await client.player.search(url, {
                                              requestedBy: interaction.user,
                                              searchEngine: QueryType.AUTO,
                                            });
                                          if (result.tracks.length === 0) {
                                            failedEmbed
                                              .setTitle(`**No results**`)
                                              .setDescription(
                                                `Make sure you have valid song at position **${favoriteLength}** in your playlist.`
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
                                              if (result.tracks.length === 0) {
                                                failedEmbed
                                                  .setTitle(`**No results**`)
                                                  .setDescription(
                                                    `Make sure you have valid song at position **${favoriteLength}** in your playlist.`
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

                                                await interaction.editReply({
                                                  embeds: [embed],
                                                });
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
      } else {
        failedEmbed
          .setTitle(`**Bot is busy**`)
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
    if (success === false) {
      timer = 10;
    }
    if (timer > 10) timer = 10;
    if (timer < 1) timer = 1;
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) return;
        else {
          interaction.deleteReply().catch(console.error);
        }
      } else {
        interaction.deleteReply().catch(console.error);
      }
    }, timer * 60 * 1000);
  },
};
