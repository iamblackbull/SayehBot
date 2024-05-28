const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const utils = require("../../utils/main/mainUtils");
const { pageReact } = require("../../utils/main/handleReaction");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get a guide to use the bot"),

  async execute(interaction) {
    const userInteractions =
      "`get avatar` , `get rank` , `get overwatch stats` , `get wow stats` , `play favorite`";

    const messageInteractions = "`report message` , `warn author`";

    const helpPages = [
      `### 🖱 User Interaction :
      \nRight click on a user in users list and select apps:
      \n${userInteractions}
      \n\n### ✉ Message Interaction :
      \nRight click on a message and go to apps menu:
      \n${messageInteractions}
      \n\n### Slash Commands :
      \nUse \`**/commands**\` to get a list of available slash commands.`,
      `# Usage Guide :
      \n\n### 🌟 Leveling Guide :
      \nYou will gain XP by sending message, using commands and begin active in voice channels. Use \`**/rank**\` , \`**/leaderboard**\` for more information.
      \n\n### 🚀 Boost :
      \nYou will be granted XP boost by subscribing to Sayeh's twitch channel or boosting this server. The amount of this boost depends on the tier of your subscription:
      \n- Sayeh twitch sub tier **1** : **20 %** XP BOOST
      \n- Sayeh twitch sub tier **2** : **50 %** XP BOOST
      \n- Sayeh twitch sub tier **3** : **100 %** XP BOOST
      \n- Server boost: **+ 50 %** Additional XP BOOST
      \n\n## 💕 Custom Favorite Playlist :
      \nYou can add or remove a track from your favorite playlist by clicking the (♥) button whenever a track is playling. You can modify or play your favorite playlist at anytime with **/favorite** .
      \n\n### 📝 Note :
      \n- 🏁 Level Cap: **60**
      \n- 🎲 You will win or lose XP by using \`**/roll**\` . You can also win **20,000** XP by guessing right your upcoming roll! (30 sec cooldown)`,
    ];

    let page = 0;
    const totalPages = helpPages.length;

    const embed = new EmbedBuilder()
      .setTitle(utils.titles.help)
      .setDescription(helpPages[page])
      .setColor(utils.colors.default)
      .setFooter({
        text: `Page ${page + 1} of ${totalPages}`,
        iconURL: utils.footers.page,
      });

    const helpEmbed = await interaction.reply({
      embeds: [embed],
    });

    ////////////// page switching collector //////////////
    const collector = pageReact(interaction, helpEmbed);

    collector.on("collect", async (reaction, user) => {
      if (user.bot) return;

      await reaction.users.remove(user.id);

      if (reaction.emoji.name === "➡" && page < totalPages - 1) {
        page++;
      } else if (reaction.emoji.name === "⬅" && page !== 0) {
        --page;
      }

      embed.setDescription(helpPages[page]).setFooter({
        text: `Page ${page + 1} of ${totalPages}`,
        iconURL: utils.footers.page,
      });

      await interaction.editReply({
        embeds: [embed],
      });
    });

    handleNonMusicalDeletion(interaction, true, undefined, 10);
  },
};
