const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("insert")
    .setDescription("Insert an audio in a certain position in the queue")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("Input song name or url")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("tracknumber")
        .setDescription("Track # to insert")
        .setMinValue(1)
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction, client) {
    const queue = client.player.getQueue(interaction.guildId);
    let trackNum = interaction.options.getInteger("tracknumber");

    let timer;
    let success = false;
    let failedEmbed = new EmbedBuilder();
    let embed = new EmbedBuilder();

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
    } else if (
      queue.connection.channel.id === interaction.member.voice.channel.id
    ) {
      if (trackNum > queue.tracks.length) {
        trackNum = queue.tracks.length + 1;
      }

      let url = interaction.options.getString("song");
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });
      if (result.tracks.length === 0) {
        if (url.toLowerCase().startsWith("https")) {
          failedEmbed.setDescription(`Make sure you input a valid link.`);
        } else {
          failedEmbed.setDescription(`Make sure you input a valid song name.`);
        }
        failedEmbed
          .setTitle(`**No Result**`)
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );
        interaction.editReply({
          embeds: [failedEmbed],
        });
      } else {
        const song = result.tracks[0];
        await queue.addTrack(song);
        embed
          .setTitle(`🎵 Insert at track #${trackNum}`)
          .setDescription(
            `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
          )
          .setThumbnail(song.thumbnail);
        if (song.url.includes("youtube")) {
          embed.setColor(0xff0000).setFooter({
            iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
            text: `YouTube`,
          });
        } else if (song.url.includes("spotify")) {
          embed.setColor(0x34eb58).setFooter({
            iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
            text: `Spotify`,
          });
        } else if (song.url.includes("soundcloud")) {
          embed.setColor(0xeb5534).setFooter({
            iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
            text: `Soundcloud`,
          });
        }
        queue.insert(song, trackNum - 1);
        if (!queue.playing) await queue.play();
        success = true;
        if (song.duration.length >= 7) {
          timer = 10;
        } else {
          timer = parseInt(song.duration);
        }
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
      await interaction.reply({
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
            console.log(`Failed to delete Insert interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Insert interaction.`);
        });
      }
    }, timer * 60 * 1000);
  },
};
