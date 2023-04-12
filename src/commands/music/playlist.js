const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const { QueryType } = require("discord-player");
const { musicChannelID } = process.env;
let success = false;
let timer;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Play a playlist from YouTube / Spotify / Soundcloud")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Input playlist's url")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let connection = false;
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
        if (
          interaction.options.getString("url").toLowerCase().includes("youtube")
        ) {
          let url = interaction.options.getString("url");
          const result = await client.player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.YOUTUBE_PLAYLIST,
          });

          if (result.tracks.length === 0) {
            failedEmbed
              .setTitle(`**No results**`)
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
            embed
              .setColor(0xff0000)
              .setDescription(
                `**[${playlist.title}](${playlist.url})**\n**${result.tracks.length} songs**`
              )
              .setFooter({
                iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
                text: `YouTube`,
              });
            if (!queue.playing) await queue.play();
            await interaction.editReply({
              embeds: [embed],
            });
            success = true;
            timer = parseInt(result.tracks[0].duration);
          }
        } else if (
          interaction.options.getString("url").toLowerCase().includes("spotify")
        ) {
          /*let url = interaction.options.getString("url");
            const result = await client.player.search(url, {
              requestedBy: interaction.user,
              searchEngine: QueryType.SPOTIFY_PLAYLIST,
            });
            if (result.tracks.length === 0) {
              failedEmbed
                .setTitle(`**No results**`)
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
              embed
                .setColor(0x34eb58)
                .setDescription(
                  `**[${playlist.title}](${playlist.url})**\n**${result.tracks.length} songs**`
                )
                .setThumbnail(playlist.thumbnail)
                .setFooter({
                  iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
                  text: `Spotify`,
                });
              if (!queue.playing) await queue.play();
              await interaction.editReply({
                embeds: [embed],
              });
              success = true;
              timer = parseInt(result.tracks[0].duration);
            }*/
          failedEmbed
            .setTitle(`**Unavailable**`)
            .setDescription(`Spotify playlists are currently unavailable.`)
            .setColor(0xffea00)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
            );
          interaction.editReply({
            embeds: [failedEmbed],
          });
        } else if (
          interaction.options
            .getString("url")
            .toLowerCase()
            .includes("soundcloud")
        ) {
          let url = interaction.options.getString("url");
          const result = await client.player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.SOUNDCLOUD_PLAYLIST,
          });

          if (result.tracks.length === 0) {
            failedEmbed
              .setTitle(`**No results**`)
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
            embed
              .setColor(0xeb5534)
              .setDescription(
                `**[${playlist.title}](${playlist.url})**\n**${result.tracks.length} songs**`
              )
              .setFooter({
                iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
                text: `Soundcloud`,
              });
            if (!queue.playing) await queue.play();
            await interaction.editReply({
              embeds: [embed],
            });
            success = true;
            timer = parseInt(result.tracks[0].duration);
          }
        }
      } else {
        failedEmbed
          .setTitle(`**Bot is busy**`)
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
      timer = 10;
    }
    if (timer > 10) timer = 10;
    if (timer < 1) timer = 1;
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) {
          interaction.editReply({ components: [] });
        } else {
          interaction.deleteReply().catch(console.error);
        }
      } else {
        interaction.deleteReply().catch(console.error);
      }
    }, timer * 60 * 1000);
  },
};
