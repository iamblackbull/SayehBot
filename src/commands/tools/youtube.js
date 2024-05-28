const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const youtubeHandler = require("../../utils/api/youtubeData");
const { handleNoResultError } = require("../../utils/main/handleErrors");
const utils = require("../../utils/main/mainUtils");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("youtube")
    .setDescription(`${utils.tags.new} Get info about a youtube channel`)
    .addStringOption((option) =>
      option
        .setName("channel")
        .setDescription("Input a youtube channel name")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;
    const channel = interaction.options.getString("channel");

    const channelId = await youtubeHandler.getChannelId(channel);

    if (!channelId) {
      await handleNoResultError(interaction);
    } else {
      const channelData = await youtubeHandler.getChannelData(channelId);
      const videos = await youtubeHandler.getLatestVideos(channelId, 5);

      const videoList = videos
        .map((video, i) => {
          return `**${i + 1}.** **[${
            video.snippet.title
          }](https://www.youtube.com/watch?v=${video.id.videoId})**`;
        })
        .join("\n");

      const title = channelData.brandingSettings.channel.title;
      const url = `https://youtube.com/channel/${channelData.id}`;
      const subCount = `**${channelData.statistics.subscriberCount}** subscribers`;
      const viewCount = `**${channelData.statistics.viewCount}** views`;
      const videoCount = `**${channelData.statistics.videoCount}** videos`;
      const channelDescription =
        channelData.brandingSettings.channel.description || "";

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setURL(url)
        .setDescription(
          `${subCount}\n${viewCount}\n${videoCount}\n\n${channelDescription}\n\n### Latest Videos :\n${videoList}`
        )
        .setColor(utils.colors.youtube)
        .setThumbnail(channelData.snippet.thumbnails.high.url)
        .setImage(channelData.brandingSettings.image.bannerExternalUrl)
        .setFooter({
          text: utils.texts.youtube,
          iconURL: utils.footers.youtube,
        });

      await interaction.editReply({
        embeds: [embed],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, undefined, 5);
  },
};
