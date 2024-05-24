const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  Events,
} = require("discord.js");
const { mongoose } = require("mongoose");
const { handleDatabaseError } = require("../../utils/main/handleErrors");
const utils = require("../../utils/main/mainUtils");
const eventsModel = require("../../database/eventsModel");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("events")
    .setDescription("Enable or disable available events of the bot.")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Select the event you want to manage.")
        .setRequired(true)
        .addChoices(
          {
            name: "Welcome",
            value: Events.GuildMemberAdd,
          },
          {
            name: "Leave",
            value: Events.GuildMemberRemove,
          },
          {
            name: "Boost",
            value: Events.GuildMemberUpdate,
          },
          {
            name: "Birthday",
            value: "birthday",
          },
          {
            name: "Stream",
            value: "stream",
          },
          {
            name: "Video",
            value: "video",
          },
          {
            name: "Level",
            value: "level",
          },
          {
            name: "Moderation",
            value: "moderation",
          },
          {
            name: "All",
            value: "all",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription(
          "Select which action you want to perform on your selected event."
        )
        .setRequired(true)
        .addChoices(
          {
            name: "Enable",
            value: "enable",
          },
          {
            name: "Disable",
            value: "disable",
          }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    if (mongoose.connection.readyState !== 1) {
      handleDatabaseError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      let success = false;

      const type = interaction.options.get("type").value;
      const enable =
        interaction.options.get("action").value === "enable" ? true : false;

      let update;
      switch (type) {
        case Events.GuildMemberAdd:
          update = { MemberAdd: enable };
          break;
        case Events.GuildMemberRemove:
          update = { MemberRemove: enable };
          break;
        case Events.GuildMemberUpdate:
          update = { MemberUpdate: enable };
          break;
        case "birthday":
          update = { Birthday: enable };
          break;
        case "stream":
          update = { Stream: enable };
          break;
        case "video":
          update = { Video: enable };
          break;
        case "level":
          update = { Level: enable };
          break;
        case "moderation":
          update = { Moderation: enable };
          break;
        case "all":
          update = {
            MemberAdd: enable,
            MemberRemove: enable,
            MemberUpdate: enable,
            Birthday: enable,
            Stream: enable,
            Video: enable,
            Level: enable,
            Moderation: enable,
          };
          break;

        default:
          update = false;
          break;
      }

      if (update) {
        await eventsModel.findOneAndUpdate(
          {
            guildId: interaction.guildId,
          },
          update,
          {
            upsert: true,
          }
        );
      }

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.events)
        .setDescription(
          `Event has been successfully ${enable ? "enabled" : "disabled"}.`
        )
        .setThumbnail(utils.thumbnails.success)
        .setColor(utils.colors.default)
        .setFooter({
          text: utils.texts.bot,
          iconURL: utils.footers.bot,
        });

      await interaction.editReply({
        embeds: [embed],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, undefined, 5);
  },
};
