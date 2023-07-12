## UPDATE SERVER

apt update && apt upgrade -y

## INSTALL NODE JS Ver 16.18.x

curl -fsSL https://deb.nodesource.com/setup_16.x | bash - &&\
apt-get install -y nodejs

## INSTALL FFMPEG

sudo apt install ffmpeg

## INSTALL build-essential

sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

## INSTALL node-pre-gyp module and others (REMEMBER be in Exact Directory for install modules /v1.5.3)

sudo npm i discord.js@14.5.0 @discordjs/opus@0.8.0 @discordjs/rest@1.2.0 @discordjs/voice@0.11.0 axios@1.1.3 canvas@2.11.2 canvacord@5.4.8 chalk@4.1.2 discord-api-types@0.37.12 discord-giveaways@6.0.1 discord-xp@1.1.16 dotenv@16.0.3 ffmpeg-static@4.4.1 libsodium-wrappers@0.7.10 moment-timezone@0.5.37 mongoose@6.6.5 ms@2.1.3 nasa-apod@0.2.0 node-fetch@3.2.10 node-twitch@0.4.7 rss-parser@3.12.0 weather-js@2.0.0 node-pre-gyp@0.17.0 node-opus@0.0.3 opusscript@0.0.8 noderiowrapper@1.1.1 tracker.gg@1.1.2 steam-market-pricing@2.0.0 oxr@1.1.4 movier@3.0.1 genius-lyrics@4.4.3 steam-searcher@1.0.4

sudo npm i discord-player@5.4.0 @discord-player/downloader@3.0.2

sudo npm i ytdl-core@git+ssh://git@github.com:khlevon/node-ytdl-core.git#v4.11.4-patch.2

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
