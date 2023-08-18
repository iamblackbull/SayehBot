const favorite = require("../../schemas/favorite-schema");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: `favorite`,
  },
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
      ephemeral: true,
    });

    let embed = new EmbedBuilder().setColor(0x25bfc4).setFooter({
      iconURL: `https://www.linkpicture.com/q/2753995-201.png`,
      text: "Favorite",
    });

    let queue = client.player.nodes.get(interaction.guildId);

    if (!queue) return;

    let song = queue.currentTrack;
    let favoriteMode;

    let favoriteList = await favorite.findOne({
      User: interaction.user.id,
    });

    if (!favoriteList) {
      favoriteList = new favorite({
        User: interaction.user.id,
        Playlist: [
          {
            Url: song.url,
          },
        ],
      });
      await favoriteList.save().catch(console.error);
      favoriteMode = "add";
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
    if (favoriteMode === "add") {
      embed
        .setTitle(`Add Favorite`)
        .setDescription(
          "Song has been added to your favorite playlist.\nUse </favorite:1108681222764367962> to see and play your playlist."
        )
        .setThumbnail(
          `https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678087-heart-512.png`
        );
      console.log(
        `${interaction.user.username} just added a song to their favorite playlist.`
      );
    } else if (favoriteMode === "remove") {
      embed
        .setTitle(`Remove Favorite`)
        .setDescription(
          "Song has been removed from your favorite playlist.\nUse </favorite:1108681222764367962> to see and play your playlist."
        )
        .setThumbnail(
          `https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Broken_heart.svg/586px-Broken_heart.svg.png`
        );
      console.log(
        `${interaction.user.username} just removed a song from their favorite playlist.`
      );
    } else {
      embed
        .setTitle(`**Action Failed**`)
        .setDescription(`An unknown error occurred.`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      setFooter();
    }
    await interaction.editReply({
      embeds: [embed],
    });
  },
};