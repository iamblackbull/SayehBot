const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const eventsModel = require("../../database/eventsModel");
const utils = require("../../utils/main/mainUtils");
const { adjustLevel, adjustXp } = require("../../utils/level/handleLevel");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adjust")
    .setDescription("Adjust user level or XP")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("level")
        .setDescription(`${utils.tags.new} ${utils.tags.mod} Adjust user level`)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Pick a member to adjust their level")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Select which action to perform")
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
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Input the amount of levels")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("xp")
        .setDescription(`${utils.tags.new} ${utils.tags.mod} Adjust user xp`)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Pick a member to adjust their xp")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Select which action to perform")
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
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Input the amount of xp")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction) {
    let success = false;
    const { options, guildId } = interaction;
    const sub = options.getSubcommand();

    const target = options.getUser("user");
    const action = options.get("action").value;
    const amount = options.getInteger("amount");
    let actionLabel;

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

      switch (sub) {
        case "level":
          actionLabel = await adjustLevel(interaction, amount, action);
          break;

        case "xp":
          actionLabel = await adjustXp(interaction, amount, action);
          break;

        ////////////// handling default subcommad just in case //////////////
        default: {
          console.error(
            `${utils.consoleTags.error} Something went wrong while executing ${interaction.commandName} ${sub} command.`
          );
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.level)
        .setDescription(`**${amount} ${sub}** ${actionLabel} ${target}.`)
        .setColor(utils.colors.default);

      await interaction.editReply({
        embeds: [embed],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, 10);
  },
};
