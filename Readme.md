## INSTALL NODE JS Ver 16.18.x

curl -fsSL https://deb.nodesource.com/setup_16.x | bash - &&\
apt-get install -y nodejs

## INSTALL FFMPEG

sudo apt install ffmpeg

## INSTALL build-essential

sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

## INSTALL node-pre-gyp module and others (REMEMBER be in Exact Directory for install modules /v1.5)

npm i discord.js @discordjs/opus @discordjs/rest @discordjs/voice axios canvas canvacord chalk discord-api-types discord-giveaway discord-player@5.4.0 @discord-player/downloader discord-xp dotenv ffmpeg-static libsodium-wrappers moment-timezone mongoose ms nasa-apod node-fetch node-twitch rss-parser weather-js node-pre-gyp node-opus opusscript noderiowrapper ytdl-core@git+ssh://git@github.com:khlevon/node-ytdl-core.git#v4.11.4-patch.2 tracker.gg steam-market-pricing oxr movier genius-lyrics

## INSTALL FONT HERE: bubblegum

/usr/share/fonts/truetype/bubblegum

## INSTALL PM2 for transparent start

npm install pm2 -g

## Go to main folder and use this:

pm2 start .

## For stop bot

pm2 stop .

## For logs

pm2 logs

## For fully reset

rm -rf ~/.pm2
