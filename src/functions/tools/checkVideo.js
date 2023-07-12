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
const fs = require("fs");
const { mongoose } = require("mongoose");
const video = require("../../schemas/video-schema");
let connection;
let newVideo = false;

module.exports = (client) => {
  mongoose.connection.readyState === 1
    ? (connection = true)
    : (connection = false);
  client.checkVideo = async () => {
    try {
      const data = await parser
        .parseURL(
          "https://youtube.com/feeds/videos.xml?channel_id=UCRyvm_KWqZxQio5EOES5NQw"
        )
        .catch(console.error);

      const guild = await client.guilds.fetch(guildID).catch(console.error);
      const rawData = fs.readFileSync(`${__dirname}/../../json/video.json`);
      const jsonData = JSON.parse(rawData);

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

      if (connection === true) {
        if (videoList.VideoId !== data.items[0].id) {
          videoList = await video.updateOne(
            { guild: guild.id },
            {
              VideoId: data.items[0].id,
            }
          );
          if (jsonData.id === data.items[0].id) {
            return;
          } else {
            fs.writeFileSync(
              `${__dirname}/../../json/video.json`,
              JSON.stringify({ id: data.items[0].id })
            );
            newVideo = true;
          }
        } else {
          newVideo = false;
        }
      } else if (jsonData.id !== data.items[0].id) {
        fs.writeFileSync(
          `${__dirname}/../../json/video.json`,
          JSON.stringify({ id: data.items[0].id })
        );
        newVideo = true;
      } else {
        newVideo = false;
      }

      if (newVideo === true) {
        const channel = await guild.channels
          .fetch(youtubeChannelID)
          .catch(console.error);

        const { title, link, id, author } = data.items[0];
        const embed = new EmbedBuilder({
          title: title,
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
        console.log(`Sayeh just uploaded a new video on YouTube!`);
        await channel
          .send({
            embeds: [embed],
            content: `@everyone Sayeh just uploaded a new video! 😍🔔 \n**${title}** \n${link}`,
            components: [new ActionRowBuilder().addComponents(youtubeButton)],
          })
          .catch(console.error);
      } else return;
    } catch (error) {
      console.log(chalk.red(`Connection to YouTube API failed...`));
    }
  };
};
