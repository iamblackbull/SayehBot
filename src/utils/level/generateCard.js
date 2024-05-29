const { DBTOKEN, subRole1, subRole2, subRole3, boostRole } = process.env;
const { colors, fonts } = require("./cardUtils");
const Canvas = require("canvas");
const path = require("path");
const Levels = require("discord-xp");

Levels.setURL(DBTOKEN);

async function generateCard(target, member, user) {
  const neededXp = Levels.xpFor(parseInt(user.level + 1));
  const passedXp = Levels.xpFor(parseInt(user.level));
  const finalXp = neededXp - passedXp;

  const canvas = new Canvas.createCanvas(1000, 300);
  const card = canvas.getContext("2d");
  const barWidth = 600;

  const background = await Canvas.loadImage(
    path.join(__dirname, "../../images/rankImage3.png")
  );

  const profile = await Canvas.loadImage(
    target.displayAvatarURL({ extension: "png", size: 1024 })
  );

  /////// Draw background
  card.drawImage(background, 0, 0, canvas.width, canvas.height);

  /////// Draw level progress bar
  card.beginPath();
  card.arc(130, 140, 110, 0, 2 * Math.PI);
  card.lineWidth = 5;
  card.strokeStyle = colors.primary;
  card.stroke();
  card.closePath();

  card.lineJoin = "round";
  card.lineWidth = 50;

  card.strokeRect(298, 199, barWidth, 0);

  card.strokeStyle = "black";
  card.strokeRect(300, 200, barWidth, 0);

  card.strokeStyle = colors.primary;

  if (user.level < 60) {
    card.strokeRect(300, 200, (barWidth * (user.xp - passedXp)) / finalXp, 0);
  } else {
    card.strokeRect(300, 200, barWidth, 0);
  }

  card.fillStyle = colors.primary;

  if (target.id === "481094367407374348") {
    card.font = "90px Space Silhouette Font";
    card.fillText("SAYEH", 280, 150);
  } else {
    if (target.globalName.length <= 10) {
      card.font = "70px BubbleGum";
    } else if (target.globalName.length > 10 && target.globalName.length <= 15) {
      card.font = "50px BubbleGum";
    } else {
      card.font = "35px BubbleGum";
    }

    card.fillText(target.globalName, 280, 150);
  }

  card.font = "35px BubbleGum";
  card.fillStyle = colors.primary;
  card.fillText(`#${user.position || 0}`, 730, 40, 80);
  card.fillText(user.level || 0, 900, 40, 80);

  card.font = "35px BubbleGum";
  card.fillStyle = colors.secondary;
  card.fillText("Rank", 630, 40, 200);
  card.fillText("Level", 800, 40, 200);

  let boost = false;
  if (member.roles.cache.has(boostRole)) boost = true;

  let volume = 0;
  const roleMultipliers = new Map([
    [subRole1, 25],
    [subRole2, 50],
    [subRole3, 100],
  ]);

  for (const [role, multiplier] of roleMultipliers) {
    if (member.roles.cache.has(role)) {
      volume = multiplier;
      break;
    }
  }

  if (volume !== 0) {
    if (boost) volume = volume + 50;

    card.font = "25px BubbleGum";
    card.fillStyle = colors.secondary;
    card.fillText("BOOST", 780, 260, 200);

    card.fillStyle = colors.primary;
    card.fillText(`${volume}%`, 860, 260, 200);
  }

  const xpLine =
    user.level < 60 ? `${user.xp - passedXp}/${finalXp} XP` : "MAX";

  if (xpLine.length <= 10) {
    if (xpLine.length <= 3) {
      card.font = "30px BubbleGum";
      card.fillStyle = colors.secondary;
      card.fillText(xpLine, 850, 150);
    } else {
      card.font = "25px BubbleGum";
      card.fillStyle = colors.secondary;
      card.fillText(xpLine, 780, 150);
    }
  } else if (xpLine.length > 10) {
    card.font = "18px BubbleGum";
    card.fillStyle = colors.secondary;
    card.fillText(xpLine, 780, 150);
  } else if (xpLine.length > 13) {
    card.font = "13px BubbleGum";
    card.fillStyle = colors.secondary;
    card.fillText(xpLine, 780, 150);
  }

  card.beginPath();
  card.arc(130, 140, 110, 0, 2 * Math.PI);
  card.closePath();
  card.clip();
  card.drawImage(profile, 20, 30, 220, 220);

  return { canvas };
}

async function generateWelcomeCard(target, memberCount) {
  const specialCard = memberCount == "2000" ? true : false;
  const strokeStyle = specialCard ? colors.special : colors.primary;
  const fontStyle = specialCard ? fonts.special : fonts.primary;

  const welcomeCanvas = Canvas.createCanvas(1024, 500);
  const welcomeCard = welcomeCanvas.getContext("2d");

  const welcomeBackground = await Canvas.loadImage(
    path.join(__dirname, "../../images/welcomeImage3.png")
  );

  const welcomeProfile = await Canvas.loadImage(
    target.displayAvatarURL({ extension: "png", size: 1024 })
  );

  /////// Draw background
  welcomeCard.drawImage(welcomeBackground, 0, 0);

  /////// Draw Profile Circle
  welcomeCard.beginPath();
  welcomeCard.arc(512, 166, 119, 0, 2 * Math.PI, true);
  welcomeCard.lineWidth = 10;
  welcomeCard.strokeStyle = strokeStyle;
  welcomeCard.stroke();
  welcomeCard.closePath();

  /////// Draw WELCOME
  welcomeCard.fillStyle = colors.primary;
  welcomeCard.font = `72px ${fontStyle}`;
  welcomeCard.textAlign = "center";
  welcomeCard.fillText("WELCOME", 512, 360);

  /////// Draw USERNAME
  welcomeCard.fillStyle = colors.secondary;
  welcomeCard.font = `40px ${fontStyle}`;
  welcomeCard.textAlign = "center";
  welcomeCard.fillText(target.globalName.toUpperCase(), 512, 410);

  /////// Draw Member info
  welcomeCard.fillStyle = strokeStyle;
  welcomeCard.font = `30px ${fontStyle}`;
  welcomeCard.textAlign = "center";
  welcomeCard.fillText(`Member #${memberCount}`, 512, 455);

  /////// Draw Profile Picture
  welcomeCard.beginPath();
  welcomeCard.arc(512, 166, 119, 0, 2 * Math.PI, true);
  welcomeCard.closePath();
  welcomeCard.clip();
  welcomeCard.drawImage(welcomeProfile, 393, 47, 238, 238);

  return { welcomeCanvas };
}

module.exports = {
  generateCard,
  generateWelcomeCard,
};
