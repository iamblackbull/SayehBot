const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song"),
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    const queue = client.player.getQueue(interaction.guildId);

    let failedEmbed = new EmbedBuilder();
    let embed = new EmbedBuilder().setColor(0xc42525);
    let success = false;
    let timer;

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
      queue.connection.channel.id === interaction.member.voice.channel.id
    ) {
      queue.skip();
      const nextSong = queue.tracks.at(0) || null;
      const currentSong = queue.current;
      if (nextSong === null || !nextSong) {
        embed
          .setTitle("⏭ Previous")
          .setDescription(
            `**[${currentSong.title}](${currentSong.url})**\n**${currentSong.author}**`
          )
          .setThumbnail(currentSong.thumbnail);
        await interaction.editReply({
          embeds: [embed],
        });
        success = true;
        timer = 1;
      } else {
        timer = parseInt(nextSong.duration);
        const addButton = new ButtonBuilder()
          .setCustomId(`favorite`)
          .setEmoji(`🤍`)
          .setStyle(ButtonStyle.Danger);
        const removeButton = new ButtonBuilder()
          .setCustomId(`remove-favorite`)
          .setEmoji(`💔`)
          .setStyle(ButtonStyle.Secondary);
        const lyricsButton = new ButtonBuilder()
          .setCustomId(`lyrics`)
          .setEmoji(`🎤`)
          .setStyle(ButtonStyle.Primary);
        const downloadButton = new ButtonBuilder()
          .setCustomId(`downloader`)
          .setEmoji(`⬇`)
          .setStyle(ButtonStyle.Primary);

        embed
          .setTitle(`⏭ Next`)
          .setDescription(
            `**[${nextSong.title}](${nextSong.url})**\n**${nextSong.author}**\n${nextSong.duration}`
          )
          .setThumbnail(nextSong.thumbnail);
        if (nextSong.url.includes("youtube")) {
          embed.setColor(0xff0000).setFooter({
            iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
            text: `YouTube`,
          });
        } else if (nextSong.url.includes("spotify")) {
          embed.setColor(0x34eb58).setFooter({
            iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
            text: `Spotify`,
          });
        } else if (nextSong.url.includes("soundcloud")) {
          embed.setColor(0xeb5534).setFooter({
            iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
            text: `Soundcloud`,
          });
        }
        await interaction.editReply({
          embeds: [embed],
          components: [
            new ActionRowBuilder()
              .addComponents(addButton)
              .addComponents(removeButton)
              .addComponents(lyricsButton)
              .addComponents(downloadButton),
          ],
        });
        success = true;
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
    if (success === false) {
      timer = 5;
    }
    if (timer > 10) timer = 10;
    if (timer < 1) timer = 1;
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) {
          interaction.editReply({ components: [] });
        } else {
          interaction.deleteReply().catch((e) => {
            console.log(`Failed to delete Skip interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Skip interaction.`);
        });
      }
    }, timer * 60 * 1000);
  },
};
