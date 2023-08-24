const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { musicChannelID } = process.env;

module.exports = {
  isNew: true,
  isBeta: true,
  data: new SlashCommandBuilder()
    .setName("previous")
    .setDescription("Play previously played track in the current queue."),
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let source;
    let song;
    let success = false;
    let timer;
    let failedEmbed = new EmbedBuilder();

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
      let queue = client.player.nodes.get(interaction.guildId);
      if (!queue || !queue.history) {
        failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(`There is no queue or queue history is not available.`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
      }
      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel);
      }
      const connection =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;
      if (connection) {
        let embed = new EmbedBuilder();

        const addButton = new ButtonBuilder()
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

        await queue.history.back();
        song = queue.currentTrack;
        embed
          .setTitle(`🎵 Previous`)
          .setDescription(
            `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
          )
          .setThumbnail(song.thumbnail);
        if (song.url.includes("youtube")) {
          source = "public";
          embed.setColor(0xff0000).setFooter({
            iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
            text: `YouTube`,
          });
        } else if (song.url.includes("spotify")) {
          source = "private";
          embed.setColor(0x34eb58).setFooter({
            iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
            text: `Spotify`,
          });
        } else if (song.url.includes("soundcloud")) {
          source = "public";
          embed.setColor(0xeb5534).setFooter({
            iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
            text: `Soundcloud`,
          });
        } else if (song.url.includes("apple")) {
          source = "private";
          embed.setColor(0xfb4f67).setFooter({
            iconURL: `https://music.apple.com/assets/knowledge-graph/music.png`,
            text: `Apple Music`,
          });
        }
        if (!queue.node.isPlaying()) await queue.node.play();
        success = true;
        if (song.duration.length >= 7) {
          timer = 10 * 60;
        } else {
          const duration = song.duration;
          const convertor = duration.split(":");
          timer = +convertor[0] * 60 + +convertor[1];
        }
        if (timer < 10 * 60) {
          if (source === "public") {
            await interaction.editReply({
              embeds: [embed],
              components: [
                new ActionRowBuilder()
                  .addComponents(addButton)
                  .addComponents(lyricsButton)
                  .addComponents(downloadButton),
              ],
            });
          } else {
            await interaction.editReply({
              embeds: [embed],
              components: [
                new ActionRowBuilder()
                  .addComponents(addButton)
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
        interaction.editReply({
          embeds: [failedEmbed],
        });
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
