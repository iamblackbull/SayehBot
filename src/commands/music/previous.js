const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { QueryType } = require("discord-player");
const { musicChannelID } = process.env;
const { mongoose } = require("mongoose");
const replay = require("../../schemas/replay-schema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("previous")
    .setDescription("Play previously played track"),
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let song;
    let success = false;
    let timer;
    let connection = false;
    let failedEmbed = new EmbedBuilder();

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
    } else if (
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
      if (queue.connection.channel.id === interaction.member.voice.channel.id) {
        connection = true;
      }
      if (connection === true) {
        let embed = new EmbedBuilder();

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

        let url;
        const { guild } = interaction;
        let replayList = await replay.findOne({
          guild: guild.id,
        });
        if (!replayList) {
          failedEmbed
            .setTitle(`**Unavailable**`)
            .setColor(0xffea00)
            .setDescription(`No audio found to replay.`)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
            );
          interaction.editReply({
            embeds: [failedEmbed],
          });
        } else {
          url = replayList.Song;
        }

        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        });
        if (result.tracks.length === 0) {
          failedEmbed
            .setTitle(`**No Result**`)
            .setColor(0xffea00)
            .setDescription(
              `Unable to replay audio. It might not be available anymore.`
            )
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
            );
          interaction.editReply({
            embeds: [failedEmbed],
          });
        } else {
          song = result.tracks[0];
          await queue.addTrack(song);
          embed
            .setTitle(`🎵 Track`)
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
          if (!queue.playing) await queue.play();
          success = true;
          if (song.duration.length >= 7) {
            timer = 10;
          } else {
            timer = parseInt(song.duration);
          }
          if (timer < 10) {
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
          } else {
            await interaction.editReply({
              embeds: [embed],
            });
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
            console.log(`Failed to delete Replay interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Replay interaction.`);
        });
      }
    }, timer * 60 * 1000);
  },
};
