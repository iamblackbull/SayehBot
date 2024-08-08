const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { maxLevel, XPreqs } = require("../../utils/level/cardUtils");
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
                name: "Grant",
                value: "granted",
              },
              {
                name: "Take",
                value: "taken",
              }
            )
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Input the amount of levels")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(maxLevel)
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
                name: "Grant",
                value: "granted",
              },
              {
                name: "Take",
                value: "taken",
              }
            )
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Input the amount of xp")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(XPreqs[maxLevel - 1])
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
    let mode = false;

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
          mode = await adjustLevel(interaction, amount, action);
          break;

        case "xp":
          mode = await adjustXp(interaction, amount, action);
          break;

        ////////////// handling default subcommad just in case //////////////
        default: {
          console.error(
            `${utils.consoleTags.error} Something went wrong while executing ${interaction.commandName} ${sub} command.`
          );
        }
      }

      if (!mode) {
        errorHandler.handleXpError(interaction, target);
      } else {
        const embed = new EmbedBuilder()
          .setTitle(utils.titles.level)
          .setDescription(`**${amount} ${sub}** ${mode} ${target}.`)
          .setColor(utils.colors.default);

        await interaction.editReply({
          embeds: [embed],
        });

        success = true;
      }
    }

    handleNonMusicalDeletion(interaction, success, 10);
  },
};
