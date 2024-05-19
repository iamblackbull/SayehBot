const { EmbedBuilder } = require("discord.js");
const { footers } = require("../../utils/player/musicUtils");
const lyricsSplitter = require("../../utils/player/splitLyrics");
const reactHandler = require("../../utils/main/handleReaction");
const errorHandler = require("../../utils/main/handleErrors");
const deletionHandler = require("../../utils/main/handleDeletion");
const Genius = require("genius-lyrics");

const genius = new Genius.Client();

module.exports = {
  data: {
    name: "lyrics-button",
  },

  async execute(interaction, client) {
    ////////////// return checks //////////////
    let queue = client.player.nodes.get(interaction.guildId);
    if (!queue) return;
    if (!queue.currentTrack) return;

    const lyricsEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;
    const songTitle = queue.currentTrack.title;

    ////////////// get lyrics //////////////
    await genius.songs
      .search(`${songTitle}`)
      .then(async function (result) {
        const song = result[0];
        const lyrics = await song.lyrics();

        let embed = new EmbedBuilder()
          .setTitle(`**${song.title}**`)
          .setAuthor({
            name: `${song.artist.name}`,
            iconURL: `${song.artist.image}`,
            url: `${song.artist.url}`,
          })
          .setURL(`${song.url}`)
          .setThumbnail(`${song.image}`)
          .setColor(0x256fc4)
          .setFooter({
            iconURL: footers.genius,
            text: "Genius",
          });

        if (lyrics.length > 1200) {
          ////////////// split lyrics //////////////
          const chunks = lyricsSplitter.splitLyrics(lyrics, 1000);

          let totalPages = chunks.length;
          let page = 0;

          let res = chunks[page];

          ////////////// original response //////////////
          embed.setDescription(res).setFooter({
            iconURL: footers.genius,
            text: `Genius | Page ${page + 1} of ${totalPages}`,
          });

          interaction.editReply({
            embeds: [embed],
          });

          ////////////// page switching collector //////////////
          const collector = reactHandler.pageReact(interaction, lyricsEmbed);

          collector.on("collect", async (reaction, user) => {
            if (user.bot) return;

            await reaction.users.remove(user.id);

            if (reaction.emoji.name === "➡" && page < totalPages - 1) {
              page++;
            } else if (reaction.emoji.name == "⬅" && page !== 0) {
              --page;
            }

            res = chunks[page];

            embed.setDescription(res).setFooter({
              iconURL: footers.genius,
              text: `Genius | Page ${page + 1} of ${totalPages}`,
            });

            interaction.editReply({
              embeds: [embed],
            });
          });
        } else if (lyrics.length <= 1200) {
          embed.setDescription(lyrics);

          interaction.editReply({
            embeds: [embed],
          });
        }
        
        success = true;
      })
      .catch((error) => {
        errorHandler.handleNoResultError(interaction);
      });

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
