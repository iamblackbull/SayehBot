require("dotenv").config();
const chalk = require("chalk");
const TwitchAPI = require("node-twitch").default;
const {
  EmbedBuilder,
  ActivityType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const {
  streamChannelID,
  guildID,
  TWITCH_CLIENT_ID,
  TWTICH_CLIENT_SECRET,
  TWITCH_CLIENT_Oauth,
  TWITCH_CLIENT_REFRESH,
} = process.env;
const stream = require("../../schemas/stream-schema");
const { mongoose } = require("mongoose");

const twitch = new TwitchAPI({
  client_id: TWITCH_CLIENT_ID,
  client_secret: TWTICH_CLIENT_SECRET,
  access_token: TWITCH_CLIENT_Oauth,
  refresh_token: TWITCH_CLIENT_REFRESH,
});

let presence = false;
let notified = false;
let msg = false;
let Content;
let category;
let Title;
let embed;

const notifiedChannels = new Set();

module.exports = (client) => {
  client.checkStreamH = async () => {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await twitch.getStreams({ channel: ["hamiitz"] }).then(async (data) => {
        const result = data.data[0];
        const guild = await client.guilds.fetch(guildID).catch(console.error);
        const channel = await guild.channels
          .fetch(streamChannelID)
          .catch(console.error);

        let streamList = await stream.findOne({
          guild: guild.id,
          Streamer: "hamiitz",
        });

        if (!streamList) {
          streamList = new stream({
            guild: guild.id,
            Streamer: "hamiitz",
            IsLive: false,
          });
          await streamList.save().catch(console.error);
        }

        if (result !== undefined && result.type === "live") {
          if (!streamList.IsLive && !notifiedChannels.has("hamiitz")) {
            const { title, viewer_count, game_name, user_name } = data.data[0];

            embed = new EmbedBuilder()
              .setTitle(`**${title}**` || null)
              .setURL(`https://www.twitch.tv/${user_name}`)
              .setDescription(
                `Streaming **${
                  game_name || `Just Chatting`
                }** for ${viewer_count} viewers`
              )
              .setColor(0x8d25c4)
              .setTimestamp(Date.now())
              .setThumbnail(
                `https://static-cdn.jtvnw.net/jtv_user_pictures/db6f2412-a9b6-4cfd-9cae-9f7c3819bb15-profile_image-150x150.png`
              )
              .setImage(
                `https://static-cdn.jtvnw.net/previews-ttv/live_user_${user_name.toLowerCase()}-1920x1080.jpg?NgOqCvLCECvrHGtf=1`
              )
              .setAuthor({
                name: `${user_name}`,
                iconURL: `https://static-cdn.jtvnw.net/jtv_user_pictures/db6f2412-a9b6-4cfd-9cae-9f7c3819bb15-profile_image-150x150.png`,
                url: `https://www.twitch.tv/${user_name}`,
              })
              .setFooter({
                iconURL: `https://cdn.icon-icons.com/icons2/3041/PNG/512/twitch_logo_icon_189242.png`,
                text: `Twitch`,
              });

            Content = `Hey @everyone\n **${user_name}** is now LIVE on Twitch! 😍🔔\n❖ ──・──・──・──・──・── ❖\n!استریم داخل توییچ شروع شد\n\n## ${title}\n\n https://www.twitch.tv/${user_name}\n`;

            const twitchButton = new ButtonBuilder()
              .setLabel(`Watch Stream`)
              .setURL(`https://www.twitch.tv/${user_name}`)
              .setStyle(ButtonStyle.Link);

            const button = new ActionRowBuilder().addComponents(twitchButton);

            setTimeout(async () => {
              msg = await channel
                .send({
                  embeds: [embed],
                  content: Content,
                  components: [button],
                })
                .catch(console.error);
            }, 1 * 1000);

            category = game_name;
            Title = title;
            notified = true;

            console.log(
              chalk.rgb(107, 3, 252)(`${user_name} is now Live on Twitch!`)
            );

            client.user.setPresence({
              activities: [
                {
                  name: `${title}` || `on Twitch`,
                  url: `https://www.twitch.tv/${user_name}`,
                  type: ActivityType.Streaming,
                },
              ],
              status: "online",
            });
            presence = true;

            streamList = await stream.updateOne(
              {
                guild: guild.id,
                Streamer: "hamiitz",
              },
              { IsLive: true }
            );

            notifiedChannels.add("hamiitz");
          } else {
            const { title, viewer_count, game_name, user_name } = data.data[0];

            if (!presence || Title !== title) {
              client.user.setPresence({
                activities: [
                  {
                    name: `${title}` || `on Twitch`,
                    url: `https://www.twitch.tv/${user_name}`,
                    type: ActivityType.Streaming,
                  },
                ],
                status: "online",
              });
              presence = true;
            }

            if (Title !== title) {
              Title = title;

              embed.setTitle(`**${title}**`);
              Content = `Hey @everyone\n **${user_name}** is now LIVE on Twitch! 😍🔔\n❖ ──・──・──・──・──・── ❖\n!استریم داخل توییچ شروع شد\n\n## ${title}\n\n https://www.twitch.tv/${user_name}\n`;

              if (msg) {
                await msg.edit({
                  embeds: [embed],
                  content: Content,
                });
              }
            }
            if (category !== game_name) {
              category = game_name;

              embed.setDescription(
                `Streaming **${
                  game_name || `Just Chatting`
                }** for ${viewer_count} viewers`
              );

              if (msg) {
                await msg.edit({
                  embeds: [embed],
                  content: Content,
                });
              }
            }
          }
        } else if (streamList.IsLive === true) {
          notifiedChannels.delete("hamiitz");

          streamList = await stream.updateOne(
            {
              guild: guild.id,
              Streamer: "hamiitz",
            },
            { IsLive: false }
          );

          if (notified) {
            embed.setImage(
              `https://static-cdn.jtvnw.net/jtv_user_pictures/509a4ac1-b2ba-4261-9b0c-ca7ac3a632eb-channel_offline_image-1920x1080.jpeg`
            );
            Content = `Stream is offline. 😢`;

            if (msg) {
              await msg.edit({
                embeds: [embed],
                content: Content,
                components: [],
              });
            }
          }

          client.user.setPresence({
            activities: [
              {
                name: "Sayeh's videos 👉👈",
                type: ActivityType.Watching,
              },
            ],
            status: "online",
          });

          console.log(chalk.rgb(107, 3, 252)(`Hamiitz has gone Offline.`));
        }
      });
    } catch (error) {
      console.log(
        chalk.red(
          `An unkown error occurred in Twitch (Hamid) notification process:`
        )
      );
      throw error;
    }
  };
};
