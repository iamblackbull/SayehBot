const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
} = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const overwatchModel = require("../../database/overwatchModel");
const utils = require("../../utils/main/mainUtils");
const { findStatIndex } = require("../../utils/api/overwatchIndex");
const { createGameButtons } = require("../../utils/main/createButtons");
const { bookmark } = require("../../utils/api/handleBookmark");
const { pageReact } = require("../../utils/main/handleReaction");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");
const overwatch = require("overwatch-api");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("get overwatch stats")
    .setType(ApplicationCommandType.User),

  async execute(interaction) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;

    if (mongoose.connection.readyState !== 1) {
      await errorHandler.handleDatabaseError(interaction);
    } else {
      const owProfile = await overwatchModel.findOne({
        User: interaction.targetUser.id,
      });

      if (!owProfile) {
        await errorHandler.handleNoBookmarkProfileError(interaction);
      } else {
        const tag = owProfile.Tag;
        const url = `https://overwatch.blizzard.com/en-us/career/${tag}/`;

        overwatch.getStats("pc", "eu", tag, async (error, result) => {
          if (error) {
            console.error(
              `${utils.consoleTags.error} While fetching Overwatch data: `,
              error
            );

            if (error.message.toLowerCase().includes("profile")) {
              await errorHandler.handleNoResultError(interaction);
            } else {
              await errorHandler.handleAPIError(interaction);
            }
          } else {
            const { top_heroes, combat, assists, best, game, average } =
              result.stats;

            const embed = new EmbedBuilder()
              .setAuthor({
                name: result.username,
                iconURL: result.portrait,
                url: url,
              })
              .setTitle("**Quickplay**")
              .setURL(url)
              .setThumbnail(top_heroes.quickplay.played[0].img)
              .setColor(utils.colors.overwatch);

            const statMapping = [
              { name: "Games Played", category: game },
              { name: "Games Won", category: game },
              { name: "Games Lost", category: game },
              { name: "Time Played", category: game },
              { name: "Eliminations", category: combat },
              { name: "Deaths", category: combat },
              { name: "Assists", category: assists },
              { name: "Damage Done", category: combat },
              { name: "Healing Done", category: assists },
              { name: "Solo Kills", category: combat },
              { name: "Multikills", category: combat },
              { name: "Final Blows", category: combat },
              { name: "Melee Final Blows", category: combat },
              { name: "Eliminations - Most in Game", category: best },
              { name: "All Damage Done - Most in Game", category: best },
              { name: "Healing Done - Most in Game", category: best },
              { name: "Solo Kills - Most in Game", category: best },
              { name: "Multikill - Best", category: best },
              { name: "Kill Streak - Best", category: best },
              { name: "Eliminations - Avg per 10 Min", category: average },
              { name: "Deaths - Avg per 10 Min", category: average },
              { name: "Hero Damage Done - Avg per 10 Min", category: average },
            ];

            const promises = statMapping.map((stat) => {
              return new Promise((resolve, reject) => {
                const statIndex = findStatIndex(
                  stat.category.quickplay,
                  stat.name
                );

                const value =
                  statIndex !== -1
                    ? stat.category.quickplay[statIndex].value
                    : "N/A";

                resolve({ name: stat.name, value: value });
              });
            });

            const statValues = await Promise.all(promises);

            const extraValues = [
              {
                name: "Most multikills",
                value: `${top_heroes.quickplay.multikill_best[0].hero} (${top_heroes.quickplay.multikill_best[0].multikill_best})`,
              },
              {
                name: "Most eliminations per life",
                value: `${top_heroes.quickplay.eliminations_per_life[0].hero} (${top_heroes.quickplay.eliminations_per_life[0].eliminations_per_life})`,
              },
              {
                name: "Most games won",
                value: `${top_heroes.quickplay.games_won[0].hero} (${top_heroes.quickplay.games_won[0].games_won})`,
              },
              {
                name: "Most time played",
                value: `${top_heroes.quickplay.played[0].hero} (${top_heroes.quickplay.played[0].played})`,
              },
            ];

            extraValues.forEach((value) => {
              statValues.unshift(value);
            });

            const pages = [];
            for (let i = 0; i < statValues.length; i += 9) {
              pages.push(statValues.slice(i, i + 9));
            }

            pages[0].forEach((stat) => {
              embed.addFields({
                name: stat.name,
                value: stat.value,
                inline: true,
              });
            });

            let page = 0;
            const totalPages = pages.length;

            embed.setFooter({
              text: `${utils.texts.overwatch} | Page ${
                page + 1
              } of ${totalPages}`,
              iconURL: utils.footers.overwatch,
            });

            const button = createGameButtons("ow", false, false);

            const overwatchEmbed = await interaction.editReply({
              embeds: [embed],
              components: [button],
            });

            success = true;

            await bookmark(interaction);

            const collector = pageReact(interaction, overwatchEmbed);

            collector.on("collect", async (reaction, user) => {
              if (user.bot) return;

              await reaction.users.remove(user.id);

              if (reaction.emoji.name == "➡" && page < totalPages - 1) {
                page++;
              } else if (reaction.emoji.name == "⬅" && page !== 0) {
                --page;
              } else return;

              embed.setFields().setFooter({
                text: `${utils.texts.overwatch} | Page ${
                  page + 1
                } of ${totalPages}`,
                iconURL: utils.footers.overwatch,
              });

              pages[page].forEach((stat) => {
                embed.addFields({
                  name: stat.name,
                  value: stat.value,
                  inline: true,
                });
              });

              await interaction.editReply({ embeds: [embed] });
            });
          }
        });
      }
    }

    handleNonMusicalDeletion(interaction, success, 10);
  },
};
