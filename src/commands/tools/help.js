const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get a guid to use the bot properly")
    .addStringOption((option) => {
      return option
        .setName("language")
        .setDescription("Choose language")
        .setRequired(true)
        .addChoices(
          {
            name: "English",
            value: "en",
          },
          {
            name: "فارسی",
            value: "fa",
          }
        );
    }),
  async execute(interaction, client) {
    const helpEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    const lan = interaction.options.get("language").value;

    const totalPages = 2;
    let page = 1;

    const firstPageEN =
      "🖱 **User Interaction :**\nRight click on a user in users list and select apps:\n`fuch user` , `get apex stats` , `get avatar` , `get rank` , `get wow stats`\n\n💿 **Music :**\n</play:1047903145071759425> , </playlist:1047903145071759426> , </queue:1047903145071759427> , </skip:1047903145218547864> , </jump:1047903145071759421> , </song:1047903145218547865> , </pause:1047903145071759424> , </search:1047903145071759430> , </seek:1047903145218547862> , </repeat:1047903145071759428> , </filter:1047903144752984073> , </lyrics:1100831574787891240> , </leave:1047903145071759422> , </favorite:1108681222764367962> , </previous:1115953411985244181> , </insert:1115953411985244180>\n\n🖼 **GIF & Pictures :**\n</avatar:1047903145218547869> , </finger:1047903145407295498> , </fuch:1047903145407295499> , </kish:1047903145407295502> , </kiss:1047903145407295503> , </space:1050160950583513189>\n\n⚔ **Moderators-only :**\n</simjoin:1047903145218547868> , </clear:1047903145218547871> , </xp:1047903144752984071>\n\n🛠 **Tools :**\n</birthday:1047903145218547870> , </social:1047903145407295506> , </roll:1047903145407295505> , </rank:1051248003723304963> , </leaderboard:1047903144752984069> , </weather:1047903145407295507> , </currency:1100722765587284050> , </movie:1100722765587284051>\n\n🎮 **Game :**\n</apex:1079842730752102551> , </steam:1100722765587284048> , </wow:1079842730752102553>";
    const secondPageEN =
      "🌟 **Leveling Guide :**\nYou will gain XP by chatting and being active in the server. Use `/rank` and `/leaderboard` for more information.\n\n**↗ Boost :**\nYou will be granted XP boost by subscribing to Sayeh's Twitch channel. The amount of this boost depends on the tier of your subscribe:\n1️⃣ Sayeh Twitch Sub tier `1` : XP BOOST `20 %`\n2️⃣ Sayeh Twitch Sub tier `2` : XP BOOST `50 %`\n3️⃣ Sayeh Twitch Sub tier `3` : XP BOOST `100 %`\n\n📝 **Note :**\n🏁 Maximum level : `60`\n🎲 There is a small chance to win or loose some of your XP by using `/roll`\n🚀 You will receive XP by boosting the server!";
    const secondPageFA =
      "🌟 **Leveling Guide :**\n شما با فعال بودن و چت کردن در سرور XP بدست میاورید.\n برای اطلاعات بیشتر از (</rank:1051248003723304963> , </leaderboard:1047903144752984069>) استفاده کنید.\n\n**↗ Boost :**\n با سابسکرایب کردن چنل سایه در توییچ بوست XP میگیرید. مقدار این بوست به تایر سابسکرایب شما بستگی دارد:\n1️⃣ Sayeh Twitch Sub tier `1` : XP BOOST `20 %`\n2️⃣ Sayeh Twitch Sub tier `2` : XP BOOST `50 %`\n3️⃣ Sayeh Twitch Sub tier `3` : XP BOOST `100 %`\n\n📝 **Note :**\n🏁 نهایت لول: `60`\n🎲 با رول کردن (</roll:1047903145407295505>) احتمال دارد که مقداری XP بدست بیاورید یا از دست بدهید.\n🚀 با بوست کردن سرور مقداری XP بدست میاورید.";

    let embed = new EmbedBuilder()
      .setTitle(`❔ Help`)
      .setDescription(firstPageEN)
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
          if (lan == "en") {
            embed
              .setDescription(secondPageEN)
              .setFooter({ text: `📄 Page ${page} of ${totalPages}` });
          } else if (lan == "fa") {
            embed
              .setDescription(secondPageFA)
              .setFooter({ text: `📄 Page ${page} of ${totalPages}` });
          }
          await interaction.editReply({
            embeds: [embed],
          });
        } else {
          page = 1;
          embed
            .setDescription(firstPageEN)
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
