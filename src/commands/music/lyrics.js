const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Genius = require("genius-lyrics");
const genius = new Genius.Client();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Get lyrics of a song from Genius.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Input a song name.")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const lyricsEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;
    const songTitle = interaction.options.getString("query");

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
          let totalPages = Math.ceil(lyrics.length / 1000) || 1;
          let page = 0;

          let res = lyrics.slice(page * 1000, page * 1000 + 1000);

          embed.setDescription(res).setFooter({
            iconURL: `https://images.genius.com/0ca83e3130e1303a7f78ba351e3091cd.1000x1000x1.png`,
            text: `Genius | Page ${page + 1} of ${totalPages}`,
          });

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
            if (reaction.emoji.name === `➡`) {
              if (page < totalPages - 1) {
                page++;
                res = lyrics.slice(page * 1000, page * 1000 + 1000);

                embed.setDescription(res).setFooter({
                  iconURL: `https://images.genius.com/0ca83e3130e1303a7f78ba351e3091cd.1000x1000x1.png`,
                  text: `Genius | Page ${page + 1} of ${totalPages}`,
                });

                interaction.editReply({
                  embeds: [embed],
                });
              }
            } else {
              if (reaction.emoji.name == `⬅`) {
                if (page !== 0) {
                  --page;
                  res = lyrics.slice(page * 1000, page * 1000 + 1000);

                  embed.setDescription(res).setFooter({
                    iconURL: `https://images.genius.com/0ca83e3130e1303a7f78ba351e3091cd.1000x1000x1.png`,
                    text: `Genius | Page ${page + 1} of ${totalPages}`,
                  });

                  interaction.editReply({
                    embeds: [embed],
                  });
                }
              }
            }
          });
          interaction.editReply({
            embeds: [embed],
          });

          success = true;
        } else if (lyrics.length <= 1200) {
          embed.setDescription(lyrics).setFooter({
            iconURL: `https://images.genius.com/0ca83e3130e1303a7f78ba351e3091cd.1000x1000x1.png`,
            text: `Genius`,
          });

          interaction.editReply({
            embeds: [embed],
          });
        }
      })
      .catch((e) => {
        const failedEmbed = new EmbedBuilder()
          .setTitle(`**No Result**`)
          .setDescription(
            `Make sure you input a valid song name.\nTry again with </lyrics:1100831574787891240>`
          )
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );
        interaction.editReply({
          embeds: [failedEmbed],
        });
      });
    const timeoutDuration = success ? 10 * 60 * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
      ? `Failed to delete ${interaction.commandName} interaction.`
      : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(timeoutLog);
      });
    }, timeoutDuration);
  },
};
