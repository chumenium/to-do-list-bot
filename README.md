# Discord TodoList Bot

DiscordでGUI上で操作できるTodoListBotです。Slash Commands、ボタン、モーダルを使用して直感的にTodoを管理できます。

## 機能

- ✅ **Todo追加**: `/todo add` コマンドまたはボタンで新しいTodoを追加
- 📝 **Todo一覧表示**: `/todo list` でTodoリストを美しいEmbedで表示
- ✏️ **Todo編集**: `/todo edit` でモーダルを使用してTodoを編集
- 🔄 **完了状態切り替え**: `/todo toggle` でTodoの完了/未完了を切り替え
- 🗑️ **Todo削除**: `/todo delete` でTodoを削除
- 🎨 **美しいUI**: Embed、ボタン、モーダルを使用した直感的な操作
- �� **データ永続化**: SQLite/PostgreSQLデータベースでTodoデータを保存

## 🚀 24時間365日稼働デプロイ

### 推奨: Railway でのデプロイ

1. **[Railway](https://railway.app/)** にアクセスしてGitHubアカウントでログイン
2. 「New Project」→「Deploy from GitHub repo」でこのリポジトリを選択
3. 環境変数を設定：
   ```
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_client_id
   DATABASE_URL=postgresql://username:password@host:port/database
   NODE_ENV=production
   ```
4. PostgreSQLデータベースを追加
5. 自動デプロイ完了！

詳細な手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

## セットアップ

### 1. Discord Botの作成

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 「New Application」をクリックして新しいアプリケーションを作成
3. 「Bot」タブでBotを作成
4. 以下の権限を有効化：
   - Send Messages
   - Use Slash Commands
   - Embed Links
   - Use External Emojis
   - Add Reactions
5. Bot Tokenをコピー

### 2. 環境設定

1. 依存関係をインストール：
```bash
npm install
```

2. 環境変数ファイルを作成：
```bash
cp env.example .env
```

3. `.env`ファイルを編集：
```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here  # 開発用（本番では削除可能）
```

### 3. Slash Commandsの登録

```bash
node deploy-commands.js
```

### 4. Botの起動

```bash
npm start
```

開発モード（自動再起動）：
```bash
npm run dev
```

## 使用方法

### 基本的なコマンド

- `/todo add` - 新しいTodoを追加
- `/todo list` - Todoリストを表示
- `/todo edit <id>` - Todoを編集
- `/todo toggle <id>` - Todoの完了状態を切り替え
- `/todo delete <id>` - Todoを削除

### GUI操作

1. **Todo追加**: `/todo list` で表示される「➕ 追加」ボタンをクリック
2. **リスト更新**: 「🔄 更新」ボタンでリストを最新状態に更新
3. **モーダル編集**: `/todo edit` でモーダルウィンドウが開き、タイトルと説明を編集

## ファイル構成

```
to-do-bot/
├── index.js              # メインのBotファイル
├── commands.js           # Slash Commandsとインタラクションハンドラー
├── database.js           # SQLiteデータベース操作
├── database-postgres.js  # PostgreSQLデータベース操作（本番用）
├── deploy-commands.js    # Slash Commands登録スクリプト
├── package.json          # 依存関係とスクリプト
├── package-production.json # 本番環境用package.json
├── env.example           # 環境変数設定例
├── railway.json          # Railway設定
├── Procfile              # Heroku設定
├── render.yaml           # Render設定
├── DEPLOYMENT.md         # デプロイ手順詳細
├── README.md             # このファイル
└── todos.db              # SQLiteデータベース（自動生成）
```

## 技術スタック

- **Discord.js v14** - Discord Bot API
- **SQLite3** - 開発用データベース
- **PostgreSQL** - 本番用データベース
- **Node.js** - 実行環境

## デプロイオプション

| サービス | 無料枠 | 有料プラン | 推奨度 |
|---------|--------|------------|--------|
| Railway | $5/月 | $20/月〜 | ⭐⭐⭐⭐⭐ |
| Render | 無料 | $7/月〜 | ⭐⭐⭐⭐ |
| Heroku | 終了 | $7/月〜 | ⭐⭐ |
| VPS | - | $5/月〜 | ⭐⭐⭐ |

## トラブルシューティング

### Botが応答しない
- Bot Tokenが正しく設定されているか確認
- Botがサーバーに招待されているか確認
- Botに必要な権限が付与されているか確認

### Slash Commandsが表示されない
- `deploy-commands.js` を実行したか確認
- CLIENT_IDが正しく設定されているか確認
- Botに「Use Slash Commands」権限があるか確認

### データベースエラー
- `todos.db` ファイルの書き込み権限を確認
- SQLite3が正しくインストールされているか確認
- 本番環境ではPostgreSQLの接続を確認

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します！ 