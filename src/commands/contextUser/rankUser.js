const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  AttachmentBuilder,
} = require("discord.js");
const errorHandler = require("../../utils/main/handleErrors");
const { mongoose } = require("mongoose");
const { getUser } = require("../../utils/level/handleLevel");
const { generateCard } = require("../../utils/level/generateCard");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("get rank")
    .setType(ApplicationCommandType.User)
    .setDMPermission(false),

  async execute(interaction) {
    let success = false;
    const target = interaction.targetUser;
    const memberTarget = interaction.guild.members.cache.get(target.id);
    const levelProfile = await getUser(interaction.guild.id, target);

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (levelProfile.xp <= 0) {
      errorHandler.handleXpError(interaction, target);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      const canvas = await generateCard(target, memberTarget, levelProfile);

      const attachment = new AttachmentBuilder(canvas.toBuffer());

      interaction.editReply({
        files: [attachment],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, 10);
  },
};
