const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Returns the current queue")
    .addNumberOption((option) =>
      option
        .setName("page")
        .setDescription("Page number of the queue")
        .setMinValue(1)
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    const queueEmbed = await interaction.deferReply({
      fetchReply: true,
    });
    const queue = client.player.getQueue(interaction.guildId);

    let failedEmbed = new EmbedBuilder();
    let success = false;
    let timer;

    if (!queue || !queue.connection) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `Queue is empty. Add at least 1 song to the queue to use this command.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.editReply({
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
    } else if (
      queue.connection.channel.id === interaction.member.voice.channel.id
    ) {
      let totalPages = Math.ceil(queue.tracks.length / 10) || 1;
      let page = (interaction.options.getNumber("page") || 1) - 1;

      if (interaction.options.getNumber("page") > totalPages) {
        if (!interaction.options.getNumber("page")) return;
        else {
          page = totalPages - 1;
        }
      }
      let queueString = queue.tracks
        .slice(page * 10, page * 10 + 10)
        .map((song, i) => {
          return `**${page * 10 + i + 1}.** \`[${song.duration}]\` [${
            song.title
          } -- ${song.author}](${song.url})`;
        })
        .join("\n");

      let currentSong = queue.current;

      let embed = new EmbedBuilder().setColor(0x6d25c4);

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
        else {
          reaction.users.remove(reaction.users.cache.get(user.id));
          if (reaction.emoji.name === `➡`) {
            if (page < totalPages - 1) {
              page++;
              queueString = queue.tracks
                .slice(page * 10, page * 10 + 10)
                .map((song, i) => {
                  return `**${page * 10 + i + 1}.** \`[${song.duration}]\` [${
                    song.title
                  } -- ${song.author}](${song.url})`;
                })
                .join("\n");
              currentSong = queue.current;
              embed
                .setDescription(
                  `💿 **Currently Playing**\n` +
                    (currentSong
                      ? `**0.** \`[${currentSong.duration}]\` [${currentSong.title} -- ${currentSong.title}](${currentSong.url})`
                      : "None") +
                    `\n\n🔗 **Queue**\n${queueString}`
                )
                .setThumbnail(currentSong.setThumbnail)
                .setFooter({
                  text: `📄 Page ${page + 1} of ${totalPages}`,
                });
              await interaction.editReply({
                embeds: [embed],
              });
              success = true;
            }
          } else {
            if (reaction.emoji.name == `⬅`) {
              if (page !== 0) {
                --page;
                queueString = queue.tracks
                  .slice(page * 10, page * 10 + 10)
                  .map((song, i) => {
                    return `**${page * 10 + i + 1}.** \`[${song.duration}]\` [${
                      song.title
                    } -- ${song.author}](${song.url})`;
                  })
                  .join("\n");
                embed
                  .setDescription(
                    `💿 **Currently Playing**\n` +
                      (currentSong
                        ? `**0.** \`[${currentSong.duration}]\` [${currentSong.title} -- ${currentSong.author}](${currentSong.url})`
                        : "None") +
                      `\n\n🔗 **Queue**\n${queueString}`
                  )
                  .setThumbnail(currentSong.setThumbnail)
                  .setFooter({
                    text: `📄 Page ${page + 1} of ${totalPages}`,
                  });
                await interaction.editReply({
                  embeds: [embed],
                });
                success = true;
              }
            } else if (reaction.emoji.name == `🔀`) {
              if (!queue) return;
              if (!queue.current) return;
              queue.shuffle();
              queueString = queue.tracks
                .slice(page * 10, page * 10 + 10)
                .map((song, i) => {
                  return `**${page * 10 + i + 1}.** \`[${song.duration}]\` [${
                    song.title
                  } -- ${song.author}](${song.url})`;
                })
                .join("\n");
              currentSong = queue.current;
              embed
                .setDescription(
                  `💿 **Currently Playing**\n` +
                    (currentSong
                      ? `**0.** \`[${currentSong.duration}]\` [${currentSong.title} -- ${currentSong.author}](${currentSong.url})`
                      : "None") +
                    `\n\n🔗 **Queue**\n${queueString}`
                )
                .setThumbnail(currentSong.setThumbnail)
                .setFooter({
                  text: `📄 Page ${page + 1} of ${totalPages}`,
                });
              await interaction.editReply({
                embeds: [embed],
              });
              success = true;
            }
          }
        }
      });

      await interaction.editReply({
        embeds: [
          embed
            .setDescription(
              `💿 **Currently Playing**\n` +
                (currentSong
                  ? `**0.** \`[${currentSong.duration}]\` [${currentSong.title}](${currentSong.url})`
                  : "None") +
                `\n\n🔗 **Queue**\n${queueString}`
            )
            .setThumbnail(currentSong.setThumbnail)
            .setFooter({
              text: `📄 Page ${page + 1} of ${totalPages}`,
            }),
        ],
      });
      timer = parseInt(currentSong.duration);
      success = true;
    } else {
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
    }
    if (success === false) {
      timer = 5;
    }
    if (timer > 10) timer = 10;
    if (timer < 1) timer = 1;
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) {
          queueEmbed.reactions
            .removeAll()
            .catch((error) =>
              console.error(
                chalk.red("Failed to clear reactions from song message."),
                error
              )
            );
        } else {
          interaction.deleteReply().catch((e) => {
            console.log(`Failed to delete Queue interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Queue interaction.`);
        });
      }
    }, timer * 60 * 1000);
  },
};
