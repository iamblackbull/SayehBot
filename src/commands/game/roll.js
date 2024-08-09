const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");
const { handleRollXp } = require("../../utils/level/handleLevel");
const { getUser } = require("../../utils/level/handleLevel");
const utils = require("../../utils/main/mainUtils");
const { maxLevel } = require("../../utils/level/cardUtils");
const eventsModel = require("../../database/eventsModel");

const rollCooldown = new Set();
let cacheRoll = 0;

function getRoll() {
  return Math.floor(Math.random() * max) + min;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription(
      `${utils.tags.game} Roll a random number between 1 - 100 or custom amounts`
    )
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option
        .setName("min")
        .setDescription("Set a custom minimum amount (default: 1)")
        .setMinValue(0)
    )
    .addIntegerOption((option) =>
      option
        .setName("max")
        .setDescription("Set a custom maximum amount (default: 100)")
        .setMinValue(1)
    )
    .addIntegerOption((option) =>
      option
        .setName("guess")
        .setDescription(
          "Guess right your upcoming roll to win 50,000 XP! (1 - 100 only)"
        )
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const min = interaction.options.getInteger("min") || 1;
    const max = interaction.options.getInteger("max") || 100;
    const guess = interaction.options.getInteger("guess") || false;

    let custom = true;
    if (min == 1 && max == 100) custom = false;

    let roll = getRoll();

    do {
      roll = getRoll();
    } while (roll > max || roll < min);

    let bonus = false;
    if (cacheRoll == roll) bonus = 10_000;
    cacheRoll = roll;

    await interaction.reply({
      content: `🎲 ${interaction.user} rolls **${roll}** (${min} - ${max})`,
    });

    handleNonMusicalDeletion(interaction, true, 10);

    const eventsList = await eventsModel.findOne({
      guildId: interaction.guild.id,
      Level: true,
    });
    if (!eventsList) return;

    const target = interaction.user;
    const levelProfile = await getUser(interaction.guild.id, target);

    if (custom) return;
    if (levelProfile.level >= maxLevel) return;

    if (rollCooldown.has(interaction.user.id)) return;
    rollCooldown.add(interaction.user.id);

    let type; /// 0 = loser, 1 = winner, 2 = none
    let amount; /// 4 to 20,000

    switch (roll) {
      case 1:
        type = 0;
        amount = 100 * 100; /// 10,000
        break;
      case 7:
        type = 1;
        amount = roll * 140; /// 820
        break;
      case 13:
        type = 0;
        amount = roll * 130; /// 1,690
        break;
      case 69:
        type = 1;
        amount = roll * 69; /// 4,761
        break;
      case 85:
        type = 1;
        amount = roll * 85; /// 7,225
        break;
      case 100:
        type = 1;
        amount = roll * 100; /// 10,000
        break;

      default:
        type = 2;
    }

    if (type === 2) {
      const rollString = roll.toString();

      if (rollString[0] == rollString[1]) {
        type = 1;
        amount = roll * roll; /// 121 to 9801
      } else if (rollString[1] == 0) {
        type = 1;
        amount = roll * 10; /// 10 to 900
      } else if (rollString[1] == 5) {
        type = 1;
        amount = roll * 5; /// 25 to 475
      } else if (roll % 2 == 0) {
        type = 1;
        amount = roll * 2; /// 4 to 196
      } else {
        type = 0;
        amount = roll * 3; /// 9 to 291
      }
    }

    if (guess && roll == guess) {
      type = 1;
      amount += 50_000;
    }

    amount += bonus;

    const XP = parseInt(amount);

    await handleRollXp(interaction, XP, type, roll);

    const title =
      type === 1 ? utils.titles.gamble_winner : utils.titles.gamble_loser;
    const mode = type === 1 ? "won" : "lost";
    const color =
      type === 1 ? utils.colors.gamble_winner : utils.colors.gamble_loser;

    const gambleEmbed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(`${interaction.user} ${mode} **${XP}** XP`)
      .setThumbnail(utils.thumbnails.roll)
      .setColor(color)
      .setFooter({
        iconURL: utils.footers.gamble,
        text: utils.texts.gamble,
      });

    await interaction.editReply({
      embeds: [gambleEmbed],
    });

    setTimeout(() => {
      rollCooldown.delete(interaction.user.id);
    }, 10_000);
  },
};
