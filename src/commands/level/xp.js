const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const eventsModel = require("../../database/eventsModel");
const { handleInteractionCommand } = require("../../utils/level/handleLevel");
const utils = require("../../utils/main/mainUtils");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");
const Levels = require("discord-xp");

Levels.setURL(process.env.DBTOKEN);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("xp")
    .setDescription(`${utils.tags.mod} Manage user level and XP`)
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Select an action to perform")
        .setRequired(true)
        .addChoices(
          {
            name: "Give",
            value: "granted",
          },
          {
            name: "Take",
            value: "removed",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("unit")
        .setDescription("Select unit")
        .setRequired(true)
        .addChoices(
          {
            name: "Level",
            value: "level",
          },
          {
            name: "XP",
            value: "xp",
          }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Input the amount")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("Pick any member").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction) {
    let success = false;

    const { options, guild } = interaction;
    const target = options.getUser("user");
    const action = options.get("action").value;
    const unit = options.get("unit").value;
    const amount = options.getInteger("amount");
    const userLevel = await Levels.fetch(target.id, guild.id, true);

    const eventsList = await eventsModel.findOne({
      guildId: guild.id,
      Level: true,
    });

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (userLevel <= 0) {
      errorHandler.handleXpError(interaction, target);
    } else if (!eventsList) {
      errorHandler.handleDisabledError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      const { updatedAction, updatedUnit } = await handleInteractionCommand(
        interaction,
        amount,
        action,
        unit
      );

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.level)
        .setDescription(
          `**${amount} ${updatedUnit}** ${updatedAction} ${target}.`
        )
        .setColor(utils.colors.default);

      await interaction.editReply({
        embeds: [embed],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, undefined, 5);
  },
};
