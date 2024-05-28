const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const errorHandler = require("../../utils/main/handleErrors");
const utils = require("../../utils/main/mainUtils");
const { getKeystoneUpgradeSymbol } = require("../../utils/api/wowKeystone");
const { createGameButtons } = require("../../utils/main/createButtons");
const { bookmark } = require("../../utils/api/handleBookmark");
const { pageReact } = require("../../utils/main/handleReaction");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");
const noderiowrapper = require("noderiowrapper");

const RIO = new noderiowrapper();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wow")
    .setDescription("Get World of Warcraft stats")
    .addStringOption((option) =>
      option
        .setName("character")
        .setDescription("Input a character name")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("realm")
        .setDescription("Input a realm name")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("region")
        .setDescription("Select your region")
        .setRequired(true)
        .addChoices(
          {
            name: "EU",
            value: "eu",
          },
          {
            name: "US",
            value: "us",
          }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;

    const character = interaction.options.getString("character");
    const realm = interaction.options.getString("realm");
    const region = interaction.options.getString("region");

    RIO.Character.gear = true;
    RIO.Character.guild = true;
    RIO.Character.mythic_plus_ranks = true;
    RIO.Character.mythic_plus_recent_runs = true;
    RIO.Character.mythic_plus_best_runs = true;
    RIO.Character.raid_progression = true;
    RIO.Character.mythic_plus_scores_by_season =
      RIO.Character._mythic_plus_scores_by_season_current;

    RIO.Character.getProfile(region, realm, character)
      .then(async (result) => {
        const {
          name,
          realm,
          profile_url,
          thumbnail_url,
          active_spec_name,
          faction,
          gear,
          achievement_points,
          mythic_plus_scores_by_season,
          raid_progression,
          mythic_plus_ranks,
          mythic_plus_recent_runs,
          mythic_plus_best_runs,
        } = result;

        const embed = new EmbedBuilder()
          .setTitle(`**${name}-${realm}**`)
          .setURL(profile_url)
          .setThumbnail(thumbnail_url)
          .setColor(utils.colors.wow);

        const firstItems = [
          {
            name: "Class",
            value: `${result.class}-${active_spec_name}`,
          },
          { name: "Faction", value: faction },
          { name: "iLVL", value: `${gear.item_level_equipped}` },
          { name: "Achievement Points", value: `${achievement_points}` },
          {
            name: "M+ Rating",
            value: `${parseInt(mythic_plus_scores_by_season[0].scores.all)}`,
          },
          {
            name: "Raid Progress",
            value: raid_progression["amirdrassil-the-dreams-hope"].summary,
          },
          {
            name: "Realm Class Rank",
            value: `${mythic_plus_ranks.class.realm}`,
          },
          {
            name: "M+ Recent Run",
            value: mythic_plus_recent_runs.length
              ? `${mythic_plus_recent_runs[0].short_name} ${
                  mythic_plus_recent_runs[0].mythic_level
                }${getKeystoneUpgradeSymbol(
                  mythic_plus_recent_runs[0].num_keystone_upgrades
                )}`
              : "N/A",
          },
          {
            name: "M+ Best Run",
            value: mythic_plus_best_runs.length
              ? `${mythic_plus_best_runs[0].short_name} ${
                  mythic_plus_best_runs[0].mythic_level
                }${getKeystoneUpgradeSymbol(
                  mythic_plus_best_runs[0].num_keystone_upgrades
                )}`
              : "N/A",
          },
        ];

        firstItems.forEach((item) => {
          const itemValue = item.value != 0 ? item.value : "N/A";

          embed.addFields({
            name: item.name,
            value: itemValue,
            inline: true,
          });
        });

        let page = 0;
        const totalPages = 2;

        embed.setFooter({
          iconURL: utils.footers.wow,
          text: `${utils.texts.wow} | Page ${page + 1} of ${totalPages}`,
        });

        const recentRunUrl = mythic_plus_recent_runs[0]?.url || false;
        const bestRunUrl = mythic_plus_best_runs[0]?.url || false;
        const button = createGameButtons("wow", recentRunUrl, bestRunUrl);

        const wowEmbed = await interaction.editReply({
          embeds: [embed],
          components: [button],
        });

        success = true;

        await bookmark(interaction, wowEmbed);

        const collector = pageReact(interaction, wowEmbed);

        collector.on("collect", async (reaction, user) => {
          if (user.bot) return;

          await reaction.users.remove(user.id);

          if (reaction.emoji.name == "➡" && page < totalPages - 1) {
            page++;

            const gearItems = [
              { name: "Head", slot: "head" },
              { name: "Neck", slot: "neck" },
              { name: "Shoulder", slot: "shoulder" },
              { name: "Back", slot: "back" },
              { name: "Chest", slot: "chest" },
              { name: "Waist", slot: "waist" },
              { name: "Wrist", slot: "wrist" },
              { name: "Hands", slot: "hands" },
              { name: "Legs", slot: "legs" },
              { name: "Feet", slot: "feet" },
              { name: "Finger 1", slot: "finger1" },
              { name: "Finger 2", slot: "finger2" },
              { name: "Trinket 1", slot: "trinket1" },
              { name: "Trinket 2", slot: "trinket2" },
              { name: "Main Hand", slot: "mainhand" },
              { name: "Off Hand", slot: "offhand" },
            ];

            embed.setFields();

            gearItems.forEach((item) => {
              const itemLevel =
                gear.items[item.slot]?.item_level.toString() || "Empty";

              embed.addFields({
                name: item.name,
                value: itemLevel,
                inline: true,
              });
            });
          } else if (reaction.emoji.name == "⬅" && page !== 0) {
            --page;

            embed.setFields();

            firstItems.forEach((item) => {
              const itemValue = item.value != 0 ? item.value : "N/A";

              embed.addFields({
                name: item.name,
                value: itemValue,
                inline: true,
              });
            });
          } else return;

          embed.setFooter({
            iconURL: utils.footers.wow,
            text: `${utils.texts.wow} | Page ${page + 1} of ${totalPages}`,
          });

          await interaction.editReply({
            embeds: [embed],
          });
        });
      })
      .catch(async (error) => {
        console.error(
          `${utils.consoleTags.error} While fetching World of Warcraft data: `,
          error
        );

        if (error.message.includes("item_level_equipped")) {
          await errorHandler.handleNoResultError(interaction);
        } else {
          await errorHandler.handleAPIError(interaction);
        }
      });

    handleNonMusicalDeletion(interaction, success, undefined, 10);
  },
};
