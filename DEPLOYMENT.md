# 24時間365日稼働 Bot デプロイ手順

## 🚀 Railway でのデプロイ（推奨）

### 1. Railway アカウント作成
1. [Railway](https://railway.app/) にアクセス
2. GitHubアカウントでログイン

### 2. プロジェクト作成
1. 「New Project」→「Deploy from GitHub repo」
2. このリポジトリを選択
3. 「Deploy Now」をクリック

### 3. 環境変数設定
Railwayのダッシュボードで以下の環境変数を設定：

```
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### 4. PostgreSQLデータベース追加
1. Railwayプロジェクトで「New」→「Database」→「PostgreSQL」
2. 作成されたDATABASE_URLを環境変数に設定

### 5. デプロイ完了
自動的にデプロイが開始され、数分で完了します。

---

## 🌐 Render でのデプロイ

### 1. Render アカウント作成
1. [Render](https://render.com/) にアクセス
2. GitHubアカウントでログイン

### 2. サービス作成
1. 「New」→「Web Service」
2. GitHubリポジトリを接続
3. 以下の設定：
   - **Name**: discord-todo-bot
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. 環境変数設定
```
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### 4. PostgreSQLデータベース
1. 「New」→「PostgreSQL」
2. 作成されたDATABASE_URLを環境変数に設定

---

## 🐳 Docker でのデプロイ

### 1. Dockerfile作成
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. docker-compose.yml
```yaml
version: '3.8'
services:
  bot:
    build: .
    environment:
      - DISCORD_TOKEN=${DISCORD_TOKEN}
      - CLIENT_ID=${CLIENT_ID}
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
    restart: unless-stopped
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=todobot
      - POSTGRES_USER=todobot
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## 🔧 VPS/サーバーでのデプロイ

### 1. サーバー準備
```bash
# Node.js 18+ インストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL インストール
sudo apt-get install postgresql postgresql-contrib
```

### 2. アプリケーションデプロイ
```bash
# リポジトリクローン
git clone https://github.com/your-username/discord-todo-bot.git
cd discord-todo-bot

# 依存関係インストール
npm install

# 環境変数設定
cp env.example .env
nano .env

# データベース設定
sudo -u postgres createdb todobot
sudo -u postgres createuser todobot
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE todobot TO todobot;"
```

### 3. PM2 でプロセス管理
```bash
# PM2 インストール
npm install -g pm2

# アプリケーション起動
pm2 start index.js --name "discord-todo-bot"

# 自動起動設定
pm2 startup
pm2 save
```

---

## 📊 監視とログ

### 1. ログ監視
```bash
# PM2 ログ確認
pm2 logs discord-todo-bot

# リアルタイム監視
pm2 monit
```

### 2. ヘルスチェック
```bash
# プロセス状態確認
pm2 status

# メモリ使用量確認
pm2 show discord-todo-bot
```

---

## 🔄 自動更新

### GitHub Actions での自動デプロイ
```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway/deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 💰 コスト比較

| サービス | 無料枠 | 有料プラン | 推奨度 |
|---------|--------|------------|--------|
| Railway | $5/月 | $20/月〜 | ⭐⭐⭐⭐⭐ |
| Render | 無料 | $7/月〜 | ⭐⭐⭐⭐ |
| Heroku | 終了 | $7/月〜 | ⭐⭐ |
| VPS | - | $5/月〜 | ⭐⭐⭐ |

---

## 🚨 トラブルシューティング

### Botが応答しない
1. ログを確認
2. 環境変数が正しく設定されているか確認
3. Discord Bot Tokenが有効か確認

### データベース接続エラー
1. DATABASE_URLが正しいか確認
2. データベースが起動しているか確認
3. ファイアウォール設定を確認

### メモリ不足
1. プロセスを再起動
2. より大きなプランにアップグレード
3. ログローテーションを設定

---

## 📞 サポート

問題が発生した場合は：
1. ログを確認
2. 環境変数を再確認
3. プロセスを再起動
4. 必要に応じてプランをアップグレード 