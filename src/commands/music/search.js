const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const { QueryType } = require("discord-player");
const { musicChannelID } = process.env;
const replay = require("../../schemas/replay-schema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search in YouTube")
    .addStringOption((option) =>
      option
        .setName("keyword")
        .setDescription("Input anything to search")
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction, client) {
    const searchEmbed = await interaction.deferReply({
      fetchReply: true,
    });
    let success = false;
    const { guild } = interaction;

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
        leaveOnEmptyCooldown: 5 * 60 * 1000,
        smoothVolume: true,
        ytdlOptions: {
          quality: "highestaudio",
          highWaterMark: 1 << 25,
        },
      });
    }

    let timer;
    let song;
    let failedEmbed = new EmbedBuilder();
    let embed = new EmbedBuilder()
      .setTitle(`🔎 Result`)
      .setColor(0xff0000)
      .setFooter({
        iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
        text: `YouTube`,
      });

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
      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel);
      }
      if (interaction.options.getString("keyword").startsWith("https")) {
        let url = interaction.options.getString("keyword");
        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.YOUTUBE_SEARCH,
        });
        if (result.tracks.length === 0) {
          failedEmbed
            .setTitle(`**No Result**`)
            .setDescription(`Make sure you input a valid link.`)
            .setColor(0xffea00)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
            );
          interaction.editReply({
            embeds: [failedEmbed],
          });
        } else {
          song = result.tracks[0];
          embed
            .setDescription(
              `\`[${song.duration}]\` [${song.title} -- ${song.author}](${song.url})\n\n`
            )
            .setThumbnail(song.thumbnail);
          searchEmbed.react("▶");
          const filter = (reaction, user) => {
            [`▶`].includes(reaction.emoji.name) &&
              user.id === interaction.user.id;
          };
          const collector = searchEmbed.createReactionCollector(filter);
          collector.on("collect", async (reaction, user) => {
            if (user.bot) return;
            if (!interaction.member.voice.channel) return;
            if (
              queue.connection.joinConfig.channelId ===
              interaction.member.voice.channel.id
            )
              return;
            searchEmbed.reactions
              .removeAll()
              .catch((error) =>
                console.error(
                  chalk.red(
                    "Failed to clear reactions from Search interaction."
                  ),
                  error
                )
              );
            let song;
            if (reaction.emoji.name === `▶`) {
              song = result.tracks[0];
              queue.addTrack(song);
            }
            embed
              .setTitle(`🎵 Track`)
              .setDescription(
                `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
              )
              .setThumbnail(song.thumbnail);
            if (!queue.node.isPlaying()) await queue.node.play();
            success = true;
            if (song.duration.length >= 7) {
              timer = 10 * 60;
            } else {
              const duration = song.duration;
              const convertor = duration.split(":");
              timer = +convertor[0] * 60 + +convertor[1];
            }
            await interaction.followUp({ embeds: [embed] }).then((message) => {
              const timeoutLog = success
                ? "Failed to delete Search interaction follow-up message."
                : "Failed to delete unsuccessfull Search interaction follow-up message.";
              setTimeout(() => {
                if (
                  success === true &&
                  interaction.channel.id === musicChannelID
                )
                  return;
                else {
                  message.delete().catch((e) => {
                    console.log(timeoutLog);
                  });
                }
              }, timer * 1000);
            });
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
          });
          await interaction.editReply({
            embeds: [embed],
          });
          success = true;
        }
      } else {
        let url = interaction.options.getString("keyword");
        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.YOUTUBE_SEARCH,
        });

        if (result.tracks.length === 0) {
          failedEmbed
            .setTitle(`**No Result**`)
            .setDescription(`Make sure you input a valid link.`)
            .setColor(0xffea00)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
            );
          interaction.editReply({
            embeds: [failedEmbed],
          });
        } else {
          const resultString = result.tracks
            .slice(0, 5)
            .map((song, i) => {
              return `**${i + 1}.** \`[${song.duration}]\` [${song.title} -- ${
                song.author
              }](${song.url})`;
            })
            .join("\n");

          embed.setDescription(`${resultString}`);

          const emojis = [`1️⃣`, `2️⃣`, `3️⃣`, `4️⃣`, `5️⃣`];
          emojis.forEach((emoji) => {
            searchEmbed.react(emoji);
          });
          const filter = (reaction, user) => {
            emojis.includes(reaction.emoji.name) &&
              user.id === interaction.user.id;
          };
          const collector = searchEmbed.createReactionCollector(filter);
          collector.on("collect", async (reaction, user) => {
            if (user.bot) return;
            if (!interaction.member.voice.channel) return;
            if (
              queue.connection.joinConfig.channelId !==
              interaction.member.voice.channel.id
            )
              return;
            reaction.users.remove(reaction.users.cache.get(user.id));
            switch (reaction.emoji.name) {
              case `1️⃣`:
                song = result.tracks[0];
                break;
              case `2️⃣`:
                song = result.tracks[1];
                break;
              case `3️⃣`:
                song = result.tracks[2];
                break;
              case `4️⃣`:
                song = result.tracks[3];
                break;
              case `5️⃣`:
                song = result.tracks[4];
                break;
            }
            queue.addTrack(song);
            embed
              .setTitle(`🎵 Track`)
              .setDescription(
                `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
              )
              .setThumbnail(song.thumbnail);
            if (!queue.node.isPlaying()) await queue.node.play();
            success = true;
            if (song.duration.length >= 7) {
              timer = 10 * 60;
            } else {
              const duration = song.duration;
              const convertor = duration.split(":");
              timer = +convertor[0] * 60 + +convertor[1];
            }
            await interaction.followUp({ embeds: [embed] }).then((message) => {
              const timeoutLog = success
                ? "Failed to delete Search interaction follow-up message."
                : "Failed to delete unsuccessfull Search interaction follow-up message.";
              setTimeout(() => {
                if (
                  success === true &&
                  interaction.channel.id === musicChannelID
                )
                  return;
                else {
                  message.delete().catch((e) => {
                    console.log(timeoutLog);
                  });
                }
              }, timer * 1000);
            });
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
          });
          await interaction.editReply({
            embeds: [embed],
          });
          success = true;
        }
      }
    }
    const timeoutDuration = success ? 10 * 60 * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
      ? "Failed to delete Search interaction."
      : "Failed to delete unsuccessfull Search interaction.";
    setTimeout(() => {
      if (success === true && interaction.channel.id === musicChannelID) {
        searchEmbed.reactions
          .removeAll()
          .catch((error) =>
            console.error(
              chalk.red("Failed to clear reactions from Search interaction."),
              error
            )
          );
      } else {
        message.delete().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timeoutDuration);
  },
};
