#
# **SayehBot v1.6.0 INSTALLATION GUIDE**

## **UPDATE SERVER**

> - apt update && apt upgrade -y

## **INSTALL Unzip package**

> - sudo apt install unzip

## **UPLOAD Zip format of Bot and Fonts**

> - `wget [url]` or upload the zip file with WinSCP
> - unzip [file name]

## **UPLOAD .env file**
> - Upload it with WinSCP
> - copy it with `cp .env [directory]` (Main folder)
>> - **NOTE:** .env is a secured format and the file is hidden. If you use `ls` command where the file is located, you cannot see the file in the list.

## **MAKE SURE TO BE IN ROOT (OPTIONAL)**

> - sudo -s

## **INSTALL NODE JS Ver 16.18.x**

> - curl -fsSL https://deb.nodesource.com/setup_16.x | bash - &&\
> - apt-get install -y nodejs

## **INSTALL FFMPEG**

> - sudo apt install ffmpeg

## **INSTALL build-essential**

> - sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
#
# **INSTALL NODE PACKAGES (Main folder)**

- ## Install these primary packages
> - sudo npm i discord.js @discordjs/opus@0.8.0 @discordjs/rest @discordjs/voice@0.11.0 axios@1.1.3 canvas@2.11.2 chalk@4.1.2 discord-api-types discord-giveaways@6.0.1 discord-xp@1.1.16 dotenv ffmpeg-static libsodium-wrappers@0.7.10 moment-timezone@0.5.37 mongoose ms@2.1.3 nasa-apod@0.2.0 node-fetch@3.2.10 node-twitch@0.4.7 rss-parser@3.12.0 weather-js@2.0.0 node-pre-gyp@0.17.0 node-opus opusscript@0.0.8 noderiowrapper@1.1.1 tracker.gg@1.1.2 steam-market-pricing@2.0.0 oxr@1.1.4 movier@3.0.1 genius-lyrics@4.4.3 steam-searcher@1.0.4
- ## Install discord-player packages
> - sudo npm i discord-player @discord-player/downloader @discord-player/extractor
- ## Install ytdl-core
> - sudo npm i ytdl-core
#

# **INSTALL Fonts**
- ## Bubblegum installation
> - Go to this directory: `~/../usr/share/fonts/truetype/`
> - Create a folder with `mkdir bubblegum`
> - Go back to root and copy the .ttf file to the directory with `cp Bubblegum.ttf ~/../usr/share/fonts/truetype/bubblegum`
- ## Space Font installation
> - Go to this directory: `~/../usr/share/fonts/truetype/`
> - Create a folder with `mkdir space`
> - Go back to root and copy the .ttf file to the directory with `cp Space Silhouette Font.ttf ~/../usr/share/fonts/truetype/space`
#

# **PM2 INSTALIATION AND USING GUIDE**
> - Install with `npm install pm2 -g`
> - Run pm2 with `pm2 start ./src/bot.js`
> - Stop pm2 with `pm2 stop bot` (Later start it again with `pm2 start bot`)
> - Get pm2 logs with `pm2 logs`
> - Get pm2 status with `pm2 status`
> - Completely reset pm2 with `rm -rf ~/.pm2`
#

# **FIX COMMON ISSUES**

- ## Duplicated messages or spamming
> - Reboot the server with `sudo reboot`
> - If the problem is still there, reset pm2 with `rm -rf ~/.pm2`
> - If the problem is still there, reset discord token and replace the new token in the .env file
> - Restart the bot
>> - **NOTE:** If the bot sends every message twice or more, it means that the bot is running twice at a time or more. Make sure that the bot is not online from another vm/local. This problem might happen if you run both `node .` command and `pm2 start` command together. A sign of this problem is that an error logs in console (isJSONEncodable is not a function) whenever the bot is triggered.
- ## Twitch error (connection failed or ETIMEOUT)
> - Reset twitch bot OAuth token [here](https://twitchapps.com/tokengen/) (**OPTIONAL** Scopes: user_read channel_editor)
> - Replace the new token in the .env file
> - Restart the bot
- ## Music features related issues
> - Check discord-player status and try different versions of it
> - If the problem is still there, check ytdl-core status and try different versions of it
> - If the problem is still there, check ffmpeg-static status and try different versions of it
> - Restart the bot

- ## Check packages versions
> - `node -v` or `node --version` (Recommended: v16.17.1)
> - `curl --version` (Recommended: 7.68.0)
> - `lsb_release -a` for ubuntu (Recommended: 20.04.6)
> - `ffmpeg -version` (Recommended: 4.2.7-0ubuntu0.1)
#

# **OTHER USEFUL UBUNTU COMMANDS**

- ## The **rm** command
> - To delete a single file use `rm [file]`
> - To delete all files in a directory use `rm -i [directory]/*`
> - To delete an empty directory use `rm [directory]`
> - To delete a directory and all its contents use `rm -rf [directory]`
- ## Basic commands
> - To copy a file use `cp [file] [destination directory]`
> - To cut or rename a file use `mv [file] [destination directory]`
