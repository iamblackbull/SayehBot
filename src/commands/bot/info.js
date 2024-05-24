const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { mongoose } = require("mongoose");
const { handleDatabaseError } = require("../../utils/main/handleErrors");
const utils = require("../../utils/main/mainUtils");
const eventsModel = require("../../database/eventsModel");
const { version, dependencies } = require("../../../package.json");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("See info about the bot.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    if (mongoose.connection.readyState !== 1) {
      handleDatabaseError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      let success = false;

      const discordJsVersion = dependencies["discord.js"].replace("^", "");
      const playerVersion = dependencies["discord-player"].replace("^", "");

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

      const eventsList = await eventsModel.findOne({
        guildId: interaction.guildId,
      });

      const eventsString = {
        memberAdd: eventsList?.MemberAdd || false,
        memberRemove: eventsList?.MemberRemove || false,
        memberUpdate: eventsList?.MemberUpdate || false,
        birthday: eventsList?.Birthday || false,
        stream: eventsList?.Stream || false,
        video: eventsList?.Video || false,
        level: eventsList?.Level || false,
        moderation: eventsList?.Moderation || false,
      };

      const versions = `### Versions:
                      > SayehBot: \`${version}\`
                      > discord.js: \`${discordJsVersion}\`
                      > discord-player: \`${playerVersion}\``;

      const { enabled, disabled } = utils.modes;
      const eventsDescription = `### Events:
                              > Welcome: ${
                                eventsString.memberAdd ? enabled : disabled
                              }
                              > Leave: ${
                                eventsString.memberRemove ? enabled : disabled
                              }
                              > Boost: ${
                                eventsString.memberUpdate ? enabled : disabled
                              }
                              > Birthday: ${
                                eventsString.birthday ? enabled : disabled
                              }
                              > Stream: ${
                                eventsString.stream ? enabled : disabled
                              }
                              > Video: ${
                                eventsString.video ? enabled : disabled
                              }
                              > Level: ${
                                eventsString.level ? enabled : disabled
                              }
                              > Moderation: ${
                                eventsString.moderation ? enabled : disabled
                              }`;

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.info)
        .setDescription(`${versions}\n${eventsDescription}`)
        .setThumbnail(client.user.avatarURL())
        .setColor(utils.colors.default)
        .setFooter({
          text: utils.texts.bot,
          iconURL: utils.footers.bot,
        });

      await interaction.editReply({
        embeds: [embed],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, undefined, 5);
  },
};
