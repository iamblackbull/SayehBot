const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { handleAPIError } = require("../../utils/main/handleErrors");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("qr")
    .setDescription("Create a QR code.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Input a query to create a QR code for.")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    let success = false;

    const query = interaction.options.getString("query", true);
    const convertedQuery = query.replace(/ /g, "_");

    const url = `https://api.qrserver.com/v1/create-qr-code/?data=${convertedQuery}&size=900x900`;

    const response = await axios
      .get(url, { responseType: "arraybuffer" })
      .catch(async (error) => {
        console.error("Error while fetching QR Code data: ", error);

        await handleAPIError(interaction);
      });

    const imageData = Buffer.from(response.data, "binary");

    const attachment = new AttachmentBuilder(imageData, "qr.png");

    await interaction.reply({
      files: [attachment],
    });

    success = true;

    handleNonMusicalDeletion(interaction, success, undefined, 5);
  },
};
