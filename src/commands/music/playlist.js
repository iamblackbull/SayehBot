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
    .setName("playlist")
    .setDescription("Play a playlist from YouTube / Spotify / Soundcloud")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Input playlist's url")
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let connection = false;
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
        let embed = new EmbedBuilder()
          .setTitle(`🎶 Playlist`)
          .setColor(0x256fc4);

        const url = interaction.options.getString("url");
        let result;

        if (url.toLowerCase().startsWith("https")) {
          if (url.toLowerCase().includes("spotify")) {
            result = await client.player.search(url, {
              requestedBy: interaction.user,
              searchEngine: QueryType.SPOTIFY_PLAYLIST,
            });
            embed.setColor(0x34eb58).setFooter({
              iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
              text: `Spotify`,
            });
          }
          if (url.toLowerCase().includes("soundcloud")) {
            result = await client.player.search(url, {
              requestedBy: interaction.user,
              searchEngine: QueryType.SOUNDCLOUD_PLAYLIST,
            });
            embed.setColor(0xeb5534).setFooter({
              iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
              text: `Soundcloud`,
            });
          } else {
            result = await client.player.search(url, {
              requestedBy: interaction.user,
              searchEngine: QueryType.YOUTUBE_PLAYLIST,
            });
            embed.setColor(0xff0000).setFooter({
              iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
              text: `YouTube`,
            });
          }
        }
        if (!url.toLowerCase().startsWith("https")) {
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
        }
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
          const playlist = result.playlist;
          await queue.addTracks(result.tracks);
          embed.setDescription(
            `**[${playlist.title}](${playlist.url})**\n**${result.tracks.length} songs**`
          );
          if (!queue.playing) await queue.play();
          await interaction.editReply({
            embeds: [embed],
          });
          success = true;
          timer = parseInt(result.tracks[0].duration);
          let song = result.tracks[result.tracks.length - 1];
          const { guild } = interaction;
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
            console.log(`Failed to delete Playlist interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Playlist interaction.`);
        });
      }
    }, timer * 60 * 1000);
  },
};
