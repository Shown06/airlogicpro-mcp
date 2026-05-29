# @airlogicpro/mcp-server

App Store の参入機会スコアを AI エージェント (Claude Desktop / Cursor) から呼ぶための MCP サーバー。

## セットアップ

1. airlogicpro.com にログインし `/dashboard/api-keys` で API キーを発行
   （Phase 2 で実装。Phase 1 中は Supabase で直接挿入）
2. Claude Desktop 設定 (`~/Library/Application Support/Claude/claude_desktop_config.json`) に追加：

```json
{
  "mcpServers": {
    "airlogicpro": {
      "command": "npx",
      "args": ["-y", "github:Shown06/airlogicpro-mcp"],
      "env": {
        "AIRLOGICPRO_API_KEY": "sk_live_xxxxxxxx"
      }
    }
  }
}
```

3. Claude Desktop / Cursor 再起動

## 利用可能な tool (Phase 1)

| tool | 用途 |
|---|---|
| `get_category_opportunity` | App Store カテゴリの参入機会スコアと内訳を取得 |

Phase 2 で `list_top_apps` `search_apps` `compare_categories` を追加予定。

## ローカル開発

```bash
npm install
AIRLOGICPRO_API_KEY=sk_live_xxx AIRLOGICPRO_BASE_URL=http://localhost:3000 npm run dev
```
