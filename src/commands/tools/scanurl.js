const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { scan } = require("../../utils/api/scanUrlApi");
const { handleAPIError } = require("../../utils/main/handleErrors");
const utils = require("../../utils/main/mainUtils");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("scanurl")
    .setDescription(`${utils.tags.new} Scan a url for viruses`)
    .addStringOption((option) =>
      option.setName("url").setDescription("Input a url").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true,
    });

    let success = false;
    const url = interaction.options.getString("url", true);

    const { virus, result } = await scan(url);

    if (result == "error") await handleAPIError(interaction);
    else {
      const embed = new EmbedBuilder()
        .setTitle(utils.titles.scan)
        .setDescription(result)
        .setThumbnail(virus ? utils.thumbnails.virus : utils.thumbnails.success)
        .setColor(virus ? utils.colors.error : utils.colors.default)
        .setFooter({
          text: utils.texts.tools,
          iconURL: utils.footers.tools,
        });

      await interaction.editReply({
        embeds: [embed],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, undefined, 5);
  },
};
