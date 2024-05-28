const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPing } = require("../../utils/client/getPing");
const errorHandler = require("../../utils/main/handleErrors");
const { pageReact } = require("../../utils/main/handleReaction");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");
const utils = require("../../utils/main/mainUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription(`${utils.tags.updated} Get info about latency of the bot`)
    .addStringOption((option) =>
      option.setName("host").setDescription("Input an host name or ip")
    ),

  async execute(interaction, client) {
    const pingEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;
    const host = interaction.options.getString("host") || "4.2.2.4";
    const pingResult = await getPing(host);

    if (pingResult <= 2) {
      if (pingResult == 1)
        await errorHandler.handlePingConnectionError(interaction, host);
      else if (pingResult == 2)
        await errorHandler.handlePingUnknownError(interaction);
    } else {
      const match =
        /rtt min\/avg\/max\/mdev = (\d+\.\d+)\/(\d+\.\d+)\/(\d+\.\d+)\/(\d+\.\d+) ms/.exec(
          pingResult
        );
      const ping = match ? parseInt(match[2]) : "null";

      const latency = client.ws.ping;
      let userPing = pingEmbed.createdTimestamp - interaction.createdTimestamp;

      if (userPing < 0) userPing = 0;

      const description = `- Discord API Latency: **${latency} ms**\n- User Latency: **${userPing} ms**\n- Average ${host} ping: **${ping} ms**`;
      const log = `\`\`\`${pingResult}\`\`\``;

      const pages = [description, log];
      const totalPages = pages.length;
      let page = 0;

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.ping)
        .setDescription(pages[page])
        .setColor(utils.colors.default)
        .setThumbnail(utils.thumbnails.ping)
        .setFooter({
          text: `Page ${page + 1} of ${totalPages}`,
          iconURL: utils.footers.page,
        });

      await interaction.editReply({
        embeds: [embed],
      });

      success = true;

      const collector = pageReact(interaction, pingEmbed);

      collector.on("collect", async (reaction, user) => {
        if (user.bot) return;

        await reaction.users.remove(user.id);

        if (reaction.emoji.name == "➡" && page < totalPages - 1) {
          page++;
        } else if (reaction.emoji.name == "⬅" && page !== 0) {
          --page;
        } else return;

        embed.setDescription(pages[page]).setFooter({
          text: `Page ${page + 1} of ${totalPages}`,
          iconURL: utils.footers.page,
        });

        await interaction.editReply({ embeds: [embed] });
      });
    }

    handleNonMusicalDeletion(interaction, success, undefined, 5);
  },
};
