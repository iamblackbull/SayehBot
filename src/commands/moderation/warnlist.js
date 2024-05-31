const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const warnModel = require("../../database/warnModel");
const utils = require("../../utils/main/mainUtils");
const { pageReact } = require("../../utils/main/handleReaction");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnlist")
    .setDescription(
      `${utils.tags.mod} View a list of users and their warn records`
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    let success = false;
    const { guild } = interaction;

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else {
      const warnEmbed = await interaction.deferReply({
        fetchReply: true,
      });

      const warnings = await warnModel
        .find({ guildId: guild.id })
        .sort({ Warns: -1 });

      let page = 0;
      let totalPages = 0;
      let warnArray;

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.warnlist)
        .setColor(utils.colors.warning)
        .setFooter({
          text: utils.texts.moderation,
          iconURL: utils.footers.moderation,
        });

      if (warnings.length === 0) {
        embed.setDescription("No warned users found for this server.");
      } else {
        const warnList = warnings
          .map((warning, index) => {
            return `**${index + 1}.** ${warning.Username} (**${
              warning.Warns
            }** Warns)`;
          })
          .join("\n");

        warnArray = warnList.split("\n");

        totalPages =
          warnArray.length > 10 ? Math.ceil(warnArray.length / 10) : 1;

        const slicedArray = warnArray
          .slice(page * 10, page * 10 + 10)
          .join("\n");

        embed.setDescription(slicedArray);

        if (totalPages > 1) {
          embed.setFooter({
            text: `Page ${page + 1} of ${totalPages}`,
            iconURL: utils.footers.page,
          });
        }
      }

      success = true;

      await interaction.editReply({
        embeds: [embed],
      });

      if (totalPages > 1) {
        const collector = pageReact(interaction, warnEmbed);

        collector.on("collect", async (reaction, user) => {
          if (user.bot) return;

          await reaction.users.remove(user.id);

          if (reaction.emoji.name === "➡" && page < totalPages - 1) {
            page++;
          } else if (reaction.emoji.name === "⬅" && page !== 0) {
            --page;
          } else return;

          const slicedArray = warnArray
            .slice(page * 10, page * 10 + 10)
            .join("\n");

          embed.setDescription(slicedArray).setFooter({
            text: `Page ${page + 1} of ${totalPages}`,
            iconURL: utils.footers.page,
          });

          await interaction.editReply({
            embeds: [embed],
          });
        });
      }
    }

    handleNonMusicalDeletion(interaction, success, undefined, 10);
  },
};
