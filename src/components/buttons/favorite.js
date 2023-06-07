const favorite = require("../../schemas/favorite-schema");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: `favorite`,
  },
  async execute(interaction, client) {
    let embed = new EmbedBuilder().setColor(0x25bfc4).setFooter({
      iconURL: `https://www.linkpicture.com/q/2753995-201.png`,
      text: "Favorite",
    });

    let queue = client.player.getQueue(interaction.guildId);

    if (!queue) return;

    let song = queue.current;
    let favoriteMode;

    let favoriteList = await favorite.findOne({
      User: interaction.user.id,
    });

    if (!favoriteList) {
      favoriteList = new favorite({
        User: interaction.user.id,
        Song1: song.url,
        Name1: `${song.title} -- ${song.author}`,
      });
      await favoriteList.save().catch(console.error);
      favoriteMode = "add";
    } else {
      if (favoriteList.Song1 === song.url) {
        await favorite.updateOne(
          { User: interaction.user.id },
          { Song1: null, Name1: null }
        );
        favoriteMode = "remove";
      } else if (favoriteList.Song2 === song.url) {
        await favorite.updateOne(
          { User: interaction.user.id },
          { Song2: null, Name2: null }
        );
        favoriteMode = "remove";
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
        favoriteMode = "remove";
      } else if (favoriteList.Song5 === song.url) {
        await favorite.updateOne(
          { User: interaction.user.id },
          { Song5: null, Name5: null }
        );
        favoriteMode = "remove";
      } else if (favoriteList.Song6 === song.url) {
        await favorite.updateOne(
          { User: interaction.user.id },
          { Song6: null, Name6: null }
        );
        favoriteMode = "remove";
      } else if (favoriteList.Song7 === song.url) {
        await favorite.updateOne(
          { User: interaction.user.id },
          { Song7: null, Name7: null }
        );
        favoriteMode = "remove";
      } else if (favoriteList.Song8 === song.url) {
        await favorite.updateOne(
          { User: interaction.user.id },
          { Song8: null, Name8: null }
        );
        favoriteMode = "remove";
      } else if (favoriteList.Song9 === song.url) {
        await favorite.updateOne(
          { User: interaction.user.id },
          { Song9: null, Name9: null }
        );
        favoriteMode = "remove";
      } else if (favoriteList.Song10 === song.url) {
        await favorite.updateOne(
          { User: interaction.user.id },
          { Song10: null, Name10: null }
        );
        favoriteMode = "remove";
      } else {
        if (!favoriteList.Song1) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song1: song.url, Name1: `${song.title} -- ${song.author}` }
          );
          favoriteMode = "add";
        } else if (!favoriteList.Song2) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song2: song.url, Name2: `${song.title} -- ${song.author}` }
          );
          favoriteMode = "add";
        } else if (!favoriteList.Song3) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song3: song.url, Name3: `${song.title} -- ${song.author}` }
          );
          favoriteMode = "add";
        } else if (!favoriteList.Song4) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song4: song.url, Name4: `${song.title} -- ${song.author}` }
          );
          favoriteMode = "add";
        } else if (!favoriteList.Song5) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song5: song.url, Name5: `${song.title} -- ${song.author}` }
          );
          favoriteMode = "add";
        } else if (!favoriteList.Song6) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song6: song.url, Name6: `${song.title} -- ${song.author}` }
          );
          favoriteMode = "add";
        } else if (!favoriteList.Song7) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song7: song.url, Name7: `${song.title} -- ${song.author}` }
          );
          favoriteMode = "add";
        } else if (!favoriteList.Song8) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song8: song.url, Name8: `${song.title} -- ${song.author}` }
          );
          favoriteMode = "add";
        } else if (!favoriteList.Song9) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song9: song.url, Name9: `${song.title} -- ${song.author}` }
          );
          favoriteMode = "add";
        } else if (!favoriteList.Song10) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song10: song.url, Name10: `${song.title} -- ${song.author}` }
          );
          favoriteMode = "add";
        } else {
          favoriteMode = "full";
        }
        if (favoriteMode === "add") {
          embed
            .setTitle(`Add Favorite`)
            .setDescription(
              "Song has been added to your favorite playlist.\nUse `/favorite` to see and play your playlist."
            )
            .setThumbnail(
              `https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678087-heart-512.png`
            );
          console.log(
            `${interaction.user.tag} just added a song to their favorite playlist.`
          );
        } else if (favoriteMode === "remove") {
          embed
            .setTitle(`Remove Favorite`)
            .setDescription(
              "Song has been removed from your favorite playlist.\nUse `/favorite` to see and play your playlist."
            )
            .setThumbnail(
              `https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Broken_heart.svg/586px-Broken_heart.svg.png`
            );
          console.log(
            `${interaction.user.tag} just removed a song from their favorite playlist.`
          );
        } else if (favoriteMode === "full") {
          embed
            .setTitle(`**Action Failed**`)
            .setDescription(
              `Your Favorite playlist is full. Remove at least **1** song from your playlist.`
            )
            .setColor(0xffea00)
            .setThumbnail(
              `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
            )
            .setFooter();
        } else {
          embed
            .setTitle(`**Action Failed**`)
            .setDescription(`An unknown error occurred.`)
            .setColor(0xffea00)
            .setThumbnail(
              `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
            )
            .setFooter();
        }
        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }
    }
  },
};
