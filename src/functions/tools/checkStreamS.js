// const { EmbedBuilder, ActionRowBuilder } = require("discord.js");
// const { mongoose } = require("mongoose");
// const stream = require("../../schemas/stream-schema");
// const streamHandler = require("../../utils/api/handleStream");
// const { createUrlButton } = require("../../utils/main/createButtons");
// const presenceHandler = require("../../utils/main/handlePresence");
// const utils = require("../../utils/main/mainUtils");

// let presence = false;
// let notified = false;
// let msg = false;
// let embed = false;
// let announce;
// let category;
// let Title;

// const notifiedChannels = new Set();

// module.exports = (client) => {
//   client.checkStreamS = async () => {
//     try {
//       if (mongoose.connection.readyState !== 1) return;

//       const guild = await client.guilds.fetch(process.env.guildID);
//       const channel = await guild.channels.fetch(process.env.streamChannelID);
//       if (!guild || !channel) return;

//       const streamerId = "sayeh";
//       const url = `https://twitch.tv/${streamerId}`;

//       const { result } = await streamHandler.getStreamData(streamerId);

//       let streamList = await stream.findOne({
//         guild: guild.id,
//         Streamer: streamerId,
//       });

//       if (!streamList) {
//         streamList = new stream({
//           guild: guild.id,
//           Streamer: streamerId,
//           IsLive: false,
//         });
//         await streamList.save().catch(console.error);
//       }

//       if (result !== undefined && result.type === "live") {
//         if (!streamList.IsLive && !notifiedChannels.has(streamerId)) {
//           notifiedChannels.add(streamerId);

//           const { title, viewer_count, game_name, user_name } = result;

//           embed = new EmbedBuilder()
//             .setAuthor({
//               name: `${user_name}`,
//               iconURL: utils.thumbnails.twitch_sayeh,
//               url: url,
//             })
//             .setTitle(`**${title}**`)
//             .setURL(url)
//             .setDescription(
//               `Streaming **${
//                 game_name || `Just Chatting`
//               }** for ${viewer_count} viewers`
//             )
//             .setThumbnail(utils.thumbnails.twitch_sayeh)
//             .setImage(result.getThumbnailUrl())
//             .setColor(utils.colors.twitch)
//             .setTimestamp(Date.now())
//             .setFooter({
//               iconURL: utils.footers.twitch,
//               text: utils.texts.twitch,
//             });

//           announce = `Hey ${utils.tag}\n**${user_name}** is now LIVE on Twitch! 😍🔔\n\n## ${title}\n\n${url}`;

//           const { urlButton } = createUrlButton(utils.labels.stream, url);
//           const button = new ActionRowBuilder().addComponents(urlButton);

//           msg = await channel
//             .send({
//               content: announce,
//             })
//             .catch(console.error);

//           setTimeout(async () => {
//             await msg?.edit({
//               embeds: [embed],
//               components: [button],
//             });
//           }, 2 * 1000);

//           category = game_name;
//           Title = title;
//           notified = true;

//           console.log(`${user_name} is now live on Twitch!`);

//           presenceHandler.streamPresence(client, title, user_name);
//           presence = true;

//           streamList = await stream.updateOne(
//             {
//               guild: guild.id,
//               Streamer: streamerId,
//             },
//             { IsLive: true }
//           );
//         } else {
//           const { title, viewer_count, game_name, user_name } = result;

//           if (!presence || Title !== title) {
//             presenceHandler.streamPresence(client, title, user_name);
//             presence = true;
//           }

//           if (msg && embed) {
//             if (Title !== title) {
//               Title = title;

//               embed.setTitle(`**${title}**`);

//               announce = `Hey ${utils.tag}\n**${user_name}** is now LIVE on Twitch! 😍🔔\n\n## ${title}\n\n${url}`;

//               await msg.edit({
//                 embeds: [embed],
//                 content: announce,
//               });
//             }

//             if (category !== game_name) {
//               category = game_name;

//               embed
//                 .setDescription(
//                   `Streaming **${
//                     game_name || `Just Chatting`
//                   }** for ${viewer_count} viewers`
//                 )
//                 .setImage(result.getThumbnailUrl());

//               await msg.edit({
//                 embeds: [embed],
//                 content: announce,
//               });
//             }
//           }
//         }
//       } else if (streamList.IsLive === true) {
//         notifiedChannels.delete(streamerId);

//         streamList = await stream.updateOne(
//           {
//             guild: guild.id,
//             Streamer: streamerId,
//           },
//           { IsLive: false }
//         );

//         if (notified && msg && embed) {
//           embed.setImage(utils.thumbnails.twitch_offline_sayeh);

//           announce = `${streamerId} has gone offline. 😢`;

//           await msg.edit({
//             embeds: [embed],
//             content: announce,
//             components: [],
//           });
//         }

//         presenceHandler.mainPresence(client);

//         console.log(`${streamerId} has gone offline.`);
//       }
//     } catch (error) {
//       return console.error(
//         "Error while processing Twitch notification:",
//         error
//       );
//     }
//   };
// };
