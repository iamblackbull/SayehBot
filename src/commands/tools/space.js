const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { NASA_API_KEY } = process.env;
const apod = require("nasa-apod");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("space")
    .setDescription("Returns NASA picture of the day"),
  async execute(interaction, client) {
    let embed = new EmbedBuilder();
    client = new apod.Client({
      apiKey: NASA_API_KEY,
    });
    try {
      client().then(async function (body) {
        let mode;
        if (body.hdurl) {
          mode = "picture";
        } else {
          mode = "video";
        }
        embed.setTitle(body.title).setColor(0x256fc4).setFooter({
          iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/2449px-NASA_logo.svg.png`,
          text: `NASA `,
        });
        if (mode === "picture") {
          embed.setURL(`${body.hdurl}`).setImage(`${body.hdurl}`);
        }
        if (mode === "video") {
          embed.setURL(`${body.url}`);
        }
        if (body.explanation.length > 1200) {
          embed.setDescription(body.explanation.slice(0, 1200));
        } else {
          embed.setDescription(body.explanation);
        }
        await interaction.reply({
          embeds: [embed],
        });
      });
    } catch (error) {
      console.log(error);
      let failedEmbed = new EmbedBuilder()
        .setTitle(`**No Response**`)
        .setDescription(`NASA API did not respond. Please try again later with </space:1050160950583513189>.`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.reply({
        embeds: [failedEmbed],
        ephemeral: true,
      });
    }
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete Space interaction.`);
      });
    }, 10 * 60 * 1000);
  },
};
