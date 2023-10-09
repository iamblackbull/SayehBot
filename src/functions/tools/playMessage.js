const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const playerDB = require("../../schemas/player-schema");
const { useMainPlayer, QueryType } = require("discord-player");
require("dotenv").config();
const { musicChannelID } = process.env;
const errorHandler = require("../handlers/handleErrors");
const queueCreator = require("../../utils/createQueue");
const footerSetter = require("../../utils/setFooter");
const buttonCreator = require("../../utils/createButtons");

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

    let success = false;
    let timer;
    let msg;

    if (
      !message.guild.members.me.permissions.has(PermissionsBitField.Flags.Speak)
    ) {
      msg = await errorHandler.handlePermissionErrorMessage(message);
    } else if (!message.member.voice.channel) {
      msg = await errorHandler.handleVoiceChannelErrorMessage(message);
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
        msg = await errorHandler.handleNoResultErrorMessage(message);
      } else {
        const queue =
          client.player.nodes.get(message.guild.id) ||
          queueCreator.createMessageQueue(message, result);

        if (!queue.connection) {
          await queue.connect(message.member.voice.channel);
        }

        const sameChannel =
          queue.connection.joinConfig.channelId ===
          message.member.voice.channel.id;

        if (!sameChannel) {
          msg = await errorHandler.handleBusyErrorMessage(message);
        } else {
          let embed = new EmbedBuilder();
          let nowPlaying = false;

          const song = result.tracks[0];

          try {
            if (result.playlist) {
              const playlist = result.playlist;

              await queue.addTrack(result.tracks);

              let queueSize = queue.tracks.size;

              if (!queue.node.isPlaying()) {
                queueSize = 0;
                await queue.node.play();
              }

              nowPlaying = queueSize === 0;

              let title = `🎶 Playlist`;
              if (playlist.url.toLowerCase().includes("album")) {
                title = `🎶 Album`;
              }

              embed
                .setTitle(title)
                .setDescription(
                  `[${playlist.title}](${playlist.url})\n**[${song.title}](${
                    song.url
                  })**\n** and ${result.tracks.length - 1} other tracks**`
                )
                .setThumbnail(playlist.thumbnail);
            } else {
              await queue.addTrack(song);

              let queueSize = queue.tracks.size;

              if (!queue.node.isPlaying()) {
                queueSize = 0;
                await queue.node.play();
              }

              nowPlaying = queueSize === 0;

              if (nowPlaying) {
                embed.setTitle(`🎵 Now Playing`);

                await playerDB.updateOne(
                  { guildId: message.guild.id },
                  { isJustAdded: true }
                );
              } else {
                embed.setTitle(`🎵 Track #${queueSize}`);

                await playerDB.updateOne(
                  { guildId: message.guild.id },
                  { isJustAdded: false }
                );
              }

              embed
                .setDescription(
                  `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
                )
                .setThumbnail(song.thumbnail);
            }

            footerSetter.setFooter(embed, song);

            if (song.duration.length >= 7) {
              timer = 10 * 60;
            } else {
              const duration = song.duration;
              const convertor = duration.split(":");
              timer = +convertor[0] * 60 + +convertor[1];
            }

            const button = buttonCreator.createButtons(nowPlaying);

            msg = await message.reply({
              embeds: [embed],
              components: [button],
            });
            success = true;
          } catch (error) {
            if (
              error.message.includes("Sign in to confirm your age.") ||
              error.message.includes("The following content may contain")
            ) {
              msg = await errorHandler.handleRestriceErrorMessage(message);
            } else if (
              error.message ===
                "Cannot read properties of null (reading 'createStream')" ||
              error.message.includes(
                "Failed to fetch resources for ytdl streaming"
              ) ||
              error.message.includes("Could not extract stream for this track")
            ) {
              msg = await errorHandler.handleThirdPartyErrorMessage(message);
            } else {
              msg = await errorHandler.handleUnknownErrorMessage(message);
            }
          }
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

          console.log("Deleted an Play message.");
        } catch (e) {
          console.log(timeoutLog);
        }
      }
    }, timer * 1000);
  });
};
