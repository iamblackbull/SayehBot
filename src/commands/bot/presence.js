const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { mongoose } = require("mongoose");
const utils = require("../../utils/main/mainUtils");
const errorHandler = require("../../utils/main/handleErrors");
const streamModel = require("../../database/streamModel");
const presenceModel = require("../../database/presenceModel");
const { customPresence } = require("../../utils/main/handlePresence");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("presence")
    .setDescription(`${utils.tags.mod} Customize the presence of the bot`)
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Choose the type of the presence")
        .setRequired(true)
        .addChoices(
          {
            name: "Playing",
            value: "0",
          },
          {
            name: "Listening",
            value: "2",
          },
          {
            name: "Watching",
            value: "3",
          },
          {
            name: "Competing",
            value: "5",
          },
          {
            name: "Custom",
            value: "4",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Input the name of the presence")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("Choose the status of the bot")
        .setRequired(true)
        .addChoices(
          {
            name: "Online",
            value: "online",
          },
          {
            name: "Idle",
            value: "idle",
          },
          {
            name: "Do Not Disturb",
            value: "dnd",
          }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    let success = false;

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else {
      const streamList = await streamModel.findOne({
        IsLive: true,
      });

      if (streamList) {
        errorHandler.handleStreamModeError(interaction);
      } else {
        await interaction.deferReply({
          fetchReply: true,
        });

        const { options, guild, user } = interaction;
        const type = options.get("type").value;
        const name = options.getString("name");
        const status = options.get("status").value;

        const typeNum = parseInt(type);

        customPresence(client, name, typeNum, status);

        const embed = new EmbedBuilder()
          .setTitle(utils.titles.presence)
          .setDescription("Bot's presence has been updated successfully.")
          .setColor(utils.colors.default)
          .setThumbnail(utils.thumbnails.success)
          .setFooter({
            text: utils.texts.bot,
            iconURL: utils.footers.bot,
          });

        await interaction.editReply({
          embeds: [embed],
        });

        success = true;

        let presenceList = await presenceModel.findOne({
          GuildId: guild.id,
        });

        if (!presenceList) {
          presenceList = new presenceModel({
            GuildId: guild.id,
            Author: user.globalName,
            Name: name,
            Type: typeNum,
            Status: status,
          });

          await presenceList.save().catch(console.error);
        } else {
          presenceList = await presenceModel.updateOne(
            {
              GuildId: guild.id,
            },
            {
              Author: user.globalName,
              Name: name,
              Type: typeNum,
              Status: status,
            }
          );
        }

        console.log(
          `${utils.consoleTags.app} ${user.username} updated bot's presence: ${typeNum} - ${name} - ${status}`
        );
      }
    }
    handleNonMusicalDeletion(interaction, success, undefined, 5);
  },
};
