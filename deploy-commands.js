const { REST, Routes } = require('discord.js');
require('dotenv').config();

const { commands } = require('./commands');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Slash Commandsを登録中...');

        if (process.env.GUILD_ID) {
            // 開発用: 特定のサーバーにのみ登録
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log('開発サーバーにSlash Commandsを登録しました。');
        } else {
            // 本番用: グローバルに登録
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log('グローバルにSlash Commandsを登録しました。');
        }
    } catch (error) {
        console.error('Slash Commands登録エラー:', error);
    }
})(); 