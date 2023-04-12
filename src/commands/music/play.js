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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play audios from YouTube / Spotify / Soundcloud")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("Input song name or url")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let song;
    let success = false;
    let timer;
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
        let embed = new EmbedBuilder();

        const addButton = new ButtonBuilder()
          .setCustomId(`favorite`)
          .setEmoji(`🤍`)
          .setStyle(ButtonStyle.Danger);
        const removeButton = new ButtonBuilder()
          .setCustomId(`remove-favorite`)
          .setEmoji(`💔`)
          .setStyle(ButtonStyle.Secondary);

        if (interaction.options.getString("song").startsWith("https")) {
          let url = interaction.options.getString("song");
          const result = await client.player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
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
            success = true;
            timer = parseInt(song.duration);
            if (!queue.playing) await queue.play();
            await interaction.editReply({
              embeds: [embed],
              components: [
                new ActionRowBuilder()
                  .addComponents(addButton)
                  .addComponents(removeButton),
              ],
            });
          }
        } else {
          let url = interaction.options.getString("song");
          const result = await client.player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
          });

          if (result.tracks.length === 0) {
            failedEmbed
              .setTitle(`**No results**`)
              .setDescription(`Make sure you input a valid song name.`)
              .setColor(0xffea00)
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
            success = true;
            timer = parseInt(song.duration);
            if (!queue.playing) await queue.play();
            await interaction.editReply({
              embeds: [embed],
              components: [
                new ActionRowBuilder()
                  .addComponents(addButton)
                  .addComponents(removeButton),
              ],
            });
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
