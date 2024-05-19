const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const utils = require("../../utils/main/mainUtils");
const errorHandler = require("../../utils/main/handleErrors");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Update the bot's avatar or banner")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Select wheter to update avatar or banner")
        .setRequired(true)
        .addChoices(
          {
            name: "Avatar",
            value: "avatar",
          },
          {
            name: "Banner",
            value: "banner",
          }
        )
    )
    .addAttachmentOption((option) =>
      option
        .setName("file")
        .setDescription(`Upload the image file (${utils.formatsLabel})`)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;

    const type = interaction.options.get("type").value;
    const file = interaction.options.getAttachment("file");

    if (!utils.formats.includes(file.contentType)) {
      await errorHandler.handleFileFormatError(interaction);
    } else {
      try {
        if (type == "avatar") {
          await client.user.setAvatar(file.url);
        } else if (type == "banner") {
          await client.user.setBanner(file.url);
        }

        const embed = new EmbedBuilder()
          .setTitle(utils.titles.profile)
          .setDescription(`Bot's ${type} has been updated.`)
          .setColor(utils.colors.default)
          .setThumbnail(file.url)
          .setFooter({
            text: utils.texts.moderation,
            iconURL: utils.footers.moderation,
          });

        console.log(`${interaction.user.username} updated bot's ${type}.`);

        success = true;

        await interaction.editReply({
          embeds: [embed],
        });
      } catch (error) {
        console.error("Error while updating bot's profile: ", error);

        if (error.message.includes("File cannot be larger")) {
          await errorHandler.handleLargeFileError(interaction);
        } else if (error.message.includes("changing your avatar too fast")) {
          await errorHandler.handleRateLimitError(interaction);
        } else {
          await errorHandler.handleUnknownError(interaction);
        }
      }
    }

    handleNonMusicalDeletion(interaction, success, undefined, 5);
  },
};
