const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const userInteractions =
  "`get apex stats` , `get avatar` , `get rank` , `get wow stats` , `play favorite`";
const messageInteractions = "`report message`";
const musicCommands =
  "</play:1047903145071759425> , </queue:1047903145071759427> , </skip:1047903145218547864> , </song:1047903145218547865> , </pause:1047903145071759424> , </search:1047903145071759430> , </seek:1047903145218547862> , </repeat:1047903145071759428> , </filter:1047903144752984073> , </lyrics:1100831574787891240> , </leave:1047903145071759422> , </previous:1128669764013797467> , </insert:1115953411985244180> , </replay:1161072793220296766> , </favorite play:1108681222764367962>";
const gifCommands =
  "</avatar:1047903145218547869> , </finger:1047903145407295498> , </fuch:1047903145407295499> , </kish:1047903145407295502> , </kiss:1047903145407295503> , </space:1050160950583513189> , </spank:1142109421795807355>";
const modCommands =
  "</simjoin:1047903145218547868> , </clear:1047903145218547871> , </xp:1047903144752984071> , </yell:1047903145625407488>";
const toolCommands =
  "</birthday:1047903145218547870> , </social:1047903145407295506> , </rank:1051248003723304963> , </leaderboard:1047903144752984069> , </weather:1047903145407295507> , </currency:1100722765587284050> , </movie:1100722765587284051> , </system:1171177751022157895>";
const gameCommands =
  "</apex:1079842730752102551> , </roll:1047903145407295505> , </steam market:1100722765587284048> , </steam store:1100722765587284048> , </wow:1079842730752102553>";

const helpPages = {
  en: [
    `# Available Commands:\n\n## 🖱 User Interaction :\nRight click on a user in users list and select apps:\n${userInteractions}\n\n## ✉ Message Interaction :\nRight click on a message and go to apps menu:\n${messageInteractions}\n\n## 💿 Music :\n${musicCommands}\n\n## 🖼 GIF & Pictures :\n${gifCommands}\n\n## ⚔ Moderators-only :\n${modCommands}\n\n## 🛠 Tools :\n${toolCommands}\n\n## 🎮 Game :\n${gameCommands}`,
    "# Using Guide:\n\n## 🌟 Leveling Guide :\nYou will gain XP by chatting and being active in the server. Use (</rank:1051248003723304963> , </leaderboard:1047903144752984069>) for more information.\n\n## 🚀 Boost :\nYou will be granted XP boost by subscribing to Sayeh's Twitch channel. The amount of this boost depends on the tier of your subscribe:\n- 1️⃣ Sayeh Twitch Sub Tier **1** : XP BOOST **20 %**\n- 2️⃣ Sayeh Twitch Sub Tier **2** : XP BOOST **50 %**\n- 3️⃣ Sayeh Twitch Sub Tier **3** : XP BOOST **100 %**\n\n## 💕 Music Favorite Playlist :\nYou can add or remove a track from your favorite playlist by clicking the (♥) button whenever a track is playling. You can later modify or play your favorite playlist with </favorite:1108681222764367962>.\n\n## 📝 Note :\n- 🏁 Maximum level : **60**\n- 🎲 There is a small chance to win or lose some of your XP by using </roll:1047903145407295505>.\n- 🚀 You will receive XP by boosting the server!",
  ],
  fa: [
    `# راهنمای دستورات :\n\n## 🖱 تعامل کاربر :\nروی یک کاربر در لیست کاربران کلیک راست کنید و از این گزینه ها استفاده کنید:\n${userInteractions}\n\n## ✉ تعامل پیام :\nروی یک پیام کلیک راست کنید و از این گزینه ها استفاده کنید:\n${messageInteractions}\n\n## 💿 موسیقی :\n${musicCommands}\n\n## 🖼 گیف و تصاویر :\n${gifCommands}\n\n## ⚔ فقط مودریتور ها :\n${modCommands}\n\n## 🛠 ابزار ها :\n${toolCommands}\n\n## 🎮 بازی :\n${gameCommands}`,
    "# راهنمای استفاده :\n\n## 🌟 راهنمای لول آپ:\n شما با فعال بودن و چت کردن در سرور XP بدست میاورید.\n برای اطلاعات بیشتر از (</rank:1051248003723304963> , </leaderboard:1047903144752984069>) استفاده کنید.\n\n## 🚀 بوست :\n با سابسکرایب کردن چنل سایه در توییچ بوست XP میگیرید. مقدار این بوست به تایر سابسکرایب شما بستگی دارد:\n- 1️⃣ ساب تایر **1** توییچ سایه : بوست **20 %**\n- 2️⃣ ساب تایر **2** توییچ سایه : بوست **50 %**\n- 3️⃣ ساب تایر **3** توییچ سایه : بوست **100 %**\n\n## 💕 پلی لیست موزیک های مورد علاقه :\nشما میتواند با کلیک کردن دکمه لایک (❤) هنگام پخش یک آهنگ، آن را در پلی لیست شخصی خودتان اضافه کنید یا حذف کنید. بعدا میتواند با (</favorite:1108681222764367962>) پلی لیست خودتان را تغییر دهید یا آن را پلی کنید.\n\n## 📝 نکات :\n- 🏁 نهایت لول: **60**\n- 🎲 با رول کردن (</roll:1047903145407295505>) احتمال دارد که مقداری XP بدست بیاورید یا از دست بدهید.\n- 🚀 با بوست کردن سرور مقداری XP بدست میاورید.",
  ],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get a guide to use the bot properly.")
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription("Choose a language.")
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
        )
    ),

  async execute(interaction, client) {
    const helpEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    const lan = interaction.options.get("language").value;
    const totalPages = helpPages[lan].length;
    let page = 1;

    let embed = new EmbedBuilder()
      .setTitle(`❔ Help`)
      .setDescription(helpPages[lan][page - 1])
      .setFooter({ text: `📄 Page ${page} of ${totalPages}` });

    await interaction.editReply({
      embeds: [embed],
    });

    helpEmbed.react(`⬅`);
    helpEmbed.react(`➡`);

    const filter = (reaction, user) => {
      [`⬅`, `➡`].includes(reaction.emoji.name) &&
        user.id === interaction.user.id;
    };

    const collector = helpEmbed.createReactionCollector(filter);
    collector.on("collect", async (reaction, user) => {
      if (user.bot) return;

      await reaction.users.remove(user.id);

      if (reaction.emoji.name === "➡" && page < totalPages) {
        page++;
      } else if (reaction.emoji.name === "⬅" && page !== 0) {
        --page;
      }

      embed
        .setDescription(helpPages[lan][page - 1])
        .setFooter({ text: `📄 Page ${page} of ${totalPages}` });

      await interaction.editReply({
        embeds: [embed],
      });
    });

    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete ${interaction.commandName} interaction.`);
      });
    }, 10 * 60 * 1000);
  },
};
