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
} = process.env;
const stream = require("../../schemas/stream-schema");

const twitch = new TwitchAPI({
  client_id: TWITCH_CLIENT_ID,
  client_secret: TWTICH_CLIENT_SECRET,
  access_token: TWITCH_CLIENT_Oauth,
  scopes: ["user_read channel_editor"],
});
let IsLiveMemory = false;

module.exports = (client) => {
  client.checkStreamS = async () => {
    try {
      await twitch.getStreams({ channel: ["sayeh"] }).then(async (data) => {
        const result = data.data[0];
        const guild = await client.guilds.fetch(guildID).catch(console.error);
        const channel = await guild.channels
          .fetch(streamChannelID)
          .catch(console.error);
        let streamList = await stream.findOne({
          guild: guild.id,
          Streamer: "sayeh",
        });
        if (!streamList) {
          streamList = new stream({
            guild: guild.id,
            Streamer: "sayeh",
            IsLive: false,
          });
          await streamList.save().catch(console.error);
        }

        if (result !== undefined) {
          if (result.type === "live") {
            if (IsLiveMemory === false) {
              const { title, viewer_count, game_name, user_name, user_id } =
                data.data[0];
              let embed = new EmbedBuilder()
                .setTitle(title || null)
                .setURL(`https://www.twitch.tv/${user_name}`)
                .setDescription(
                  `Playing **${
                    game_name || `Just Chatting`
                  }** for **${viewer_count}** viewers`
                )
                .setColor(0x8d25c4)
                .setTimestamp(Date.now())
                .setThumbnail(
                  `https://cdn.discordapp.com/attachments/760838336205029416/1089626902832107590/934476feaab28c0f586b688264b50041.webp`
                )
                .setImage(
                  `https://static-cdn.jtvnw.net/previews-ttv/live_user_${user_name.toLowerCase()}-1920x1080.jpg?NgOqCvLCECvrHGtf=1`
                )
                .setAuthor({
                  name: `${user_name}`,
                  iconURL: `https://cdn.discordapp.com/attachments/760838336205029416/1089626902832107590/934476feaab28c0f586b688264b50041.webp`,
                  url: `https://www.twitch.tv/${user_name}`,
                })
                .setFooter({
                  iconURL: `https://cdn.icon-icons.com/icons2/3041/PNG/512/twitch_logo_icon_189242.png`,
                  text: `Twitch`,
                });
              const twitchButton = new ButtonBuilder()
                .setLabel(`Watch Stream`)
                .setURL(`https://www.twitch.tv/${user_name}`)
                .setStyle(ButtonStyle.Link);
              const msg = await channel
                .send({
                  embeds: [embed],
                  content: `Hey @everyone\n **${user_name}** is now LIVE on Twitch 😍🔔\n❖ ──・──・──・──・──・── ❖\n\n استریم داخل توییچ شروع شد \n\n https://www.twitch.tv/${user_name} \n\n `,
                  components: [
                    new ActionRowBuilder().addComponents(twitchButton),
                  ],
                })
                .catch(console.error);
              IsLiveMemory = true;
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
              streamList = await stream.updateOne(
                {
                  guild: guild.id,
                  Streamer: "sayeh",
                },
                { StreamerID: user_id, IsLive: true }
              );
              setTimeout(async () => {
                embed.setImage(
                  `https://static-cdn.jtvnw.net/ttv-static/404_preview-1920x1080.jpg`
                );
                await msg.edit({
                  embeds: [embed],
                });
              }, 4 * 60 * 60 * 1000);
            } else if (IsLiveMemory === true) return;
          } else if (IsLiveMemory === true) {
            IsLiveMemory = false;
            streamList = await stream.updateOne(
              {
                guild: guild.id,
                Streamer: "sayeh",
              },
              { IsLive: false }
            );
            client.user.setPresence({
              activities: [
                {
                  name: "from Space",
                  type: ActivityType.Watching,
                },
              ],
              status: "online",
            });
            console.log(chalk.rgb(107, 3, 252)(`Sayeh has gone Offline.`));
          }
        } else if (IsLiveMemory === true) {
          IsLiveMemory = false;
          streamList = await stream.updateOne(
            {
              guild: guild.id,
              Streamer: "sayeh",
            },
            { IsLive: false }
          );
          client.user.setPresence({
            activities: [
              {
                name: "from Space",
                type: ActivityType.Watching,
              },
            ],
            status: "online",
          });
          console.log(chalk.rgb(107, 3, 252)(`Sayeh has gone Offline.`));
        }
      });
    } catch (error) {
      console.log(chalk.red(`Connection to Twitch API (Sayeh) failed...`));
    }
  };
};
