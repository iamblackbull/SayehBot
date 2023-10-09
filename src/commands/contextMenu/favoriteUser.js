const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
} = require("discord.js");
const favorite = require("../../schemas/favorite-schema");
const { mongoose } = require("mongoose");
const { useMainPlayer, useMetadata, QueryType } = require("discord-player");
const { musicChannelID } = process.env;
const errorHandler = require("../../functions/handlers/handleErrors");
const queueCreator = require("../../functions/utils/createQueue");
const buttonCreator = require("../../functions/utils/createButtons");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("play favorite")
    .setType(ApplicationCommandType.User)
    .setDMPermission(false),

  async execute(interaction, client) {
    let success = false;
    let timer;

    const interactor = interaction.user;
    const owner = interaction.targetUser;

    let favoriteList = await favorite.findOne({
      User: owner.id,
    });

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (!favoriteList || favoriteList.Playlist.length === 0) {
      errorHandler.handleEmptyPlaylistError(interaction, owner);
    } else if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      const queue =
        client.player.nodes.get(interaction.guildId) ||
        queueCreator.createFavoriteQueue(interaction);

      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel);
      }

      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
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

          mappedResultString[i] = `**${i + 1}.** [${
            result.tracks[0].title
          } -- ${result.tracks[0].author}](${result.tracks[0].url})`;
          mappedArray.push(mappedResultString[i]);

          if (i === 0) {
            song = result.tracks[0];
            setMetadata(song);
          }

          await queue.addTrack(result.tracks[0]);

          if (!queue.node.isPlaying()) await queue.node.play();
        }

        if (mappedArray.length === 0) {
          errorHandler.handleNoResultError(interaction);
        } else {
          if (song.duration.length >= 7) {
            timer = 10 * 60;
          } else {
            const duration = song.duration;
            const convertor = duration.split(":");
            timer = +convertor[0] * 60 + +convertor[1];
          }

          let nowPlaying = false;

          let queueSize = queue.tracks.size;

          if (!queue.node.isPlaying()) {
            queueSize = 0;
            await queue.node.play();
          }

          nowPlaying = queueSize === 0;

          const embed = new EmbedBuilder()
            .setTitle(`🎶 ${owner.username}'s Playlist`)
            .setColor(0x256fc4)
            .setThumbnail(song.thumbnail)
            .setDescription(
              `**[${song.title}](${song.url})**\n**And ${
                mappedArray.length - 1
              } other tracks**`
            )
            .setFooter({
              iconURL: `https://sendabuddy.com/cdn/shop/files/newlogo_8_2048x2048.png?v=1661517305`,
              text: "Favorite",
            });

            const button = buttonCreator.createButtons(nowPlaying);

          await interaction.editReply({
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
