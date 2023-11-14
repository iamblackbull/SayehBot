const { ComponentType } = require("discord.js");
const { mongoose } = require("mongoose");
const favorite = require("../schemas/favorite-schema");
const { titles } = require("./musicUtils");
const queueCreator = require("./createQueue");
const embedCreator = require("./createEmbed");
const playerDataHandler = require("./handlePlayerData");
const buttonCreator = require("./createButtons");
const deletionHandler = require("./handleDeletion");

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
    const favoriteSongs = favoriteList.Playlist;

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
          `Something went wrong while awaiting interaction response for ${interaction.commandName} delete command.`
        );
      }
    });
}

async function handleButtons(favoriteEmbed, client, interaction, song) {
  const timer = 10 * 60 * 1000;

  favoriteEmbed
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      time: timer,
    })
    .then(async (messageComponentInteraction) => {
      if (messageComponentInteraction.customId === "play-button") {
        let success = false;

        const queue =
          client.player.nodes.get(interaction.guildId) ||
          (await queueCreator.createFavoriteQueue(client, interaction, song));

        if (!queue.connection) {
          await queue.connect(interaction.member.voice.channel);
        }

        if (
          queue.connection.joinConfig.channelId !==
          interaction.member.voice?.channel?.id
        )
          return;

        await queue.addTrack(song);

        const { embed, nowPlaying } = embedCreator.createTrackEmbed(
          interaction,
          queue,
          false,
          song
        );

        await playerDataHandler.handleData(interaction, nowPlaying);

        if (!queue.node.isPlaying() && !queue.node.isPaused())
          await queue.node.play();

        const button = buttonCreator.createButtons(nowPlaying);

        const reply = await messageComponentInteraction.reply({
          embeds: [embed],
          components: [button],
        });

        success = true;

        deletionHandler.handleInteractionDeletion(reply, success);
      } else {
        if (mongoose.connection.readyState !== 1) return;

        const { favoriteMode, favoriteLength } = await updateFavoriteList(
          interaction.user,
          song
        );

        const embed = embedCreator.createFavoriteEmbed(
          song,
          favoriteMode,
          favoriteLength
        );

        await messageComponentInteraction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }
    })
    .catch((error) => {
      if (error.code === "InteractionCollectorError") {
        console.log(
          `Interaction response timed out for ${interaction.commandName} buttons.`
        );
      } else {
        console.log(
          `Something went wrong while awaiting interaction response for ${interaction.commandName} buttons.`
        );
      }
    });
}

module.exports = {
  handleTrack,
  handleResult,
  handleDeletion,
  handleButtons,
};
