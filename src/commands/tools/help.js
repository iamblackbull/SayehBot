const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get a guid to use the bot properly"),
  async execute(interaction, client) {
    const helpEmbed = await interaction.deferReply({
      fetchReply: true,
    });
    const totalPages = 2;
    let page = 1;
    const firstPage =
      "🖱 **User Interaction :**\nRight click on a user in users list and select apps:\n`fuch user` , `get avatar` , `get rank` , `kish user` , `show finger`\n\n💿 **Music :**\n`/play` , `/playlist` , `/queue` , `/skip` , `/jump` , `/song` , `/pause` , `/resume` , `/search` , `/seek` , `/repeat` , `/filter` , `/lyrics` , `/leave` , `/favorite` , `/replay`\n\n🖼 **GIF & Pictures :**\n`/avatar` , `/finger` , `/fuch` , `/kish` , `/kiss`, `/space`\n\n⚔ **Moderators-only :**\n`/simjoin` , `/clear` , `/yell` , `/giveaway`, `/xp`\n\n🛠 **Tools :**\n`/birthday` , `/social` , `/roll` , `/rank` , `/leaderboard` , `/weather` , `/currency , `/movie`\n\n🎮 **Game :**\n`/apex` , `/steam` , `/wow`";
    const secondPage =
      "🌟 **Leveling Guide :**\nYou will gain XP by chatting and being active in the server. Use `/rank` and `/leaderboard` for more information.\n\n**↗ Boost :**\nGain XP Boost by getting :\n1️⃣ Sayeh Twitch Sub tier `1` : XP BOOST `20 %`\n2️⃣ Sayeh Twitch Sub tier `2` : XP BOOST `50 %`\n3️⃣ Sayeh Twitch Sub tier `3` : XP BOOST `100 %`\n\n📝 **Note :**\n🏁 Maximum level : `60`\n🎲 There is a small chance to win or loose some of your XP by using `/roll`\n🚀 You will receive `10000` XP by boosting the server!";
    let embed = new EmbedBuilder()
      .setTitle(`❔ Help`)
      .setDescription(firstPage)
      .setFooter({ text: `📄 Page ${page} of ${totalPages}` });
    helpEmbed.react(`⬅`);
    helpEmbed.react(`➡`);
    const filter = (reaction, user) => {
      [`⬅`, `➡`].includes(reaction.emoji.name) &&
        user.id === interaction.user.id;
    };
    const collector = helpEmbed.createReactionCollector(filter);
    collector.on("collect", async (reaction, user) => {
      if (user.bot) return;
      else {
        reaction.users.remove(reaction.users.cache.get(user.id));
        if (reaction.emoji.name === `➡`) {
          page = 2;
          embed
            .setDescription(secondPage)
            .setFooter({ text: `📄 Page ${page} of ${totalPages}` });
          await interaction.editReply({
            embeds: [embed],
          });
        } else {
          page = 1;
          embed
            .setDescription(firstPage)
            .setFooter({ text: `📄 Page ${page} of ${totalPages}` });
          await interaction.editReply({
            embeds: [embed],
          });
        }
      }
    });
    await interaction.editReply({
      embeds: [embed],
    });
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete Help interaction.`);
      });
    }, 10 * 60 * 1000);
  },
};
