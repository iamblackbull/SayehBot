const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { footers } = require("../../utils/player/musicUtils");
const { splitLyrics } = require("../../utils/player/splitLyrics");
const { pageReact } = require("../../utils/main/handleReaction");
const { handleNoResultError } = require("../../utils/main/handleErrors");
const deletionHandler = require("../../utils/main/handleDeletion");
const Genius = require("genius-lyrics");

const genius = new Genius.Client();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Get lyrics of a song from Genius")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Input a song name")
        .setRequired(true)
    ),

  async execute(interaction) {
    ////////////// base variables //////////////
    const lyricsEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    const songTitle = interaction.options.getString("query");
    let success = false;

    ////////////// getting lyrics //////////////
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
          const chunks = splitLyrics(lyrics, 1000);

          let totalPages = chunks.length;
          let page = 0;

          let res = chunks[page];

          embed.setDescription(res).setFooter({
            iconURL: footers.genius,
            text: `Genius | Page ${page + 1} of ${totalPages}`,
          });

          await interaction.editReply({
            embeds: [embed],
          });

          ////////////// page switching collector //////////////
          const collector = pageReact(interaction, lyricsEmbed);

          collector.on("collect", async (reaction, user) => {
            if (user.bot) return;

            await reaction.users.remove(user.id);

            if (reaction.emoji.name === `➡` && page < totalPages - 1) {
              page++;
            } else if (reaction.emoji.name == `⬅` && page !== 0) {
              --page;
            }

            res = chunks[page];

            embed.setDescription(res).setFooter({
              iconURL: footers.genius,
              text: `Genius | Page ${page + 1} of ${totalPages}`,
            });

            await interaction.editReply({
              embeds: [embed],
            });
          });
        } else if (lyrics.length <= 1200) {
          embed.setDescription(lyrics);

          await interaction.editReply({
            embeds: [embed],
          });
        }

        success = true;
      })
      .catch((error) => {
        handleNoResultError(interaction);
      });

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
