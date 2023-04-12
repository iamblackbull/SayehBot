const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const lyricsParse = require("lyrics-parse");
const { musicChannelID } = process.env;
let success = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Returns lyrics of a song")
    .addStringOption((option) =>
      option.setName("song").setDescription("Input song name").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("singer")
        .setDescription("Input singer name")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const lyricsEmbed = await interaction.deferReply({
      fetchReply: true,
    });
    const songTitle = interaction.options.getString("song");
    const author = interaction.options.getString("singer");
    let lyrics = await lyricsParse(songTitle, author).catch(console.error);

    let embed = new EmbedBuilder()
      .setTitle(`🎤 ${songTitle} -- ${author}`)
      .setColor(0x256fc4);

    if (lyrics.length > 1200) {
      let totalPages = Math.ceil(lyrics.length / 1000) || 1;
      let page = 0;

      let res = lyrics.slice(page * 1000, page * 1000 + 1000);
      embed.setDescription(res).setFooter({
        text: `📄 Page ${page + 1} of ${totalPages}`,
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
              res = lyrics.slice(page * 1000, page * 1000 + 1000);
              embed.setDescription(res).setFooter({
                text: `📄 Page ${page + 1} of ${totalPages}`,
              });
              await interaction.editReply({
                embeds: [embed],
              });
            }
          } else {
            if (reaction.emoji.name == `⬅`) {
              if (page !== 0) {
                --page;
                res = lyrics.slice(page * 1000, page * 1000 + 1000);
                embed.setDescription(res).setFooter({
                  text: `📄 Page ${page + 1} of ${totalPages}`,
                });
                await interaction.editReply({
                  embeds: [embed],
                });
                success = true;
              }
            }
          }
        }
      });
    } else {
      embed.setDescription(lyrics ? lyrics : "No results!");
      await interaction.editReply({
        embeds: [embed],
      });
      success = true;
    }
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) {
          lyricsEmbed.reactions
            .removeAll()
            .catch((error) =>
              console.error(
                chalk.red("Failed to clear reactions from song message."),
                error
              )
            );
        } else {
          interaction.deleteReply().catch(console.error);
        }
      } else {
        interaction.deleteReply().catch(console.error);
      }
    }, 10 * 60 * 1000);
  },
};
