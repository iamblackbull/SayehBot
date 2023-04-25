const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const market = require("steam-market-pricing");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("steam")
    .setDescription("Returns Price of an item in Steam market")
    .addStringOption((option) =>
      option.setName("item").setDescription("Input item name").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Select Item's game name")
        .setRequired(true)
        .addChoices(
          {
            name: "CS:GO",
            value: "730",
          },
          {
            name: "Dota 2",
            value: "570",
          },
          {
            name: "Team Fortress 2",
            value: "440",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("currency")
        .setDescription("Select your currency")
        .setRequired(true)
        .addChoices(
          {
            name: "USD",
            value: "1",
          },
          {
            name: "EUR",
            value: "3",
          },
          {
            name: "ARS",
            value: "34",
          },
          {
            name: "TRY",
            value: "17",
          },
          {
            name: "RUB",
            value: "5",
          }
        )
    ),
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    const appid = interaction.options.get("game").value;
    const currency = interaction.options.get("currency").value;
    let name = interaction.options.getString("item");
    if (name.toLowerCase() === "key") {
      name = "Mann Co. Supply Crate Key";
    }
    if (name.toLowerCase() === "ticket") {
      name = "Tour of Duty Ticket";
    }

    market
      .getItemPrice(appid, `${name}`, currency)
      .then(async (item) => {
        let embed = new EmbedBuilder()
          .setTitle(`${item.market_hash_name}`)
          .setColor(0x0e0e57)
          .setFooter({
            iconURL: `https://cdn.freebiesupply.com/images/large/2x/steam-logo-transparent.png`,
            text: `Steam`,
          })
          .addFields(
            {
              name: `Lowest Price`,
              value: `${item.lowest_price}` || `-`,
              inline: true,
            },
            {
              name: `Median Price`,
              value: `${item.median_price}` || `-`,
              inline: true,
            },
            {
              name: `Volume`,
              value: `${item.volume}` || `-`,
              inline: true,
            }
          );
        if (appid == 730) {
          embed.setThumbnail(
            `https://i.redd.it/yugctti7mek81.png`
          );
        }
        if (appid == 570) {
          embed.setThumbnail(
            `https://www.buysellvouchers.com/assets/924fc46b/images/pt/dota.png`
          );
        }
        if (appid == 440) {
          embed.setThumbnail(
            `https://aux2.iconspalace.com/uploads/429940364.png`
          );
        }
        await interaction.editReply({
          embeds: [embed],
        });
      })
      .catch(async (error) => {
        const failedEmbed = new EmbedBuilder()
          .setTitle(`No result`)
          .setDescription(`Make sure you input the correct informations.`)
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );
        await interaction.editReply({
          embeds: [failedEmbed],
        });
      });
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete Steam interaction.`);
      });
    }, 10 * 60 * 1000);
  },
};
