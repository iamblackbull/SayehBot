const reactions = ["⬅", "➡", "🔀", "🔁"];
const numberReactions = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
const voteReaction = "⏭";

function createCollector(interaction, reply, emojis, timer) {
  emojis.forEach((emoji) => reply.react(emoji));

  const filter = (reaction, user) =>
    emojis.includes(reaction.emoji.name) &&
    (!timer || user.id === interaction.user.id);

  const collectorOptions = timer ? { filter, time: timer } : { filter };

  const collector = reply.createReactionCollector(collectorOptions);

  return collector;
}

const queueReact = (interaction, reply) =>
  createCollector(interaction, reply, reactions, false);

const searchReact = (interaction, reply, isLink) =>
  createCollector(
    interaction,
    reply,
    isLink ? [numberReactions[0]] : numberReactions,
    false
  );

const pageReact = (interaction, reply) =>
  createCollector(interaction, reply, [reactions[0], reactions[1]], false);

const shuffleReact = (interaction, reply) =>
  createCollector(interaction, reply, [reactions[2]], false);

const repeatReact = (interaction, reply) =>
  createCollector(interaction, reply, [reactions[3]], false);

const voteReact = (interaction, reply, timer) =>
  createCollector(interaction, reply, [voteReaction], timer);

module.exports = {
  queueReact,
  searchReact,
  pageReact,
  shuffleReact,
  repeatReact,
  voteReact,
};
