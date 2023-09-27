require("dotenv").config();
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { youtubeChannelID, guildID } = process.env;
const chalk = require("chalk");
const Parser = require("rss-parser");
const parser = new Parser();
const { mongoose } = require("mongoose");
const video = require("../../schemas/video-schema");

const notifiedChannels = new Set();

module.exports = (client) => {
  client.checkVideo = async () => {
    if (mongoose.connection.readyState !== 1) return;
    try {
      const data = await parser
        .parseURL(
          "https://youtube.com/feeds/videos.xml?channel_id=UCRyvm_KWqZxQio5EOES5NQw"
        )
        .catch(console.error);

      const guild = await client.guilds.fetch(guildID).catch(console.error);

      let videoList = await video.findOne({
        guild: guild.id,
      });
      if (!videoList) {
        videoList = new video({
          guild: guild.id,
          VideoId: data.items[0].id,
        });
        await videoList.save().catch(console.error);
      }

      if (videoList.VideoId !== data.items[0].id) {
        if (notifiedChannels.has("sayeh")) return;
        notifiedChannels.add("sayeh");

        videoList = await video.updateOne(
          { guild: guild.id },
          {
            VideoId: data.items[0].id,
          }
        );

        const channel = await guild.channels
          .fetch(youtubeChannelID)
          .catch(console.error);

        const { title, link, id, author } = data.items[0];

        const embed = new EmbedBuilder({
          title: `**${title}**`,
          url: link,
          description: `Sayeh published a video on YouTube!`,
          color: 0xff0000,
          timestamp: Date.now(),
          thumbnail: {
            url: `https://cdn.discordapp.com/attachments/760838336205029416/1089626902832107590/934476feaab28c0f586b688264b50041.webp`,
          },
          image: {
            url: `https://img.youtube.com/vi/${id.slice(9)}/maxresdefault.jpg`,
          },
          author: {
            name: author,
            iconURL: `https://cdn.discordapp.com/attachments/760838336205029416/1089626902832107590/934476feaab28c0f586b688264b50041.webp`,
            url: "https://youtube.com/c/Sayehh/?sub_confirmation=1",
          },
          footer: {
            iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
            text: `YouTube`,
          },
        });

        const youtubeButton = new ButtonBuilder()
          .setLabel(`Watch Video`)
          .setURL(`${link}`)
          .setStyle(ButtonStyle.Link);

        console.log(`Sayeh just published a new video on YouTube!`);

        setTimeout(async () => {
          await channel
            .send({
              embeds: [embed],
              content: `Hey @everyone\n**Sayeh** just published a new video! 😍🔔\n\n## ${title}\n\n${link}`,
              components: [new ActionRowBuilder().addComponents(youtubeButton)],
            })
            .catch(console.error);

          setTimeout(() => {
            notifiedChannels.delete("sayeh");
          }, 10 * 60 * 1000);
        }, 1 * 1000);
      }
    } catch (error) {
      console.log(chalk.red(`Connection to YouTube API failed...`));
    }
  };
};
