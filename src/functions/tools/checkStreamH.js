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

const twitch = new TwitchAPI({
  client_id: TWITCH_CLIENT_ID,
  client_secret: TWTICH_CLIENT_SECRET,
  access_token: TWITCH_CLIENT_Oauth,
  scopes: ["user_read channel_editor"],
});
let IsLiveMemory = false;

module.exports = (client) => {
  client.checkStreamH = async () => {
    try {
      await twitch.getStreams({ channel: ["hamiitz"] }).then(async (data) => {
        const r = data.data[0];
        const guild = await client.guilds.fetch(guildID).catch(console.error);
        const channel = await guild.channels
          .fetch(streamChannelID)
          .catch(console.error);

        if (r !== undefined) {
          if (r.type === "live") {
            if (IsLiveMemory === false) {
              const { title, viewer_count, game_name, user_name } =
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
                  `https://cdn.discordapp.com/attachments/760838336205029416/1073888374416494663/7b789596b562980f16e1cc55dee0e50b.webp`
                )
                .setImage(
                  `https://static-cdn.jtvnw.net/previews-ttv/live_user_${user_name.toLowerCase()}-1920x1080.jpg?NgOqCvLCECvrHGtf=1`
                )
                .setAuthor({
                  name: `${user_name}`,
                  iconURL: `https://cdn.discordapp.com/attachments/760838336205029416/1073888374416494663/7b789596b562980f16e1cc55dee0e50b.webp`,
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
            client.user.setPresence({
              activities: [
                {
                  name: "from Space",
                  type: ActivityType.Watching,
                },
              ],
              status: "online",
            });
            console.log(chalk.rgb(107, 3, 252)(`Hamid has gone Offline.`));
          }
        } else if (IsLiveMemory === true) {
          IsLiveMemory = false;
          client.user.setPresence({
            activities: [
              {
                name: "from Space",
                type: ActivityType.Watching,
              },
            ],
            status: "online",
          });
          console.log(chalk.rgb(107, 3, 252)(`Hamid has gone Offline.`));
        }
      });
    } catch (error) {
      console.log(chalk.red(`Connection to Twitch API (Hamid) failed...`));
    }
  };
};
