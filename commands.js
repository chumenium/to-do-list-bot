const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const TodoDatabase = require('./database');

const db = new TodoDatabase();

// Slash Commandsの定義
const commands = [
    new SlashCommandBuilder()
        .setName('todo')
        .setDescription('Todoリストを管理します')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('新しいTodoを追加します')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Todoのタイトル')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Todoの詳細説明')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Todoリストを表示します'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Todoを削除します')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('削除するTodoのID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Todoを編集します')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('編集するTodoのID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('toggle')
                .setDescription('Todoの完了状態を切り替えます')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('切り替えるTodoのID')
                        .setRequired(true))),
];

// コマンドハンドラー
async function handleCommand(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    try {
        switch (subcommand) {
            case 'add':
                await handleAdd(interaction, userId, guildId);
                break;
            case 'list':
                await handleList(interaction, userId, guildId);
                break;
            case 'delete':
                await handleDelete(interaction, userId);
                break;
            case 'edit':
                await handleEdit(interaction, userId);
                break;
            case 'toggle':
                await handleToggle(interaction, userId);
                break;
        }
    } catch (error) {
        console.error('コマンド実行エラー:', error);
        await interaction.reply({
            content: 'エラーが発生しました。もう一度お試しください。',
            ephemeral: true
        });
    }
}

// Todo追加
async function handleAdd(interaction, userId, guildId) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description') || '';

    const todoId = await db.addTodo(userId, guildId, title, description);
    
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Todo追加完了')
        .setDescription(`**${title}** を追加しました！`)
        .addFields(
            { name: 'ID', value: todoId.toString(), inline: true },
            { name: '説明', value: description || 'なし', inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

// Todo一覧表示
async function handleList(interaction, userId, guildId) {
    const todos = await db.getTodos(userId, guildId);

    if (todos.length === 0) {
        const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle('📝 Todoリスト')
            .setDescription('まだTodoがありません。`/todo add` で新しいTodoを追加してください！')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📝 Todoリスト')
        .setDescription(`${interaction.user.username} のTodo一覧`)
        .setTimestamp();

    const completedTodos = todos.filter(todo => todo.completed);
    const pendingTodos = todos.filter(todo => !todo.completed);

    if (pendingTodos.length > 0) {
        const pendingList = pendingTodos.map(todo => 
            `**${todo.id}.** ${todo.title}${todo.description ? `\n   └ ${todo.description}` : ''}`
        ).join('\n');
        embed.addFields({ name: '⏳ 未完了', value: pendingList, inline: false });
    }

    if (completedTodos.length > 0) {
        const completedList = completedTodos.map(todo => 
            `**${todo.id}.** ~~${todo.title}~~${todo.description ? `\n   └ ~~${todo.description}~~` : ''}`
        ).join('\n');
        embed.addFields({ name: '✅ 完了済み', value: completedList, inline: false });
    }

    // 操作ボタン
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('refresh_todos')
                .setLabel('🔄 更新')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('add_todo')
                .setLabel('➕ 追加')
                .setStyle(ButtonStyle.Primary)
        );

    await interaction.reply({ embeds: [embed], components: [row] });
}

// Todo削除
async function handleDelete(interaction, userId) {
    const todoId = interaction.options.getInteger('id');
    
    const success = await db.deleteTodo(todoId, userId);
    
    if (success) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🗑️ Todo削除完了')
            .setDescription(`ID: **${todoId}** のTodoを削除しました。`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } else {
        await interaction.reply({
            content: '指定されたIDのTodoが見つからないか、削除権限がありません。',
            ephemeral: true
        });
    }
}

// Todo編集
async function handleEdit(interaction, userId) {
    const todoId = interaction.options.getInteger('id');
    
    const todo = await db.getTodo(todoId);
    if (!todo || todo.user_id !== userId) {
        await interaction.reply({
            content: '指定されたIDのTodoが見つからないか、編集権限がありません。',
            ephemeral: true
        });
        return;
    }

    const modal = new ModalBuilder()
        .setCustomId(`edit_todo_${todoId}`)
        .setTitle('Todo編集');

    const titleInput = new TextInputBuilder()
        .setCustomId('edit_title')
        .setLabel('タイトル')
        .setStyle(TextInputStyle.Short)
        .setValue(todo.title)
        .setRequired(true)
        .setMaxLength(100);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('edit_description')
        .setLabel('説明')
        .setStyle(TextInputStyle.Paragraph)
        .setValue(todo.description || '')
        .setRequired(false)
        .setMaxLength(1000);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);

    modal.addComponents(firstActionRow, secondActionRow);
    await interaction.showModal(modal);
}

// Todo完了状態切り替え
async function handleToggle(interaction, userId) {
    const todoId = interaction.options.getInteger('id');
    
    try {
        const newStatus = await db.toggleTodo(todoId, userId);
        const statusText = newStatus ? '完了' : '未完了';
        const color = newStatus ? '#00ff00' : '#ff9900';
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🔄 状態変更完了')
            .setDescription(`ID: **${todoId}** のTodoを **${statusText}** に変更しました。`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        await interaction.reply({
            content: '指定されたIDのTodoが見つからないか、操作権限がありません。',
            ephemeral: true
        });
    }
}

// ボタンインタラクションハンドラー
async function handleButton(interaction) {
    const customId = interaction.customId;
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    try {
        switch (customId) {
            case 'refresh_todos':
                await handleList(interaction, userId, guildId);
                break;
            case 'add_todo':
                await showAddTodoModal(interaction);
                break;
        }
    } catch (error) {
        console.error('ボタン処理エラー:', error);
        await interaction.reply({
            content: 'エラーが発生しました。',
            ephemeral: true
        });
    }
}

// Todo追加モーダル表示
async function showAddTodoModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('add_todo_modal')
        .setTitle('新しいTodo追加');

    const titleInput = new TextInputBuilder()
        .setCustomId('add_title')
        .setLabel('タイトル')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(100);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('add_description')
        .setLabel('説明')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(1000);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);

    modal.addComponents(firstActionRow, secondActionRow);
    await interaction.showModal(modal);
}

// モーダル送信ハンドラー
async function handleModal(interaction) {
    const customId = interaction.customId;
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    try {
        if (customId === 'add_todo_modal') {
            const title = interaction.fields.getTextInputValue('add_title');
            const description = interaction.fields.getTextInputValue('add_description');

            const todoId = await db.addTodo(userId, guildId, title, description);
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Todo追加完了')
                .setDescription(`**${title}** を追加しました！`)
                .addFields(
                    { name: 'ID', value: todoId.toString(), inline: true },
                    { name: '説明', value: description || 'なし', inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else if (customId.startsWith('edit_todo_')) {
            const todoId = parseInt(customId.split('_')[2]);
            const title = interaction.fields.getTextInputValue('edit_title');
            const description = interaction.fields.getTextInputValue('edit_description');

            const success = await db.editTodo(todoId, userId, title, description);
            
            if (success) {
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('✏️ Todo編集完了')
                    .setDescription(`ID: **${todoId}** のTodoを編集しました。`)
                    .addFields(
                        { name: '新しいタイトル', value: title, inline: true },
                        { name: '新しい説明', value: description || 'なし', inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply({
                    content: 'Todoの編集に失敗しました。',
                    ephemeral: true
                });
            }
        }
    } catch (error) {
        console.error('モーダル処理エラー:', error);
        await interaction.reply({
            content: 'エラーが発生しました。',
            ephemeral: true
        });
    }
}

module.exports = {
    commands,
    handleCommand,
    handleButton,
    handleModal
}; 