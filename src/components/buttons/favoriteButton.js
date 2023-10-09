const favorite = require("../../schemas/favorite-schema");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: `favorite-button`,
  },
  async execute(interaction, client) {
    let favoriteMode;
    const queue = client.player.nodes.get(interaction.guildId);
    if (!queue) return;
    if (!queue.node.isPlaying()) return;

    const song = queue.currentTrack;
    if (!song) return;

    await interaction.deferReply({
      fetchReply: true,
      ephemeral: true,
    });

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

    let embed = new EmbedBuilder().setColor(0x25bfc4).setFooter({
      iconURL: `https://sendabuddy.com/cdn/shop/files/newlogo_8_2048x2048.png?v=1661517305`,
      text: "Favorite",
    });

    if (favoriteMode === "add") {
      embed
        .setTitle(`Add Favorite`)
        .setDescription(
          "Track has been added to your favorite playlist.\nUse </favorite:1108681222764367962> to interact with your playlist."
        )
        .setThumbnail(
          `https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678087-heart-512.png`
        );

      console.log(
        `${interaction.user.username} just added a track to their favorite playlist.`
      );
    } else if (favoriteMode === "remove") {
      embed
        .setTitle(`Remove Favorite`)
        .setDescription(
          "Track has been removed from your favorite playlist.\nUse </favorite:1108681222764367962> to interact with your playlist."
        )
        .setThumbnail(
          `https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Broken_heart.svg/586px-Broken_heart.svg.png`
        );

      console.log(
        `${interaction.user.username} just removed a track from their favorite playlist.`
      );
    } else if (favoriteMode === "full") {
      embed
        .setTitle(`Playlist Full`)
        .setDescription(
          "Your favorite playlist is full. (**100** Tracks)\nUse </favorite:1108681222764367962> to interact with your playlist."
        )
        .setThumbnail(
          `https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Broken_heart.svg/586px-Broken_heart.svg.png`
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
