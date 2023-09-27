const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require("discord.js");
const playerDB = require("../../schemas/player-schema");
const { useMainPlayer, QueryType } = require("discord-player");
require("dotenv").config();
const { musicChannelID } = process.env;

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const commandPattern = /^\/(p|pl|pla|play|playlist)\s+/i;
    const match = message.content.match(commandPattern);

    let prefix;
    if (!match && message.channel.id !== musicChannelID) return;
    if (!match && message.channel.id === musicChannelID) prefix = false;
    if (match) prefix = true;

    const firstMsg = message;

    let failedEmbed = new EmbedBuilder();
    let success = false;
    let type;
    let timer;
    let msg;

    if (
      !message.guild.members.me.permissions.has(PermissionsBitField.Flags.Speak)
    ) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(`Bot doesn't have the required permission!`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      msg = await message.reply({
        embeds: [failedEmbed],
      });
    } else if (!message.member.voice.channel) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `You need to be in a voice channel to use this command.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      msg = await message.reply({
        embeds: [failedEmbed],
      });
    } else {
      const player = useMainPlayer();

      const query = prefix
        ? message.content.slice(match[0].length).trim()
        : message.content;

      let noResult = false;
      let result;

      if (query.toLowerCase().startsWith("https")) {
        result = await player.search(query, {
          requestedBy: message.author,
          searchEngine: QueryType.AUTO,
        });
      } else {
        result = await player.search(query, {
          requestedBy: message.author,
          searchEngine: QueryType.YOUTUBE,
        });
      }

      if (!result.hasTracks()) {
        result = await player.search(query, {
          requestedBy: message.author,
          searchEngine: QueryType.AUTO,
        });

        if (!result.hasTracks()) {
          noResult = true;
        }
      }
      if (noResult) {
        failedEmbed
          .setTitle(`**No Result**`)
          .setDescription(`Make sure you input a valid query.`)
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );

        msg = await message.reply({
          embeds: [failedEmbed],
        });
      } else {
        if (
          query.toLowerCase().startsWith("https") &&
          query.toLowerCase().includes("playlist")
        )
          type = "playlist";
        else if (
          query.toLowerCase().startsWith("https") &&
          query.url.toLowerCase().includes("album")
        )
          type = "album";
        else type = "track";

        let queue = client.player.nodes.get(message.guild.id);

        if (!queue) {
          queue = await client.player.nodes.create(message.guild, {
            metadata: {
              guild: message.guild.id,
              channel: message.member.voice.channel,
              client: message.guild.members.me,
              requestedBy: message.author,
              track: result.tracks[0],
            },
            leaveOnEnd: true,
            leaveOnEmpty: true,
            leaveOnStop: true,
            leaveOnStopCooldown: 5 * 60 * 1000,
            leaveOnEndCooldown: 5 * 60 * 1000,
            leaveOnEmptyCooldown: 5 * 1000,
            smoothVolume: true,
            ytdlOptions: {
              filter: "audioonly",
              quality: "highestaudio",
              highWaterMark: 1 << 25,
            },
          });
        }

        if (!queue.connection) {
          await queue.connect(message.member.voice.channel);
        }

        const sameChannel =
          queue.connection.joinConfig.channelId ===
          message.member.voice.channel.id;

        if (!sameChannel) {
          failedEmbed
            .setTitle(`**Busy**`)
            .setDescription(`Bot is busy in another voice channel.`)
            .setColor(0x256fc4)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
            );
          msg = await message.reply({
            embeds: [failedEmbed],
          });
        } else {
          let embed = new EmbedBuilder();
          let nowPlaying = false;
          let public = false;

          const song = result.tracks[0];

          if (result.playlist) {
            const playlist = result.playlist;

            await queue.addTrack(result.tracks);

            let title = `🎶 Playlist`;
            if (playlist.url.toLowerCase().includes("album")) {
              title = `🎶 Album`;
            }

            embed
              .setTitle(title)
              .setDescription(
                `**[${playlist.title}](${playlist.url})**\n**${result.tracks.length} tracks**`
              )
              .setThumbnail(playlist.thumbnail);
          } else {
            await queue.addTrack(song);

            nowPlaying = queue.tracks.size === 1;

            if (nowPlaying) {
              embed.setTitle(`🎵 Now Playing`);

              await playerDB.updateOne(
                { guildId: message.guild.id },
                { isJustAdded: true }
              );
            } else {
              embed.setTitle(`🎵 Track #${queue.tracks.size}`);
            }

            embed
              .setDescription(
                `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
              )
              .setThumbnail(song.thumbnail);
          }

          if (!queue.node.isPlaying()) await queue.node.play();

          if (song.url.includes("youtube")) {
            public = true;

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
          } else if (song.url.includes("apple")) {
            embed.setColor(0xfb4f67).setFooter({
              iconURL: `https://music.apple.com/assets/knowledge-graph/music.png`,
              text: `Apple Music`,
            });
          }

          if (song.duration.length >= 7) {
            timer = 10 * 60;
          } else {
            const duration = song.duration;
            const convertor = duration.split(":");
            timer = +convertor[0] * 60 + +convertor[1];
          }

          const skipButton = new ButtonBuilder()
            .setCustomId(`skipper`)
            .setEmoji(`⏭`)
            .setDisabled(!nowPlaying)
            .setStyle(ButtonStyle.Secondary);
          const favoriteButton = new ButtonBuilder()
            .setCustomId(`favorite`)
            .setEmoji(`🤍`)
            .setDisabled(!nowPlaying)
            .setStyle(ButtonStyle.Danger);
          const lyricsButton = new ButtonBuilder()
            .setCustomId(`lyrics`)
            .setEmoji(`🎤`)
            .setDisabled(!nowPlaying)
            .setStyle(ButtonStyle.Primary);

          const button = new ActionRowBuilder()
            .addComponents(skipButton)
            .addComponents(favoriteButton)
            .addComponents(lyricsButton);

          await message.reply({
            embeds: [embed],
            components: [button],
          });
          success = true;
        }
      }
    }
    success ? timer : (timer = 2 * 60);
    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;

    const timeoutLog = success
      ? `Failed to delete Play message.`
      : `Failed to delete unsuccessfull Play message.`;
    setTimeout(async () => {
      if (success && message.channel.id === musicChannelID) {
        await msg.edit({ components: [] });
      } else if (msg.author.id === client.user.id) {
        try {
          await firstMsg.delete();
          await msg.delete();

          console.log("Deleted an unsuccessfull Play message.");
        } catch (e) {
          console.log(timeoutLog);
        }
      }
    }, timer * 1000);
  });
};
