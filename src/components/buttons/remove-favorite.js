const favorite = require("../../schemas/favorite-schema");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: `remove-favorite`,
  },
  async execute(interaction, client) {
    let queue = client.player.getQueue(interaction.guildId);
    if (!queue) return;
    let song = queue.current;
    let favoriteList = await favorite.findOne({
      User: interaction.user.id,
    });
    if (!favoriteList) return;
    if (favoriteList.Song1 === song.url) {
      await favorite.updateOne(
        { User: interaction.user.id },
        { Song1: null, Name1: null }
      );
    } else if (favoriteList.Song2 === song.url) {
      await favorite.updateOne(
        { User: interaction.user.id },
        { Song2: null, Name2: null }
      );
    } else if (favoriteList.Song3 === song.url) {
      await favorite.updateOne(
        { User: interaction.user.id },
        { Song3: null, Name3: null }
      );
    } else if (favoriteList.Song4 === song.url) {
      await favorite.updateOne(
        { User: interaction.user.id },
        { Song4: null, Name4: null }
      );
    } else if (favoriteList.Song5 === song.url) {
      await favorite.updateOne(
        { User: interaction.user.id },
        { Song5: null, Name5: null }
      );
    } else if (favoriteList.Song6 === song.url) {
      await favorite.updateOne(
        { User: interaction.user.id },
        { Song6: null, Name6: null }
      );
    } else if (favoriteList.Song7 === song.url) {
      await favorite.updateOne(
        { User: interaction.user.id },
        { Song7: null, Name7: null }
      );
    } else if (favoriteList.Song8 === song.url) {
      await favorite.updateOne(
        { User: interaction.user.id },
        { Song8: null, Name8: null }
      );
    } else if (favoriteList.Song9 === song.url) {
      await favorite.updateOne(
        { User: interaction.user.id },
        { Song9: null, Name9: null }
      );
    } else if (favoriteList.Song10 === song.url) {
      await favorite.updateOne(
        { User: interaction.user.id },
        { Song10: null, Name10: null }
      );
    }
    const embed = new EmbedBuilder()
      .setTitle(`Remove Favorite`)
      .setDescription(
        "Song has been removed from your favorite playlist.\nUse `/favorite` to see and play your playlist."
      )
      .setColor(0x25bfc4)
      .setThumbnail(
        `https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Broken_heart.svg/586px-Broken_heart.svg.png`
      )
      .setFooter({
        iconURL: `https://www.linkpicture.com/q/2753995-201.png`,
        text: "Favorite",
      });
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
    console.log(
      `${interaction.user.tag} just removed a song from their favorite playlist.`
    );
  },
};
