const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
} = require("discord.js");
const favorite = require("../../schemas/favorite-schema");
const { mongoose } = require("mongoose");
const { useMainPlayer, useMetadata, QueryType } = require("discord-player");
const { musicChannelID } = process.env;

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("play their favorite")
    .setType(ApplicationCommandType.User),

  async execute(interaction, client) {
    let failedEmbed = new EmbedBuilder();
    let success = false;
    let timer;

    const user = interaction.user;
    const target = interaction.targetUser;

    let favoriteList = await favorite.findOne({
      User: target.id,
    });

    if (mongoose.connection.readyState !== 1) {
      failedEmbed
        .setTitle(`**Connection Timed out!**`)
        .setDescription(`Connection to database has been timed out.`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://cdn.iconscout.com/icon/premium/png-256-thumb/error-in-internet-959268.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else if (!favoriteList || favoriteList.Playlist.length === 0) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `**${target}** doesn't have a favorite playlist. Like at least **1** track to create your own playlist.\nTry again with </favorite:1108681222764367962>.`
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
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      let queue = client.player.nodes.get(interaction.guildId);

      if (!queue) {
        queue = await client.player.nodes.create(interaction.guild, {
          metadata: {
            channel: interaction.member.voice.channel,
            client: interaction.guild.members.me,
            requestedBy: user,
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
        await queue.connect(interaction.member.voice.channel);
      }

      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
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
      } else {
        const playlist = favoriteList.Playlist.map((song) => song.Url).join(
          "\n"
        );
        const splitPlaylist = playlist.split("\n");
        const playlistLength = splitPlaylist.length;

        const player = useMainPlayer();
        const [setMetadata] = useMetadata(interaction.guild.id);

        let result;
        let mappedResultString = {};
        let mappedArray = [];
        let song;

        for (let i = 0; i < playlistLength; ++i) {
          result = await player.search(splitPlaylist[i], {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
          });

          while (i === 0) {
            song = result.tracks[0];
            setMetadata(song);
          }

          mappedResultString[i] = `**${i + 1}.** [${
            result.tracks[0].title
          } -- ${result.tracks[0].author}](${result.tracks[0].url})`;
          mappedArray.push(mappedResultString[i]);

          await queue.addTrack(result.tracks[0]);

          if (!queue.node.isPlaying()) await queue.node.play();
        }

        if (mappedArray.length === 0) {
          failedEmbed
            .setTitle(`**No Result**`)
            .setDescription(
              `Make sure you have a valid track url in your playlist.\nTry again with </favorite:1108681222764367962>.`
            )
            .setColor(0xffea00)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
            );
          await interaction.editReply({
            embeds: [failedEmbed],
          });
        } else {
          if (song.duration.length >= 7) {
            timer = 10 * 60;
          } else {
            const duration = song.duration;
            const convertor = duration.split(":");
            timer = +convertor[0] * 60 + +convertor[1];

            const embed = new EmbedBuilder()
              .setTitle(`🎶 ${target}'s Playlist`)
              .setColor(0x256fc4)
              .setThumbnail(song.thumbnail)
              .setDescription(
                `**[${song.title}](${song.url})**\n**And ${
                  mappedArray.length - 1
                } other tracks**`
              )
              .setFooter({
                iconURL: `https://www.linkpicture.com/q/2753995-201.png`,
                text: "Favorite",
              });

            await interaction.editReply({
              embeds: [embed],
            });
            success = true;
          }
        }
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
