const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const utils = require("../../utils/main/mainUtils");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("social")
    .setDescription("Follow Sayeh's social medias"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle(utils.titles.website)
      .setDescription("Follow Sayeh on social media!")
      .setFields(
        { name: utils.texts.twitch, value: "Sayeh", inline: true },
        { name: utils.texts.kick, value: "Sayeh", inline: true },
        { name: utils.texts.youtube, value: "@Say3h", inline: true },
        { name: utils.texts.telegram, value: "@sayeh_game", inline: true },
        { name: utils.texts.instagram, value: "@sayeh_game", inline: true },
        { name: utils.texts.website, value: "sayehgame.com", inline: true }
      )
      .setColor(utils.colors.default)
      .setURL(utils.urls.website)
      .setThumbnail(utils.thumbnails.twitch_sayeh)
      .setFooter({
        iconURL: utils.footers.tools,
        text: utils.texts.tools,
      });

    const twitchButton = new ButtonBuilder()
      .setLabel(utils.texts.twitch)
      .setURL(utils.urls.twitch_sayeh)
      .setStyle(ButtonStyle.Link);
    const youtubeButton = new ButtonBuilder()
      .setLabel(utils.texts.youtube)
      .setURL(utils.urls.youtube_sayeh)
      .setStyle(ButtonStyle.Link);
    const instagramButton = new ButtonBuilder()
      .setLabel(utils.texts.instagram)
      .setURL(utils.urls.instagram)
      .setStyle(ButtonStyle.Link);

    const button = new ActionRowBuilder()
      .addComponents(twitchButton)
      .addComponents(youtubeButton)
      .addComponents(instagramButton);

    await interaction.reply({
      embeds: [embed],
      components: [button],
    });

    handleNonMusicalDeletion(interaction, true, 10);
  },
};
