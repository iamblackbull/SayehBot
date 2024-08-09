const { EmbedBuilder, ActionRowBuilder } = require("discord.js");
const { mongoose } = require("mongoose");
const eventsModel = require("../../database/eventsModel");
const channelModel = require("../../database/channelModel");
const videoModel = require("../../database/videoModel");
const utils = require("../../utils/main/mainUtils");
const { createUrlButton } = require("../../utils/main/createButtons");
const { videoPresence } = require("../../utils/main/handlePresence");
const { consoleTags } = require("../../utils/main/mainUtils");
const Parser = require("rss-parser");

const parser = new Parser();
const notifiedChannels = new Set();

module.exports = (client) => {
  client.checkVideo = async () => {
    if (mongoose.connection.readyState !== 1) return;

    const guild = await client.guilds.fetch(process.env.guildID);
    if (!guild) return;

    const eventsList = await eventsModel.findOne({
      guildId: guild.id,
      Video: true,
    });
    if (!eventsList) return;

    const channelsList = await channelModel.findOne({
      guildId: guild.id,
    });
    if (!channelsList) return;

    const channelId = channelsList.videoId;
    if (!channelId) return;

    const channel = await guild.channels.fetch(channelId);
    if (!channel) return;

    try {
      const dataSayeh = await parser.parseURL(
        `https://youtube.com/feeds/videos.xml?channel_id=${process.env.YOUTUBE_SAYEH_CHANNEL_ID}`
      );

      const dataHamid = await parser.parseURL(
        `https://youtube.com/feeds/videos.xml?channel_id=${process.env.YOUTUBE_HAMID_CHANNEL_ID}`
      );

      let videoListSayeh = await videoModel.findOne({
        guild: guild.id,
        Channel: "Sayeh",
      });

      let videoListHamid = await videoModel.findOne({
        guild: guild.id,
        Channel: "Hamid",
      });

      if (!videoListSayeh) {
        videoListSayeh = new videoModel({
          guild: guild.id,
          Channel: "Sayeh",
          VideoId: dataSayeh.items[0].id,
        });

        return await videoListSayeh.save();
      }

      if (!videoListHamid) {
        videoListHamid = new videoModel({
          guild: guild.id,
          Channel: "Hamid",
          VideoId: dataHamid.items[0].id,
        });

        return await videoListHamid.save();
      }

      let page;
      if (videoListSayeh.VideoId !== dataSayeh.items[0].id) page = "Sayeh";
      else if (videoListHamid.VideoId !== dataHamid.items[0].id) page = "Hamid";
      else return;

      if (notifiedChannels.has(page)) return;
      notifiedChannels.add(page);

      const data = page === "Sayeh" ? dataSayeh : dataHamid;

      videoListSayeh = await videoModel.updateOne(
        { guild: guild.id, Channel: page },
        {
          VideoId: data.items[0].id,
        }
      );

      const { title, link, id, author } = data.items[0];

      const thumbnailId = id.slice(9);
      const image = `https://img.youtube.com/vi/${thumbnailId}/maxresdefault.jpg`;

      const iconURL =
        page === "Sayeh"
          ? utils.thumbnails.twitch_sayeh
          : utils.thumbnails.twitch_hamid;

      const url =
        page === "Sayeh" ? utils.urls.youtube_sayeh : utils.urls.youtube_hamid;

      videoPresence(client);

      const embed = new EmbedBuilder()
        .setAuthor({
          name: author,
          iconURL,
          url,
        })
        .setTitle(`**${title}**`)
        .setURL(link)
        .setDescription(`${page} published a video on YouTube!`)
        .setColor(utils.colors.youtube)
        .setTimestamp(Date.now())
        .setImage(image)
        .setThumbnail(iconURL)
        .setFooter({
          iconURL: utils.footers.youtube,
          text: utils.texts.youtube,
        });

      const announcement = `Hey ${utils.tag}\n**${page}** just published a new video! 😍🔔\n\n## ${title}\n\n${link}`;

      const { urlButton } = createUrlButton(utils.labels.video, link);
      const button = new ActionRowBuilder().addComponents(urlButton);

      const msg = await channel.send({
        content: announcement,
      });

      setTimeout(async () => {
        await msg?.edit({
          embeds: [embed],
          components: [button],
        });
      }, 2_000);

      console.log(
        `${consoleTags.notif} ${page} just published a new video on YouTube!`
      );

      setTimeout(() => {
        notifiedChannels.delete(page);
      }, 600_000);
    } catch (error) {
      console.error(
        `${consoleTags.error} While fetching youtube notification data: `,
        error
      );
    }
  };
};
