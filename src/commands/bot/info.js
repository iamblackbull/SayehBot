const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { mongoose } = require("mongoose");
const { handleDatabaseError } = require("../../utils/main/handleErrors");
const utils = require("../../utils/main/mainUtils");
const eventsModel = require("../../database/eventsModel");
const channelModel = require("../../database/channelModel");
const { getSystemUsage } = require("../../utils/client/handleSystemUsage");
const { version, dependencies } = require("../../../package.json");
const { pageReact } = require("../../utils/main/handleReaction");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription(`${utils.tags.updated} ${utils.tags.mod} See bot information`)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    let success = false;

    if (mongoose.connection.readyState !== 1) {
      handleDatabaseError(interaction);
    } else {
      const infoEmbed = await interaction.deferReply({
        fetchReply: true,
      });

      const discordJsVersion = dependencies["discord.js"].replace("^", "");
      const playerVersion = dependencies["discord-player"].replace("^", "");
      const nodeVersion = process.version.replace("v", "");

      const uptimeSeconds = Math.floor(client.uptime / 1000);
      const days = Math.floor(uptimeSeconds / 86400);
      const hours = Math.floor((uptimeSeconds % 86400) / 3600);
      const minutes = Math.floor(((uptimeSeconds % 86400) % 3600) / 60);
      const seconds = ((uptimeSeconds % 86400) % 3600) % 60;

      const hoursLabel = hours.toString().padStart(2, "0");
      const minutesLabel = minutes.toString().padStart(2, "0");
      const remainingSecondsLabel = seconds.toString().padStart(2, "0");

      let uptimeString = "";
      if (days > 0) {
        uptimeString += `${days} days, `;
      }
      uptimeString += `${hoursLabel}:${minutesLabel}:${remainingSecondsLabel}`;

      const { cpuPercent, memPercent, totalMemoryGB } = await getSystemUsage();

      const usageDescription = `### Host System Usage:
                              > **CPU** : ${cpuPercent}%
                              > **RAM (Total)** : ${memPercent}% (${totalMemoryGB} GB)`;

      const eventsList = await eventsModel.findOne({
        guildId: interaction.guildId,
      });

      const eventsString = {
        memberAdd: eventsList?.MemberAdd ?? false,
        memberRemove: eventsList?.MemberRemove ?? false,
        memberUpdate: eventsList?.MemberUpdate ?? false,
        birthday: eventsList?.Birthday ?? false,
        stream: eventsList?.Stream ?? false,
        video: eventsList?.Video ?? false,
        level: eventsList?.Level ?? false,
        moderation: eventsList?.Moderation ?? false,
      };

      const channelsList = await channelModel.findOne({
        guildId: interaction.guildId,
      });

      const channelString = {
        welcome: channelsList?.welcomeId ?? false,
        leave: channelsList?.leaveId ?? false,
        boost: channelsList?.boostId ?? false,
        birthday: channelsList?.birthdayId ?? false,
        stream: channelsList?.streamId ?? false,
        video: channelsList?.videoId ?? false,
        level: channelsList?.levelId ?? false,
        mod: channelsList?.moderationId ?? false,
      };

      const channelNames = {};

      for (const [key, channelId] of Object.entries(channelString)) {
        if (channelId) {
          const channel = await client.channels.fetch(channelId);

          if (channel) channelNames[key] = channel.name;
          else channelNames[key] = undefined;
        } else {
          channelNames[key] = undefined;
        }
      }

      const uptime = `### Uptime:
                      \n${uptimeString}`;

      const versions = `### Versions:
                      > SayehBot: \`${version}\`
                      > node.js: \`${nodeVersion}\`
                      > discord.js: \`${discordJsVersion}\`
                      > discord-player: \`${playerVersion}\``;

      const { enabled, disabled } = utils.modes;
      const eventsDescription = `### Events:
                              \nSee which features of the bot are enabled:
                              > **${utils.events.welcome}** : ${
        eventsString.memberAdd ? enabled : disabled
      }
                              > **${utils.events.leave}** : ${
        eventsString.memberRemove ? enabled : disabled
      }
                              > **${utils.events.boost}** : ${
        eventsString.memberUpdate ? enabled : disabled
      }
                              > **${utils.events.birthday}** : ${
        eventsString.birthday ? enabled : disabled
      }
                              > **${utils.events.stream}** : ${
        eventsString.stream ? enabled : disabled
      }
                              > **${utils.events.video}** : ${
        eventsString.video ? enabled : disabled
      }
                              > **${utils.events.level}** : ${
        eventsString.level ? enabled : disabled
      }
                              > **${utils.events.mod}** : ${
        eventsString.moderation ? enabled : disabled
      }`;

      const channelsDescription = `### Special Channels:
                                \nChannels which are set as special channels for events:
                                > **${utils.events.welcome}** : ${
        channelString.welcome ? channelNames.welcome : disabled
      }
                                > **${utils.events.leave}** : ${
        channelString.leave ? channelNames.leave : disabled
      }
                                > **${utils.events.boost}** : ${
        channelString.boost ? channelNames.boost : disabled
      }
                                > **${utils.events.birthday}** : ${
        channelString.birthday ? channelNames.birthday : disabled
      }
                                > **${utils.events.stream}** : ${
        channelString.stream ? channelNames.stream : disabled
      }
                                > **${utils.events.video}** : ${
        channelString.video ? channelNames.video : disabled
      }
                                > **${utils.events.level}** : ${
        channelString.level ? channelNames.level : disabled
      }
                                > **${utils.events.mod}** : ${
        channelString.mod ? channelNames.mod : disabled
      }`;

      const pages = [
        `${uptime}\n${usageDescription}\n${versions}`,
        `${eventsDescription}\n${channelsDescription}`,
      ];

      let page = 0;
      const totalPages = pages.length;

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.info)
        .setDescription(pages[0])
        .setThumbnail(client.user.avatarURL())
        .setColor(utils.colors.default)
        .setFooter({
          text: `${utils.texts.bot} | Page ${page + 1} of ${totalPages}`,
          iconURL: utils.footers.bot,
        });

      await interaction.editReply({
        embeds: [embed],
      });

      success = true;

      ////////////// page switching collector //////////////
      const collector = pageReact(interaction, infoEmbed);

      collector.on("collect", async (reaction, user) => {
        if (user.bot) return;

        await reaction.users.remove(user.id);

        if (reaction.emoji.name === "➡" && page < totalPages - 1) {
          page++;
        } else if (reaction.emoji.name === "⬅" && page !== 0) {
          --page;
        }

        embed.setDescription(pages[page]).setFooter({
          text: `${utils.texts.bot} | Page ${page + 1} of ${totalPages}`,
          iconURL: utils.footers.page,
        });

        await interaction.editReply({
          embeds: [embed],
        });
      });
    }

    handleNonMusicalDeletion(interaction, success, 10);
  },
};
