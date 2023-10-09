const { EmbedBuilder } = require("discord.js");
const Genius = require("genius-lyrics");
const genius = new Genius.Client();
const errorHandler = require("../../utils/handleErrors");

module.exports = {
  data: {
    name: `lyrics-button`,
  },
  async execute(interaction, client) {
    let queue = client.player.nodes.get(interaction.guildId);
    if (!queue) return;
    if (!queue.node.isPlaying()) return;

    const lyricsEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;

    const songTitle = queue.currentTrack.title;

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
          .setColor(0x256fc4);

        if (lyrics.length > 1200) {
          const chunks = lyrics.match(/(.|[\r\n]){1,1000}/g);

          let totalPages = chunks.length;
          let page = 0;

          let res = chunks[page];

          embed.setDescription(res).setFooter({
            iconURL: `https://images.genius.com/0ca83e3130e1303a7f78ba351e3091cd.1000x1000x1.png`,
            text: `Genius | Page ${page + 1} of ${totalPages}`,
          });

          interaction.editReply({
            embeds: [embed],
          });

          success = true;

          lyricsEmbed.react(`⬅`);
          lyricsEmbed.react(`➡`);

          const filter = (reaction, user) => {
            [`⬅`, `➡`].includes(reaction.emoji.name) &&
              user.id === interaction.user.id;
          };

          const collector = lyricsEmbed.createReactionCollector(filter);

          collector.on("collect", async (reaction, user) => {
            if (user.bot) return;

            reaction.users.remove(
              reaction.users.cache.get(interaction.user.id)
            );

            if (reaction.emoji.name === `➡` && page < totalPages - 1) {
              page++;
              res = chunks[page];

              embed.setDescription(res).setFooter({
                iconURL: `https://images.genius.com/0ca83e3130e1303a7f78ba351e3091cd.1000x1000x1.png`,
                text: `Genius | Page ${page + 1} of ${totalPages}`,
              });

              interaction.editReply({
                embeds: [embed],
              });
            } else if (reaction.emoji.name == `⬅` && page !== 0) {
              --page;
              res = chunks[page];

              embed.setDescription(res).setFooter({
                iconURL: `https://images.genius.com/0ca83e3130e1303a7f78ba351e3091cd.1000x1000x1.png`,
                text: `Genius | Page ${page + 1} of ${totalPages}`,
              });

              interaction.editReply({
                embeds: [embed],
              });
            }
          });
        } else if (lyrics.length <= 1200) {
          embed.setDescription(lyrics).setFooter({
            iconURL: `https://images.genius.com/0ca83e3130e1303a7f78ba351e3091cd.1000x1000x1.png`,
            text: `Genius`,
          });

          interaction.editReply({
            embeds: [embed],
          });

          success = true;
        }
      })
      .catch((error) => {
        errorHandler.handleNoResultError(interaction);
      });

    const timeoutDuration = success ? 10 * 60 * 1000 : 2 * 60 * 1000;

    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete Lyrics interaction.`);
      });
    }, timeoutDuration);
  },
};
