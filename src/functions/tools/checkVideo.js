const { EmbedBuilder, ActionRowBuilder } = require("discord.js");
const { mongoose } = require("mongoose");
const video = require("../../schemas/video-schema");
const { createUrlButton } = require("../../utils/main/createButtons");
const { footers, colors, texts } = require("../../utils/player/musicUtils");
const { tag, thumbnails, urls, labels } = require("../../utils/main/mainUtils");
const Parser = require("rss-parser");
const parser = new Parser();

const notifiedChannels = new Set();

module.exports = (client) => {
  client.checkVideo = async () => {
    if (mongoose.connection.readyState !== 1) return;

    const guild = await client.guilds.fetch(process.env.guildID);
    const channel = await guild.channels.fetch(process.env.youtubeChannelID);
    if (!guild || !channel) return;

    try {
      const dataSayeh = await parser
        .parseURL(
          `https://youtube.com/feeds/videos.xml?channel_id=${process.env.YOUTUBE_SAYEH_CHANNEL_ID}`
        )
        .catch(console.error);

      const dataHamid = await parser
        .parseURL(
          `https://youtube.com/feeds/videos.xml?channel_id=${process.env.YOUTUBE_HAMID_CHANNEL_ID}`
        )
        .catch(console.error);

      let videoListSayeh = await video.findOne({
        guild: guild.id,
        Channel: "Sayeh",
      });

      let videoListHamid = await video.findOne({
        guild: guild.id,
        Channel: "Hamid",
      });

      if (!videoListSayeh) {
        videoListSayeh = new video({
          guild: guild.id,
          Channel: "Sayeh",
          VideoId: dataSayeh.items[0].id,
        });

        return await videoListSayeh.save().catch(console.error);
      }

      if (!videoListHamid) {
        videoListHamid = new video({
          guild: guild.id,
          Channel: "Hamid",
          VideoId: dataHamid.items[0].id,
        });

        return await videoListHamid.save().catch(console.error);
      }

      let page;

      if (videoListSayeh.VideoId !== dataSayeh.items[0].id) page = "Sayeh";
      else if (videoListHamid.VideoId !== dataHamid.items[0].id) page = "Hamid";
      else return;

      if (notifiedChannels.has(page)) return;

      notifiedChannels.add(page);

      const data = page === "Sayeh" ? dataSayeh : dataHamid;

      videoListSayeh = await video.updateOne(
        { guild: guild.id, Channel: page },
        {
          VideoId: data.items[0].id,
        }
      );

      const { title, link, id, author } = data.items[0];

      const thumbnailId = id.slice(9);
      const image = `https://img.youtube.com/vi/${thumbnailId}/maxresdefault.jpg`;

      const iconURL =
        page === "Sayeh" ? thumbnails.twitch_sayeh : thumbnails.twitch_hamid;

      const url = page === "Sayeh" ? urls.youtube_sayeh : urls.youtube_hamid;

      const embed = new EmbedBuilder()
        .setTitle(`**${title}**`)
        .setURL(link)
        .setAuthor({
          name: author,
          iconURL,
          url,
        })
        .setDescription(`${page} published a video on YouTube!`)
        .setColor(colors.youtube)
        .setTimestamp(Date.now())
        .setImage(image)
        .setThumbnail(iconURL)
        .setFooter({
          iconURL: footers.youtube,
          text: texts.youtube,
        });

      const Content = `Hey ${tag}\n**${page}** just published a new video! 😍🔔\n\n## ${title}\n\n${link}`;

      const { urlButton } = createUrlButton(labels.video, link);
      const button = new ActionRowBuilder().addComponents(urlButton);

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

      console.log(`${page} just published a new video on YouTube!`);

      setTimeout(() => {
        notifiedChannels.delete(page);
      }, 10 * 60 * 1000);
    } catch (error) {
      console.log("Connection to YouTube API failed...");
    }
  };
};
