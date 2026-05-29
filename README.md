# @shown06/airlogicpro-mcp

[![MCP-compatible](https://img.shields.io/badge/MCP-compatible-7c4dff)](https://modelcontextprotocol.io)
[![Works with Claude](https://img.shields.io/badge/Works%20with-Claude%20Desktop-d97757)](https://claude.ai)
[![Works with Cursor](https://img.shields.io/badge/Works%20with-Cursor-000000)](https://cursor.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/Shown06/airlogicpro-mcp?style=social)](https://github.com/Shown06/airlogicpro-mcp/stargazers)


> App Store category opportunity scoring, callable from Claude Desktop / Cursor via MCP.

**LP**: [https://airlogicpro.com/agents](https://airlogicpro.com/agents) · **Setup**: see below · **Pricing & Use Cases**: on the LP

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

---

## ⭐ Star this repo if you find it useful

The MCP/Agent economy is brand new — every star helps signal that "agents calling production SaaS via MCP" is a viable pattern worth investing in.

If you ship a production MCP server too, link it back here and I'll cross-link in the README.

## Related production MCP servers (same author)

These four were shipped together as a coherent set:

- [airlogicpro-mcp](https://github.com/Shown06/airlogicpro-mcp) — App Store category opportunity scoring
- [aimieru-mcp](https://github.com/Shown06/aimieru-mcp) — Japanese AIO citation tracking
- [paperbotai-mcp](https://github.com/Shown06/paperbotai-mcp) — Multi-channel manual RAG
- [tamawaru-mcp](https://github.com/Shown06/tamawaru-mcp) — Japanese government subsidy search

All four share the same auth / billing / monitoring patterns. See the [technical writeup](https://github.com/Shown06/airlogicpro-mcp/blob/main/README.md) for production patterns (Bearer + SHA-256 hash + atomic SQL counter + Stripe Agent plan separation).

## Author

[@asab0077](https://x.com/asab0077) — solo operator running four small Japanese SaaS. MCP shipped 2026-05-29 as a single-day batch.
