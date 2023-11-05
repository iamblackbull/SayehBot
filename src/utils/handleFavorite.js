const { ComponentType } = require("discord.js");
const favorite = require("../../schemas/favorite-schema");
const { titles } = require("./musicUtils");

async function updateFavoriteList(user, song) {
  let favoriteMode;

  let favoriteList = await favorite.findOne({
    User: user.id,
  });

  if (!favoriteList) {
    favoriteList = new favorite({
      User: user.id,
      Playlist: [
        {
          Url: song.url,
        },
      ],
    });

    await favoriteList.save().catch(console.error);

    favoriteMode = "add";
  } else if (favoriteList.Playlist.length > 100) {
    favoriteMode = "full";
  } else {
    let favoriteSongs = favoriteList.Playlist;

    const songIndex = favoriteSongs.findIndex(
      (favSong) => favSong.Url === song.url
    );

    if (songIndex === -1) {
      favoriteSongs.push({
        Url: song.url,
      });

      favoriteMode = "add";
    } else {
      favoriteSongs.splice(songIndex, 1);

      favoriteMode = "remove";
    }
    await favoriteList.save().catch(console.error);
  }

  switch (favoriteMode) {
    case "add":
      console.log(
        `${user.username} just added a track to their favorite playlist.`
      );
      break;
    case "remove":
      console.log(
        `${user.username} just removed a track from their favorite playlist.`
      );
      break;
    case "full":
      console.log(
        `${user.username} tried to add a track to their favorite playlist, but it was full.`
      );
      break;
  }

  return favoriteMode;
}

async function handleTrack(interaction) {
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
      if (
        messageComponentInteraction.customId === "continue" &&
        messageComponentInteraction.user.id === favoriteList.User
      ) {
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
            `${messageComponentInteraction.user.username} just removed track #${target} from their favorite playlist.`
          );
        } else {
          await favorite.findOneAndDelete({
            User: messageComponentInteraction.user.id,
          });

          embed
            .setTitle(titles.clearfavorite)
            .setDescription("Your favorite playlist has been cleared.");

          console.log(
            `${messageComponentInteraction.user.username} just cleared their favorite playlist.`
          );
        }
      } else if (
        messageComponentInteraction.customId === "cancel" &&
        messageComponentInteraction.user.id === favoriteList.User
      ) {
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
          `Interaction response timed out for ${interaction.commandName} delete command.`
        );
      } else {
        console.log(
          `Something went wrong while awaiting interaction response for ${interaction.commandName} delete commad.`
        );
      }
    });
}

module.exports = {
  handleTrack,
  handleResult,
  handleDeletion,
};
