const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
} = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const wowModel = require("../../database/wowModel");
const { colors, footers, texts } = require("../../utils/main/mainUtils");
const { getKeystoneUpgradeSymbol } = require("../../utils/api/wowKeystone");
const { createGameButtons } = require("../../utils/main/createButtons");
const { bookmark } = require("../../utils/api/handleBookmark");
const { pageReact } = require("../../utils/main/handleReaction");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");
const noderiowrapper = require("noderiowrapper");

const RIO = new noderiowrapper();

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("get wow stats")
    .setType(ApplicationCommandType.User),

  async execute(interaction) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;

    if (mongoose.connection.readyState !== 1) {
      await errorHandler.handleDatabaseError(interaction);
    } else {
      const wowList = await wowModel.findOne({
        User: interaction.targetUser.id,
      });

      if (!wowList) {
        await errorHandler.handleNoBookmarkProfileError(interaction);
      } else {
        const character = wowList.WowCharacter;
        const realm = wowList.WowRealm;
        const region = wowList.WowRegion;

        RIO.Character.gear = true;
        RIO.Character.guild = true;
        RIO.Character.mythic_plus_ranks = true;
        RIO.Character.mythic_plus_recent_runs = true;
        RIO.Character.mythic_plus_best_runs = true;
        RIO.Character.raid_progression = true;
        RIO.Character.mythic_plus_scores_by_season =
          RIO.Character._mythic_plus_scores_by_season_current;

        RIO.Character.getProfile(`${region}`, `${realm}`, `${character}`)
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
              .setColor(colors.wow);

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
                value: `${parseInt(
                  mythic_plus_scores_by_season[0].scores.all
                )}`,
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
              iconURL: footers.wow,
              text: `${texts.wow} | Page ${page + 1} of ${totalPages}`,
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
                iconURL: footers.wow,
                text: `${texts.wow} | Page ${page + 1} of ${totalPages}`,
              });

              await interaction.editReply({
                embeds: [embed],
              });
            });
          })
          .catch(async (error) => {
            console.error(
              "Error while fetching World of Warcraft data:",
              error
            );

            if (error.message.includes("item_level_equipped")) {
              await errorHandler.handleNoResultError(interaction);
            } else {
              await errorHandler.handleAPIError(interaction);
            }
          });
      }
    }

    handleNonMusicalDeletion(interaction, success, undefined, 10);
  },
};
