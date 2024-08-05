const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const eventsModel = require("../../database/eventsModel");
const xpModel = require("../../database/xpModel");
const utils = require("../../utils/main/mainUtils");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("xp")
    .setDescription(`${utils.tags.updated} ${utils.tags.mod} Change XP rate of this server`)
    .addIntegerOption((option) =>
      option
        .setName("rate")
        .setDescription("Input a number to set as XP rate")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction) {
    let success = false;
    const { options, guildId } = interaction;
    const rate = options.getInteger("rate");

    const eventsList = await eventsModel.findOne({
      guildId,
      Level: true,
    });

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (!eventsList) {
      errorHandler.handleDisabledError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      const xpProfile = await xpModel.findOneAndUpdate(
        {
          guildId,
        },
        {
          basexp: rate,
        },
        { upsert: true }
      );

      console.log(
        `${utils.consoleTags.app} Base XP of ${interaction.guild.name} server has been set to ${xpProfile.basexp} by ${interaction.user.username}`
      );

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.level)
        .setDescription(
          `XP rate of this server has been set to ${xpProfile.basexp}`
        )
        .setColor(utils.colors.default);

      await interaction.editReply({
        embeds: [embed],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, 10);
  },
};
