const favorite = require("../../schemas/favorite-schema");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: `favorite`,
  },
  async execute(interaction, client) {
    let queue = client.player.getQueue(interaction.guildId);

    if (!queue) return;

    let song = queue.current;
    let favoriteList = await favorite.findOne({
      User: interaction.user.id,
    });

    let embed = new EmbedBuilder()
      .setTitle(`Add Favorite`)
      .setDescription(
        "Song has been added to your favorite playlist.\nUse `/favorite` to see and play your playlist."
      )
      .setColor(0x25bfc4)
      .setThumbnail(
        `https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678087-heart-512.png`
      )
      .setFooter({
        iconURL: `https://www.linkpicture.com/q/2753995-201.png`,
        text: "Favorite",
      });

    if (!favoriteList) {
      favoriteList = new favorite({
        User: interaction.user.id,
        Song1: song.url,
        Name1: `${song.title} -- ${song.author}`,
      });
      await favoriteList.save().catch(console.error);
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      console.log(
        `${interaction.user.tag} just added a song to their favorite playlist.`
      );
    } else {
      if (favoriteList.Song1 === song.url) return;
      else if (favoriteList.Song2 === song.url) return;
      else if (favoriteList.Song3 === song.url) return;
      else if (favoriteList.Song4 === song.url) return;
      else if (favoriteList.Song5 === song.url) return;
      else if (favoriteList.Song6 === song.url) return;
      else if (favoriteList.Song7 === song.url) return;
      else if (favoriteList.Song8 === song.url) return;
      else if (favoriteList.Song9 === song.url) return;
      else if (favoriteList.Song10 === song.url) return;
      else {
        if (!favoriteList.Song1) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song1: song.url, Name1: `${song.title} -- ${song.author}` }
          );
          await favoriteList.save().catch(console.error);
        } else if (!favoriteList.Song2) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song2: song.url, Name2: `${song.title} -- ${song.author}` }
          );
          await favoriteList.save().catch(console.error);
        } else if (!favoriteList.Song3) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song3: song.url, Name3: `${song.title} -- ${song.author}` }
          );
          await favoriteList.save().catch(console.error);
        } else if (!favoriteList.Song4) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song4: song.url, Name4: `${song.title} -- ${song.author}` }
          );
          await favoriteList.save().catch(console.error);
        } else if (!favoriteList.Song5) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song5: song.url, Name5: `${song.title} -- ${song.author}` }
          );
          await favoriteList.save().catch(console.error);
        } else if (!favoriteList.Song6) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song6: song.url, Name6: `${song.title} -- ${song.author}` }
          );
          await favoriteList.save().catch(console.error);
        } else if (!favoriteList.Song7) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song7: song.url, Name7: `${song.title} -- ${song.author}` }
          );
          await favoriteList.save().catch(console.error);
        } else if (!favoriteList.Song8) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song8: song.url, Name8: `${song.title} -- ${song.author}` }
          );
          await favoriteList.save().catch(console.error);
        } else if (!favoriteList.Song9) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song9: song.url, Name9: `${song.title} -- ${song.author}` }
          );
          await favoriteList.save().catch(console.error);
        } else if (!favoriteList.Song10) {
          await favorite.updateOne(
            { User: interaction.user.id },
            { Song10: song.url, Name10: `${song.title} -- ${song.author}` }
          );
          await favoriteList.save().catch(console.error);
        } else {
          embed
            .setTitle(`**Action Failed**`)
            .setDescription(`Your Favorite playlist is full.`)
            .setColor(0xffea00)
            .setThumbnail(
              `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
            );
          await interaction.reply({
            embeds: [embed],
            ephemeral: true,
          });
        }
        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
        console.log(
          `${interaction.user.tag} just added a song to their favorite playlist.`
        );
      }
    }
  },
};
