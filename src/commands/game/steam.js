const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const utils = require("../../utils/main/mainUtils");
const market = require("steam-market-pricing");
const game = require("steam-searcher");
const hltb = require("howlongtobeat");
const { handleNoResultError } = require("../../utils/main/handleErrors");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

const hltbService = new hltb.HowLongToBeatService();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("steam")
    .setDescription("Search in Steam")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("market")
        .setDescription("Search for an item in Steam market")
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("Input the item name (Suggestion: key / ticket)")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("game")
            .setDescription("Select the item's game")
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
                name: "RUB ₽",
                value: "5",
              },
              {
                name: "UAH ₴",
                value: "18",
              },
              {
                name: "INR ₹",
                value: "24",
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
            .setDescription("Input the game name")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
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

          let name = options.getString("item");

          switch (options.getString("item").toLowerCase()) {
            case "key":
              name = "Mann Co. Supply Crate Key";
              break;
            case "ticket":
              name = "Tour of Duty Ticket";
              break;
            default:
              name;
          }

          market
            .getItemPrice(appid, name, currency)
            .then(async (item) => {
              let thumbnail = utils.thumbnails.market;
              switch (appid) {
                case "730":
                  thumbnail = utils.thumbnails.cs;
                  break;
                case "570":
                  thumbnail = utils.thumbnails.dota;
                  break;
                case "440":
                  thumbnail = utils.thumbnails.tf2;
                  break;
              }

              const numericPriceMatch = item.lowest_price.match(/[0-9,.]+/);

              const numericPrice = numericPriceMatch
                ? parseFloat(numericPriceMatch[0].replace(",", "."))
                : NaN;

              const revenue = !isNaN(numericPrice)
                ? (numericPrice * 0.85).toFixed(2)
                : undefined;

              const embed = new EmbedBuilder()
                .setTitle(`**${item.market_hash_name}**`)
                .addFields(
                  {
                    name: "Lowest Price (Revenue)",
                    value: `${item.lowest_price} (${revenue})` || "-",
                    inline: true,
                  },
                  {
                    name: "Median Price",
                    value: `${item.median_price}` || "-",
                    inline: true,
                  },
                  {
                    name: "Volume",
                    value: `${item.volume}` || "-",
                    inline: true,
                  }
                )
                .setColor(utils.colors.steam)
                .setThumbnail(thumbnail)
                .setFooter({
                  iconURL: utils.footers.steam,
                  text: utils.texts.steam,
                });

              success = true;

              await interaction.editReply({
                embeds: [embed],
              });
            })
            .catch(async () => {
              await handleNoResultError(interaction);
            });
        }
        break;

      case "store":
        {
          const name = options.getString("input");

          game.find({ search: `${name}` }, async function (err, result) {
            if (err) {
              await handleNoResultError(interaction);
            } else {
              const platform =
                result.platforms.windows === true
                  ? result.platforms.mac === true
                    ? "Multiplatform"
                    : "Windows"
                  : result.platforms.mac === true
                  ? "Mac"
                  : "Linux";

              const releaseDate =
                result.release_date.coming_soon === true
                  ? "Coming Soon"
                  : `${result.release_date.date}`;

              const meta = result.metacritic
                ? `${result.metacritic.score} / 100`
                : "Unknown";

              const price = result.price_overview
                ? `${result.price_overview.final_formatted}`
                : "-";

              const developer = result.developers[0]
                ? `${result.developers[0]}`
                : "Unknown";

              const publisher = result.publishers[0]
                ? `${result.publishers[0]}`
                : "Unknown";

              const genre = result.genres[0].description
                ? `${result.genres[0].description}`
                : "Unknown";

              const resultName = result.name.replace(/\s+/g, "");

              const hltb = await hltbService
                .search(result.name)
                .then((response) => response[0]);

              const url = `https://store.steampowered.com/app/${result.steam_appid}/${resultName}/`;
              const gameplay = hltb?.gameplayMain ?? "--";
              const hltbUrl = hltb
                ? `https://howlongtobeat.com/game/${hltb.id}`
                : "https://howlongtobeat.com";

              const embed = new EmbedBuilder()
                .setTitle(`**${result.name}**`)
                .setURL(url)
                .setDescription(`${result.short_description}`)
                .setThumbnail(`${result.capsule_image}`)
                .addFields(
                  {
                    name: "Developer",
                    value: `${developer}`,
                    inline: true,
                  },
                  {
                    name: "Publisher",
                    value: `${publisher}`,
                    inline: true,
                  },
                  {
                    name: "Price",
                    value: `${price}`,
                    inline: true,
                  },
                  {
                    name: "Platform",
                    value: `${platform}`,
                    inline: true,
                  },
                  {
                    name: "Metacritic Score",
                    value: `${meta}`,
                    inline: true,
                  },
                  {
                    name: "Main Genre",
                    value: `${genre}`,
                    inline: true,
                  },
                  {
                    name: "Release Date",
                    value: `${releaseDate}`,
                    inline: true,
                  },
                  {
                    name: "Main Story",
                    value: `${gameplay} h`,
                    inline: true,
                  }
                )
                .setImage(result.screenshots[0].path_full)
                .setColor(utils.colors.steam)
                .setFooter({
                  iconURL: utils.footers.steam,
                  text: utils.texts.steam,
                });

              const storeButton = new ButtonBuilder()
                .setLabel("Visit Store Page")
                .setURL(url)
                .setStyle(ButtonStyle.Link);

              const crackButton = new ButtonBuilder()
                .setLabel("Crack Status")
                .setURL(
                  `https://steamcrackedgames.com/games/${encodeURIComponent(
                    result.name.replace(/\s+/g, "-")
                  )}`
                )
                .setStyle(ButtonStyle.Link);

              const hltbButton = new ButtonBuilder()
                .setLabel("How long to beat")
                .setURL(hltbUrl)
                .setStyle(ButtonStyle.Link);

              const button = new ActionRowBuilder()
                .addComponents(storeButton)
                .addComponents(crackButton)
                .addComponents(hltbButton);

              await interaction.editReply({
                embeds: [embed],
                components: [button],
              });

              success = true;
            }
          });
        }
        break;
      default: {
        console.error(
          `${utils.consoleTags.error} Something went wrong while executing ${interaction.commandName} command.`
        );
      }
    }

    const { gameChannelID } = process.env;
    handleNonMusicalDeletion(interaction, success, gameChannelID, 10);
  },
};
