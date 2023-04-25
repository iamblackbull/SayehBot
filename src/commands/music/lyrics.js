const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { lyricsExtractor } = require("@discord-player/extractor");
const lyricsClient = lyricsExtractor();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Returns lyrics of a song")
    .addStringOption((option) =>
      option.setName("song").setDescription("Input song name").setRequired(true)
    ),
  async execute(interaction, client) {
    const lyricsEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    const songTitle = interaction.options.getString("song");

    lyricsClient
      .search(`${songTitle}`)
      .then((result) => {
        let embed = new EmbedBuilder()
        .setTitle(`🎤 ${result.title}`)
        .setAuthor({
          name: `${result.artist.name}`,
          url: `${result.artist.url}`,
        })
        .setURL(`${result.url}`)
        .setThumbnail(`${result.thumbnail}`)
        .setColor(0x256fc4);

        if (result.lyrics.length > 1200) {
          let totalPages = Math.ceil(result.lyrics.length / 1000) || 1;
          let page = 0;

          let res = result.lyrics.slice(page * 1000, page * 1000 + 1000);
          embed.setDescription(res).setFooter({
            iconURL: `https://cdn0.iconfinder.com/data/icons/summer-and-travel-3-2/128/134-512.png`,
            text: `Page ${page + 1} of ${totalPages}`,
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
            else {
              reaction.users.remove(reaction.users.cache.get(interaction.user.id));
              if (reaction.emoji.name === `➡`) {
                if (page < totalPages - 1) {
                  page++;
                  res = result.lyrics.slice(page * 1000, page * 1000 + 1000);
                  embed.setDescription(res).setFooter({
                    iconURL: `https://cdn0.iconfinder.com/data/icons/summer-and-travel-3-2/128/134-512.png`,
                    text: `Page ${page + 1} of ${totalPages}`,
                  });
                  await interaction.editReply({
                    embeds: [embed],
                  });
                }
              } else {
                if (reaction.emoji.name == `⬅`) {
                  if (page !== 0) {
                    --page;
                    res = result.lyrics.slice(page * 1000, page * 1000 + 1000);
                    embed.setDescription(res).setFooter({
                      iconURL: `https://cdn0.iconfinder.com/data/icons/summer-and-travel-3-2/128/134-512.png`,
                      text: `Page ${page + 1} of ${totalPages}`,
                    });
                    await interaction.editReply({
                      embeds: [embed],
                    });
                  }
                }
              }
            }
          });
          await interaction.editReply({
            embeds: [embed],
          });
        } else if (result.lyrics.length <= 1200) {
          const sing = result.lyrics;
          embed.setDescription(sing).setFooter({
            iconURL: `https://cdn0.iconfinder.com/data/icons/summer-and-travel-3-2/128/134-512.png`,
            text: `Lyrics`,
          });
          await interaction.editReply({
            embeds: [embed],
          });
        } else if (!result) {
          const failedEmbed = new EmbedBuilder()
          .setTitle(`**No Result**`)
          .setDescription(`Make sure you input a valid song name.`)
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );
          await interaction.editReply({
            embeds: [failedEmbed],
          });
        }
      })
      .catch(console.error);
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete Lyrics interaction.`);
      });
    }, 10 * 60 * 1000);
  },
};
