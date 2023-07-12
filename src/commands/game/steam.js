const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { gameChannelID } = process.env;
const market = require("steam-market-pricing");
const game = require("steam-searcher");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("steam")
    .setDescription("Search for a game / item in Steam")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("market")
        .setDescription("Search for price of an item in Steam market")
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("Input item name (Suggestion: key / ticket)")
            .setRequired(true)
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
                name: "USD $",
                value: "1",
              },
              {
                name: "EUR €",
                value: "3",
              },
              {
                name: "ARS $",
                value: "34",
              },
              {
                name: "RUB ₽",
                value: "5",
              },
              {
                name: "UAH ₴",
                value: "18",
              },
              {
                name: "TL ₺",
                value: "17",
              }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("store")
        .setDescription("Search for a game in Steam store")
        .addStringOption((option) =>
          option
            .setName("input")
            .setDescription("Input game name")
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;
    const { options } = interaction;
    const Sub = options.getSubcommand();

    switch (Sub) {
      case "market":
        {
          const appid = options.get("game").value;
          const currency = options.get("currency").value;
          let name;
          if (options.getString("item").toLowerCase() === "key") {
            name = "Mann Co. Supply Crate Key";
          } else if (options.getString("item").toLowerCase() === "ticket") {
            name = "Tour of Duty Ticket";
          } else {
            name = options.getString("item");
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
                embed.setThumbnail(`https://i.redd.it/yugctti7mek81.png`);
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
              success = true;
            })
            .catch(async (error) => {
              const failedEmbed = new EmbedBuilder()
                .setTitle(`No result`)
                .setDescription(
                  `Please make sure you input the exact item name.\nThis API is Case-sensitive and also searchs for the exact item name you input.\nClick here to retry: </steam market:1100722765587284048>`
                )
                .setColor(0xffea00)
                .setThumbnail(
                  `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                );
              await interaction.editReply({
                embeds: [failedEmbed],
              });
            });
        }
        break;
      case "store":
        {
          const name = options.getString("input");
          game.find({ search: `${name}` }, async function (err, result) {
            if (err) {
              const failedEmbed = new EmbedBuilder()
                .setTitle(`No result`)
                .setDescription(
                  `Please make sure you input the correct game name.\nClick here to retry: </steam store:1100722765587284048>`
                )
                .setColor(0xffea00)
                .setThumbnail(
                  `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
                );
              await interaction.editReply({
                embeds: [failedEmbed],
              });
            } else {
              let platform;
              result.platforms.windows === true
                ? result.platforms.mac === true
                  ? (platform = "Multiplatform")
                  : (platform = "Windows")
                : result.platforms.mac === true
                ? (platform = "Mac")
                : (platform = "Linux");

              let releaseDate;
              result.release_date.coming_soon === true
                ? (releaseDate = "Coming Soon")
                : (releaseDate = `${result.release_date.date}`);
              let meta;
              !result.metacritic
                ? (meta = "Unkown")
                : (meta = `${result.metacritic.score} / 100`);
              let price;
              !result.price_overview
                ? (price = "Free to Play")
                : (price = `${result.price_overview.final_formatted}`);
              let developer;
              !result.developers[0]
                ? (developer = "Unkown")
                : (developer = `${result.developers[0]}`);
              let publisher;
              !result.publishers[0]
                ? (publisher = "Unkown")
                : (publisher = `${result.publishers[0]}`);
              let genre;
              !result.genres[0].description
                ? (genre = "Unkown")
                : (genre = `${result.genres[0].description}`);
              const resultName = result.name.replace(/\s+/g, "");

              const embed = new EmbedBuilder()
                .setTitle(`**${result.name}**`)
                .setURL(
                  `https://store.steampowered.com/app/${result.steam_appid}/${resultName}/`
                )
                .setDescription(`${result.short_description}`)
                .setThumbnail(`${result.capsule_image}`)
                .addFields(
                  {
                    name: `Developer`,
                    value: `${developer}`,
                    inline: true,
                  },
                  {
                    name: `Publisher`,
                    value: `${publisher}`,
                    inline: true,
                  },
                  {
                    name: `Price`,
                    value: `${price}`,
                    inline: true,
                  },
                  {
                    name: `Platform`,
                    value: `${platform}`,
                    inline: true,
                  },
                  {
                    name: `Metacritic Score`,
                    value: `${meta}`,
                    inline: true,
                  },
                  {
                    name: `Main Genre`,
                    value: `${genre}`,
                    inline: true,
                  },
                  {
                    name: `Release Date`,
                    value: `${releaseDate}`,
                    inline: true,
                  }
                )
                .setImage(`${result.screenshots[0].path_full}`)
                .setColor(0x0e0e57)
                .setFooter({
                  iconURL: `https://cdn.freebiesupply.com/images/large/2x/steam-logo-transparent.png`,
                  text: `Steam`,
                });

              const storeButton = new ButtonBuilder()
                .setLabel(`Visit Store Page`)
                .setURL(
                  `https://store.steampowered.com/app/${result.steam_appid}/${resultName}/`
                )
                .setStyle(ButtonStyle.Link);

              await interaction.editReply({
                embeds: [embed],
                components: [new ActionRowBuilder().addComponents(storeButton)],
              });
              success = true;
            }
          });
        }
        break;
      default: {
        console.log("Something went wrong while executing steam command...");
      }
    }
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id !== gameChannelID) {
          interaction.deleteReply().catch((e) => {
            console.log(`Failed to delete Steam interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Steam interaction.`);
        });
      }
    }, 5 * 60 * 1000);
  },
};
