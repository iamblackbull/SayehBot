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
    ),
  async execute(interaction, client) {
    const searchEmbed = await interaction.deferReply({
      fetchReply: true,
    });
    let success = false;
    const { guild } = interaction;

    let queue = client.player.getQueue(interaction.guildId);
    if (!queue) {
      queue = await client.player.createQueue(interaction.guild, {
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

    let connection = false;
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
      if (queue.connection.channel.id === interaction.member.voice.channel.id) {
        connection = true;
      }
      if (connection === true) {
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
              else {
                reaction.users.remove(reaction.users.cache.get(user.id));
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
                await interaction.followUp({ embeds: [embed] });
                if (!queue.playing) await queue.play();
                success = true;
              }
            });
            await interaction.editReply({
              embeds: [embed],
            });
            success = true;
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
                return `**${i + 1}.** \`[${song.duration}]\` [${
                  song.title
                } -- ${song.author}](${song.url})`;
              })
              .join("\n");

            embed.setDescription(`${resultString}`);

            searchEmbed.react("1️⃣");
            searchEmbed.react("2️⃣");
            searchEmbed.react("3️⃣");
            searchEmbed.react("4️⃣");
            searchEmbed.react("5️⃣");
            const filter = (reaction, user) => {
              [`1️⃣`, `2️⃣`, `3️⃣`, `4️⃣`, `5️⃣`].includes(reaction.emoji.name) &&
                user.id === interaction.user.id;
            };
            const collector = searchEmbed.createReactionCollector(filter);
            collector.on("collect", async (reaction, user) => {
              if (user.bot) return;
              else {
                reaction.users.remove(reaction.users.cache.get(user.id));
                if (reaction.emoji.name === `1️⃣`) {
                  song = result.tracks[0];
                  queue.addTrack(song);
                }
                if (reaction.emoji.name === `2️⃣`) {
                  song = result.tracks[1];
                  queue.addTrack(song);
                }
                if (reaction.emoji.name === `3️⃣`) {
                  song = result.tracks[2];
                  queue.addTrack(song);
                }
                if (reaction.emoji.name === `4️⃣`) {
                  song = result.tracks[3];
                  queue.addTrack(song);
                }
                if (reaction.emoji.name === `5️⃣`) {
                  song = result.tracks[4];
                  queue.addTrack(song);
                }
                embed
                  .setTitle(`🎵 Track`)
                  .setDescription(
                    `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
                  )
                  .setThumbnail(song.thumbnail);
                await interaction.followUp({ embeds: [embed] });
                if (!queue.playing) await queue.play();
                success = true;
              }
            });
            await interaction.editReply({
              embeds: [embed],
            });
            success = true;
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
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) {
          searchEmbed.reactions
            .removeAll()
            .catch((error) =>
              console.error(
                chalk.red("Failed to clear reactions from song message."),
                error
              )
            );
        } else {
          interaction.deleteReply().catch((e) => {
            console.log(`Failed to delete Search interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Search interaction.`);
        });
      }
    }, 10 * 60 * 1000);
  },
};
