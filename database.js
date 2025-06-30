const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class TodoDatabase {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'todos.db'));
        this.init();
    }

    init() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                guild_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME
            )
        `);
    }

    // Todoを追加
    addTodo(userId, guildId, title, description = '') {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO todos (user_id, guild_id, title, description) VALUES (?, ?, ?, ?)',
                [userId, guildId, title, description],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    // Todoを取得
    getTodo(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM todos WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    // ユーザーのTodo一覧を取得
    getTodos(userId, guildId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM todos WHERE user_id = ? AND guild_id = ? ORDER BY created_at DESC',
                [userId, guildId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    // Todoを完了/未完了に変更
    toggleTodo(id, userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT completed FROM todos WHERE id = ? AND user_id = ?',
                [id, userId],
                (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!row) {
                        reject(new Error('Todo not found'));
                        return;
                    }

                    const newStatus = !row.completed;
                    const completedAt = newStatus ? new Date().toISOString() : null;

                    this.db.run(
                        'UPDATE todos SET completed = ?, completed_at = ? WHERE id = ? AND user_id = ?',
                        [newStatus ? 1 : 0, completedAt, id, userId],
                        function(err) {
                            if (err) reject(err);
                            else resolve(newStatus);
                        }
                    );
                }
            );
        });
    }

    // Todoを削除
    deleteTodo(id, userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM todos WHERE id = ? AND user_id = ?',
                [id, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
        });
    }

    // Todoを編集
    editTodo(id, userId, title, description) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE todos SET title = ?, description = ? WHERE id = ? AND user_id = ?',
                [title, description, id, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = TodoDatabase; 