const { Client, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();

const { handleCommand, handleButton, handleModal } = require('./commands');

// Discord Botクライアントの作成
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Bot準備完了時の処理
client.once(Events.ClientReady, () => {
    console.log(`✅ ${client.user.tag} としてログインしました！`);
    console.log(`📝 TodoBotが起動しました！`);
    console.log(`🔗 招待リンク: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=2147483648&scope=bot%20applications.commands`);
});

// インタラクション受信時の処理
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            // Slash Commandの処理
            await handleCommand(interaction);
        } else if (interaction.isButton()) {
            // ボタンクリックの処理
            await handleButton(interaction);
        } else if (interaction.isModalSubmit()) {
            // モーダル送信の処理
            await handleModal(interaction);
        }
    } catch (error) {
        console.error('インタラクション処理エラー:', error);
        
        const errorMessage = 'エラーが発生しました。もう一度お試しください。';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// エラーハンドリング
client.on(Events.Error, (error) => {
    console.error('Discord Bot エラー:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('未処理のPromise拒否:', error);
});

process.on('uncaughtException', (error) => {
    console.error('未捕捉の例外:', error);
    process.exit(1);
});

// Botログイン
client.login(process.env.DISCORD_TOKEN); 