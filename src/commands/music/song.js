const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const chalk = require("chalk");
const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;
let paused = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("song")
    .setDescription("Returns info about the current song playing")
    .setDMPermission(false),
  async execute(interaction, client) {
    const songEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let source;
    let failedEmbed = new EmbedBuilder();
    let success = false;
    let timer;
    let queue = client.player.nodes.get(interaction.guildId);

    if (!queue) {
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
      queue.connection.joinConfig.channelId ===
      interaction.member.voice.channel.id
    ) {
      let bar = queue.node.createProgressBar({
        timecodes: true,
        queue: false,
        length: 14,
      });

      let song = queue.currentTrack;

      let embed = new EmbedBuilder()
        .setTitle("**Currently Playing**")
        .setDescription(
          `**[${song.title}](${song.url})**\n**${song.author}**\n` + bar
        )
        .setColor(0x25bfc4);
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

      songEmbed.react(`▶`);
      songEmbed.react(`⏸`);
      songEmbed.react(`⏭`);
      const filter = (reaction, user) => {
        [`▶`, `⏸`, `⏭`].includes(reaction.emoji.name) &&
          user.id === interaction.user.id;
      };
      const collector = songEmbed.createReactionCollector(filter);
      collector.on("collect", async (reaction, user) => {
        if (user.bot) return;
        else {
          reaction.users.remove(reaction.users.cache.get(user.id));
          if (reaction.emoji.name === `▶`) {
            if (!queue) return;
            if (!queue.current) return;
            if (paused === false) return;
            queue.setPaused(false);
            paused = false;
            song = queue.currentTrack;
            bar = queue.node.createProgressBar({
              timecodes: true,
              queue: false,
              length: 14,
            });
            embed
              .setTitle("**Currently Playing**")
              .setDescription(
                `**[${song.title}](${song.url})**\n**${song.author}**\n` + bar
              );
            await interaction.editReply({
              embeds: [embed],
            });
            success = true;
          } else if (reaction.emoji.name === `⏸`) {
            if (!queue) return;
            if (!queue.current) return;
            if (paused === true) return;
            queue.setPaused(true);
            paused = true;
            song = queue.currentTrack;
            bar = queue.node.createProgressBar({
              timecodes: true,
              queue: false,
              length: 14,
            });
            embed
              .setTitle("**Currently Paused**")
              .setDescription(
                `**[${song.title}](${song.url})**\n**${song.author}**\n` + bar
              );
            await interaction.editReply({
              embeds: [embed],
            });
            success = true;
          } else if (reaction.emoji.name === `⏭`) {
            if (!queue) return;
            queue.node.skip();
            if (!queue.node.isPlaying()) await queue.node.play();
            song = queue.currentTrack;
            bar = queue.node.createProgressBar({
              timecodes: true,
              queue: false,
              length: 14,
            });
            embed.setDescription(
              `**[${song.title}](${song.url})**\n**${song.author}**\n` + bar
            );
            await interaction.editReply({
              embeds: [embed],
            });
            success = true;
          }
        }
      });

      if (song.url.includes("spotify")) source = "private";
      else source = "public";

      success = true;
      const { timestamp } = useTimeline(interaction.guildId);
      if (song.duration.length >= 7) {
        timer = 10 * 60;
      } else {
        const duration = song.duration;
        const convertor = duration.split(":");
        const totalTimer = +convertor[0] * 60 + +convertor[1];

        const currentDuration = timestamp.current.label;
        const currentConvertor = currentDuration.split(":");
        const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

        timer = totalTimer - currentTimer;
      }
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
    success ? timer : (timer = 2 * 60);
    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;
    const timeoutLog = success
      ? "Failed to delete Song interaction."
      : "Failed to delete unsuccessfull Song interaction.";
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) {
        interaction.editReply({ components: [] });
        songEmbed.reactions
          .removeAll()
          .catch((error) =>
            console.error(
              chalk.red("Failed to clear reactions from Song interaction."),
              error
            )
          );
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timer * 1000);
  },
};
