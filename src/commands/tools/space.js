const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const apod = require("nasa-apod");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("space")
    .setDescription("Returns NASA picture of the day"),
  async execute(interaction, client) {
    let embed = new EmbedBuilder();
    client = new apod.Client({
      apiKey: "WIm2ehX0oD8dhbeNTgIBYRmyuxswJMYE5SGZLWjM",
    });
    try {
      client().then(async function (body) {
        embed
          .setTitle(body.title)
          .setColor(0x256fc4)
          .setURL(`${body.hdurl}`)
          .setImage(`${body.hdurl}`)
          .setFooter({
            iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/2449px-NASA_logo.svg.png`,
            text: `NASA `,
          });
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
        .setDescription(
          `NASA API did not respond. Please try again later.`
        )
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
