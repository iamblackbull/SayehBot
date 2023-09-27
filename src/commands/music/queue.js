const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("See a list of the current queue.")
    .addNumberOption((option) =>
      option
        .setName("page")
        .setDescription(
          "Input a page number to see a specific page from the queue."
        )
        .setMinValue(1)
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    let failedEmbed = new EmbedBuilder();
    let success = false;
    let timer;

    if (!queue || !queue.connection) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `Bot is already not playing in any voice channel.\nUse </play:1047903145071759425> to play a track.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.reply({
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
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        failedEmbed
          .setTitle(`**Busy**`)
          .setDescription(`Bot is busy in another voice channel.`)
          .setColor(0x256fc4)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
          );
        await interaction.reply({
          embeds: [failedEmbed],
        });
      } else {
        const queueEmbed = await interaction.deferReply({
          fetchReply: true,
        });

        let embed = new EmbedBuilder().setTitle("🔗 Queue").setColor(0x6d25c4);
        let currentSong = queue.currentTrack;

        let bar = queue.node.createProgressBar({
          timecodes: true,
          queue: false,
          length: 14,
        });

        let totalPages = Math.ceil(queue.tracks.data.length / 10) || 1;
        let page = (interaction.options.getNumber("page") || 1) - 1;
        if (interaction.options.getNumber("page") > totalPages) {
          if (!interaction.options.getNumber("page")) return;
          else {
            page = totalPages - 1;
          }
        }

        let queueString = queue.tracks.data
          .slice(page * 10, page * 10 + 10)
          .map((song, i) => {
            return `**${page * 10 + i + 1}.** \`[${song.duration}]\` [${
              song.title
            } -- ${song.author}](${song.url})`;
          })
          .join("\n");

        let queueStringLength = queue.tracks.size;

        embed
          .setDescription(
            `### 🎵 Now Playing\n` +
              (currentSong
                ? `**[${currentSong.title}](${currentSong.url})**\n**${currentSong.author}**`
                : "None") +
              `\n\n` +
              bar +
              `\n\n### ⏭ Upcoming Tracks\n` +
              (queueStringLength > 1 ? `${queueString}` : "None")
          )
          .setFooter({
            text: `📄 Page ${page + 1} of ${totalPages} (${
              queue.tracks.size
            } Songs)`,
          });

        await interaction.editReply({
          embeds: [embed],
        });
        success = true;

        if (totalPages > 1) {
          queueEmbed.react(`⬅`);
          queueEmbed.react(`➡`);
          queueEmbed.react(`🔀`);
          const filter = (reaction, user) => {
            [`⬅`, `➡`, `🔀`].includes(reaction.emoji.name) &&
              user.id === interaction.user.id;
          };
          const collector = queueEmbed.createReactionCollector(filter);
          collector.on("collect", async (reaction, user) => {
            if (user.bot) return;
            reaction.users.remove(reaction.users.cache.get(user.id));

            if (reaction.emoji.name === `➡`) {
              if (page < totalPages - 1) {
                page++;

                queueString = queue.tracks.data
                  .slice(page * 10, page * 10 + 10)
                  .map((song, i) => {
                    return `**${page * 10 + i + 1}.** \`[${song.duration}]\` [${
                      song.title
                    } -- ${song.author}](${song.url})`;
                  })
                  .join("\n");

                queueStringLength = queue.tracks.size;

                currentSong = queue.currentTrack;
                bar = queue.node.createProgressBar({
                  timecodes: true,
                  queue: false,
                  length: 14,
                });

                embed
                  .setDescription(
                    `### 🎵 Now Playing\n` +
                      (currentSong
                        ? `**[${currentSong.title}](${currentSong.url})**\n**${currentSong.author}**`
                        : "None") +
                      `\n\n` +
                      bar +
                      `\n\n###⏭ Upcoming Tracks\n` +
                      (queueStringLength > 1 ? `${queueString}` : "None")
                  )
                  .setFooter({
                    text: `📄 Page ${page + 1} of ${totalPages} (${
                      queue.tracks.size
                    } Songs)`,
                  });

                await interaction.editReply({
                  embeds: [embed],
                });
                success = true;
              }
            } else if (reaction.emoji.name == `⬅`) {
              if (page !== 0) {
                --page;

                queueString = queue.tracks.data
                  .slice(page * 10, page * 10 + 10)
                  .map((song, i) => {
                    return `**${page * 10 + i + 1}.** \`[${song.duration}]\` [${
                      song.title
                    } -- ${song.author}](${song.url})`;
                  })
                  .join("\n");

                queueStringLength = queue.tracks.size;

                currentSong = queue.currentTrack;
                bar = queue.node.createProgressBar({
                  timecodes: true,
                  queue: false,
                  length: 14,
                });

                embed
                  .setDescription(
                    `### 🎵 Now Playing\n` +
                      (currentSong
                        ? `**[${currentSong.title}](${currentSong.url})**\n**${currentSong.author}**`
                        : "None") +
                      `\n\n` +
                      bar +
                      `\n\n### ⏭ Upcoming Tracks\n` +
                      (queueStringLength > 1 ? `${queueString}` : "None")
                  )
                  .setFooter({
                    text: `📄 Page ${page + 1} of ${totalPages} (${
                      queue.tracks.size
                    } Songs)`,
                  });

                await interaction.editReply({
                  embeds: [embed],
                });
                success = true;
              }
            } else if (reaction.emoji.name == `🔀`) {
              if (!queue) return;
              queue.tracks.shuffle();

              queueString = queue.tracks.data
                .slice(page * 10, page * 10 + 10)
                .map((song, i) => {
                  return `**${page * 10 + i + 1}.** \`[${song.duration}]\` [${
                    song.title
                  } -- ${song.author}](${song.url})`;
                })
                .join("\n");

              queueStringLength = queue.tracks.size;

              currentSong = queue.currentTrack;
              bar = queue.node.createProgressBar({
                timecodes: true,
                queue: false,
                length: 14,
              });

              embed
                .setDescription(
                  `### 🎵 Now Playing\n` +
                    (currentSong
                      ? `**[${currentSong.title}](${currentSong.url})**\n**${currentSong.author}**`
                      : "None") +
                    `\n\n` +
                    bar +
                    `\n\n### ⏭ Upcoming Tracks\n` +
                    (queueStringLength > 1 ? `${queueString}` : "None")
                )
                .setFooter({
                  text: `📄 Page ${page + 1} of ${totalPages} (${
                    queue.tracks.size
                  } Songs)`,
                });

              await interaction.editReply({
                embeds: [embed],
              });
              success = true;
            }
          });
        }

        const { timestamp } = useTimeline(interaction.guildId);
        if (currentSong.duration.length >= 7) {
          timer = 10 * 60;
        } else {
          const duration = currentSong.duration;
          const convertor = duration.split(":");
          const totalTimer = +convertor[0] * 60 + +convertor[1];

          const currentDuration = timestamp.current.label;
          const currentConvertor = currentDuration.split(":");
          const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

          timer = totalTimer - currentTimer;
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
        queueEmbed.reactions.removeAll().catch((e) => {
          return;
        });
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timer * 1000);
  },
};
