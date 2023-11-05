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

      if (videoList.VideoId === data.items[0].id) return;
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

      const thumbnailId = id.slice(9);
      const image = `https://img.youtube.com/vi/${thumbnailId}/maxresdefault.jpg`;

      const embed = new EmbedBuilder()
        .setTitle(`**${title}**`)
        .setURL(link)
        .setAuthor({
          name: author,
          iconURL:
            "https://cdn.discordapp.com/attachments/760838336205029416/1089626902832107590/934476feaab28c0f586b688264b50041.webp",
          url: "https://youtube.com/c/Sayehh/?sub_confirmation=1",
        })
        .setDescription(`Sayeh published a video on YouTube!`)
        .setColor(0xff0000)
        .setTimestamp(Date.now())
        .setImage(image)
        .setThumbnail(
          "https://cdn.discordapp.com/attachments/760838336205029416/1089626902832107590/934476feaab28c0f586b688264b50041.webp"
        )
        .setFooter({
          iconURL: `https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/395_Youtube_logo-256.png`,
          text: "YouTube",
        });

      const Content = `Hey @everyone\n**Sayeh** just published a new video! 😍🔔\n\n## ${title}\n\n${link}`;

      const youtubeButton = new ButtonBuilder()
        .setLabel(`Watch Video`)
        .setURL(`${link}`)
        .setStyle(ButtonStyle.Link);

      const button = new ActionRowBuilder().addComponents(youtubeButton);

      console.log(`Sayeh just published a new video on YouTube!`);

      const msg = await channel
        .send({
          content: Content,
        })
        .catch(console.error);

      setTimeout(async () => {
        await msg?.edit({
          embeds: [embed],
          components: [button],
        });
      }, 2 * 1000);

      setTimeout(() => {
        notifiedChannels.delete("sayeh");
      }, 10 * 60 * 1000);
    } catch (error) {
      console.log(chalk.red(`Connection to YouTube API failed...`));
    }
  };
};
