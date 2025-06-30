const { Pool } = require('pg');

class TodoDatabasePostgres {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        this.init();
    }

    async init() {
        try {
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS todos (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    guild_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    completed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP
                )
            `);
            console.log('PostgreSQLテーブルが初期化されました');
        } catch (error) {
            console.error('データベース初期化エラー:', error);
        }
    }

    // Todoを追加
    async addTodo(userId, guildId, title, description = '') {
        try {
            const result = await this.pool.query(
                'INSERT INTO todos (user_id, guild_id, title, description) VALUES ($1, $2, $3, $4) RETURNING id',
                [userId, guildId, title, description]
            );
            return result.rows[0].id;
        } catch (error) {
            console.error('Todo追加エラー:', error);
            throw error;
        }
    }

    // Todoを取得
    async getTodo(id) {
        try {
            const result = await this.pool.query('SELECT * FROM todos WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Todo取得エラー:', error);
            throw error;
        }
    }

    // ユーザーのTodo一覧を取得
    async getTodos(userId, guildId) {
        try {
            const result = await this.pool.query(
                'SELECT * FROM todos WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC',
                [userId, guildId]
            );
            return result.rows;
        } catch (error) {
            console.error('Todo一覧取得エラー:', error);
            throw error;
        }
    }

    // Todoを完了/未完了に変更
    async toggleTodo(id, userId) {
        try {
            const result = await this.pool.query(
                'SELECT completed FROM todos WHERE id = $1 AND user_id = $2',
                [id, userId]
            );

            if (result.rows.length === 0) {
                throw new Error('Todo not found');
            }

            const newStatus = !result.rows[0].completed;
            const completedAt = newStatus ? new Date() : null;

            await this.pool.query(
                'UPDATE todos SET completed = $1, completed_at = $2 WHERE id = $3 AND user_id = $4',
                [newStatus, completedAt, id, userId]
            );

            return newStatus;
        } catch (error) {
            console.error('Todo状態変更エラー:', error);
            throw error;
        }
    }

    // Todoを削除
    async deleteTodo(id, userId) {
        try {
            const result = await this.pool.query(
                'DELETE FROM todos WHERE id = $1 AND user_id = $2',
                [id, userId]
            );
            return result.rowCount > 0;
        } catch (error) {
            console.error('Todo削除エラー:', error);
            throw error;
        }
    }

    // Todoを編集
    async editTodo(id, userId, title, description) {
        try {
            const result = await this.pool.query(
                'UPDATE todos SET title = $1, description = $2 WHERE id = $3 AND user_id = $4',
                [title, description, id, userId]
            );
            return result.rowCount > 0;
        } catch (error) {
            console.error('Todo編集エラー:', error);
            throw error;
        }
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = TodoDatabasePostgres; 