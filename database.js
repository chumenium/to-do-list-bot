// メモリベースの軽量データベース
class TodoDatabaseMemory {
    constructor() {
        this.todos = new Map(); // user_id -> todos[]
        this.nextId = 1;
    }

    // Todoを追加
    addTodo(userId, guildId, title, description = '') {
        const todo = {
            id: this.nextId++,
            user_id: userId,
            guild_id: guildId,
            title: title,
            description: description,
            completed: false,
            created_at: new Date(),
            completed_at: null
        };

        if (!this.todos.has(userId)) {
            this.todos.set(userId, []);
        }
        this.todos.get(userId).push(todo);
        
        return todo.id;
    }

    // Todoを取得
    getTodo(id) {
        for (const [userId, userTodos] of this.todos) {
            const todo = userTodos.find(t => t.id === id);
            if (todo) return todo;
        }
        return null;
    }

    // ユーザーのTodo一覧を取得
    getTodos(userId, guildId) {
        const userTodos = this.todos.get(userId) || [];
        return userTodos
            .filter(todo => todo.guild_id === guildId)
            .sort((a, b) => b.created_at - a.created_at);
    }

    // Todoを完了/未完了に変更
    toggleTodo(id, userId) {
        const userTodos = this.todos.get(userId);
        if (!userTodos) return false;

        const todo = userTodos.find(t => t.id === id);
        if (!todo) return false;

        todo.completed = !todo.completed;
        todo.completed_at = todo.completed ? new Date() : null;
        
        return todo.completed;
    }

    // Todoを削除
    deleteTodo(id, userId) {
        const userTodos = this.todos.get(userId);
        if (!userTodos) return false;

        const index = userTodos.findIndex(t => t.id === id);
        if (index === -1) return false;

        userTodos.splice(index, 1);
        return true;
    }

    // Todoを編集
    editTodo(id, userId, title, description) {
        const userTodos = this.todos.get(userId);
        if (!userTodos) return false;

        const todo = userTodos.find(t => t.id === id);
        if (!todo) return false;

        todo.title = title;
        todo.description = description;
        return true;
    }

    // データをクリア（Bot再起動時）
    clear() {
        this.todos.clear();
        this.nextId = 1;
    }

    // 統計情報
    getStats() {
        let totalTodos = 0;
        let completedTodos = 0;
        let totalUsers = 0;

        for (const [userId, userTodos] of this.todos) {
            totalUsers++;
            totalTodos += userTodos.length;
            completedTodos += userTodos.filter(t => t.completed).length;
        }

        return {
            totalUsers,
            totalTodos,
            completedTodos,
            pendingTodos: totalTodos - completedTodos
        };
    }
}

module.exports = TodoDatabaseMemory; 