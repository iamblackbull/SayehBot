const { ComponentType } = require("discord.js");
const { mongoose } = require("mongoose");
const favoriteModel = require("../../database/favoriteModel");
const embedCreator = require("./createMusicEmbed");
const { titles, favoriteSizes } = require("./musicUtils");
const { createFavoriteQueue } = require("./createQueue");
const { handleData } = require("./handlePlayerData");
const { createButtons } = require("../main/createButtons");
const { handleInteractionDeletion } = require("../main/handleDeletion");
const { consoleTags } = require("../main/mainUtils");

async function updateFavoriteList(user, song) {
  let favoriteMode;

  let favoriteList = await favoriteModel.findOne({
    User: user.id,
  });

  if (!favoriteList) {
    favoriteList = new favoriteModel({
      User: user.id,
      Playlist: [
        {
          Url: song.url,
          Name: song.title,
          Author: song.author,
        },
      ],
    });

    await favoriteList.save().catch(console.error);

    favoriteMode = "add";
  } else {
    const favoriteSongs = favoriteList.Playlist;

    const songIndex = favoriteSongs.findIndex(
      (favSong) => favSong.Url === song.url
    );

    if (songIndex === -1) {
      if (favoriteList.Playlist.length > favoriteSizes[0].value) {
        favoriteMode = "full";
      } else {
        favoriteSongs.push({
          Url: song.url,
          Name: song.title,
          Author: song.author,
        });

        favoriteMode = "add";
      }
    } else {
      favoriteSongs.splice(songIndex, 1);

      favoriteMode = "remove";
    }
    await favoriteList.save().catch(console.error);
  }

  switch (favoriteMode) {
    case "add":
      console.log(
        `${consoleTags.app} ${user.username} just added a track to their favorite playlist.`
      );
      break;
    case "remove":
      console.log(
        `${consoleTags.app} ${user.username} just removed a track from their favorite playlist.`
      );
      break;
    case "full":
      console.log(
        `${consoleTags.app} ${user.username} tried to add a track to their favorite playlist, but it was full.`
      );
      break;
  }

  const favoriteLength = favoriteList.Playlist.length;

  return { favoriteMode, favoriteLength };
}

async function handleTrack(interaction, client) {
  const queue = client.player.nodes.get(interaction.guildId);
  const song = queue.currentTrack;
  return await updateFavoriteList(interaction.user, song);
}

async function handleResult(interaction, result) {
  const song = result.tracks[0];
  return await updateFavoriteList(interaction.user, song);
}

async function handleDeletion(
  interaction,
  favoriteEmbed,
  embed,
  favoriteList,
  favorite,
  target,
  song
) {
  const timer = 10 * 60 * 1000;

  favoriteEmbed
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      time: timer,
    })

    .then(async (messageComponentInteraction) => {
      const { customId, user } = messageComponentInteraction;

      if (customId === "continue" && user.id === favoriteList.User) {
        if (target) {
          const favoriteSongs = favoriteList.Playlist;
          const songIndex = favoriteSongs.findIndex(
            (favSong) => favSong.Url === song.url
          );

          favoriteSongs.splice(songIndex, 1);

          await favoriteList.save().catch(console.error);

          embed
            .setTitle(titles.removefavorite)
            .setDescription(
              `**[${song.title}](${song.url})**\nhas been removed from your favorite playlist.`
            );

          console.log(
            `${consoleTags.app} ${user.username} just removed track #${target} from their favorite playlist.`
          );
        } else {
          await favorite.findOneAndDelete({
            User: user.id,
          });

          embed
            .setTitle(titles.clearfavorite)
            .setDescription("Your favorite playlist has been cleared.");

          console.log(
            `${consoleTags.app} ${user.username} just cleared their favorite playlist.`
          );
        }
      } else if (customId === "cancel" && user.id === favoriteList.User) {
        embed
          .setTitle(titles.actioncancelled)
          .setDescription("Deletion process has been cancelled.");
      }

      await interaction.editReply({
        embeds: [embed],
        components: [],
      });
    })

    .catch((error) => {
      if (error.code === "InteractionCollectorError") {
        console.log(
          `${consoleTags.warning} Interaction response timed out for ${interaction.commandName} delete command.`
        );
      } else {
        console.error(
          `${consoleTags.error} While awaiting interaction response for ${interaction.commandName} delete command.`
        );
      }
    });
}

async function handleButtons(client, interaction, song) {
  const collector = interaction.channel.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 600_000,
  });

  collector.on("collect", async (i) => {
    if (i.customId === "play-button") {
      let success = false;

      const queue =
        client.player.nodes.get(interaction.guildId) ||
        (await createFavoriteQueue(client, interaction, song));

      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel);
      }

      if (
        queue.connection.joinConfig.channelId !==
        interaction.member.voice?.channel?.id
      )
        return;

      const entry = queue.tasksQueue.aquire();

      await entry.getTask();
      await queue.addTrack(song);

      const { embed, nowPlaying } = embedCreator.createTrackEmbed(
        interaction,
        queue,
        false,
        song
      );

      await handleData(interaction.guildId, nowPlaying);

      if (!queue.node.isPlaying() && !queue.node.isPaused())
        await queue.node.play();

      await queue.tasksQueue.release();

      const button = createButtons(nowPlaying);

      const reply = await i.reply({
        embeds: [embed],
        components: [button],
      });

      success = true;

      handleInteractionDeletion(reply, success);
    } else {
      if (mongoose.connection.readyState !== 1) return;

      const { favoriteMode, favoriteLength } = await updateFavoriteList(
        interaction.user,
        song
      );

      const embed = embedCreator.createFavoriteEmbed(
        i.user,
        song,
        favoriteMode,
        favoriteLength
      );

      await i.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    await interaction.editReply({
      components: [],
    });
  });
}

module.exports = {
  handleTrack,
  handleResult,
  handleDeletion,
  handleButtons,
};
