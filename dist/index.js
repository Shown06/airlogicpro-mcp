#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
const API_KEY = process.env.AIRLOGICPRO_API_KEY;
const BASE_URL = (process.env.AIRLOGICPRO_BASE_URL ?? "https://airlogicpro.com").replace(/\/$/, "");
if (!API_KEY) {
    console.error("[airlogicpro-mcp] AIRLOGICPRO_API_KEY is required");
    process.exit(1);
}
async function callApi(path) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const body = (await res.json().catch(() => ({})));
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${body.error ?? res.statusText}`);
    }
    return body.data;
}
const TOOLS = [
    {
        name: "get_category_opportunity",
        description: "App Store カテゴリの参入機会スコア（需要×勝ちやすさの幾何平均）と内訳を取得する。category_id は Apple iTunes ジャンル ID（例: 6014=ゲーム, 6015=金融, 6017=教育）。",
        inputSchema: {
            type: "object",
            properties: {
                category_id: { type: "string", description: "Apple カテゴリID。例: 6014" },
                country: { type: "string", default: "jp", description: "国コード。jp/us/kr/gb 等" },
                platform: { type: "string", enum: ["apple", "google"], default: "apple" },
                rank_type: { type: "string", enum: ["free", "paid", "grossing"], default: "free" },
            },
            required: ["category_id"],
        },
    },
    {
        name: "list_top_apps",
        description: "指定カテゴリの上位アプリ（ランキング・レビュー数・評価・開発者）を一覧で取得する。新規参入時の競合分析に使う。",
        inputSchema: {
            type: "object",
            properties: {
                category_id: { type: "string", description: "Apple カテゴリID" },
                country: { type: "string", default: "jp" },
                platform: { type: "string", enum: ["apple", "google"], default: "apple" },
                rank_type: { type: "string", enum: ["free", "paid", "grossing"], default: "free" },
                limit: { type: "number", default: 10, description: "返す件数（最大15）" },
            },
            required: ["category_id"],
        },
    },
    {
        name: "search_apps",
        description: "アプリ名で横断検索する。どのカテゴリ/どのランクに居るか・レビュー数・評価を返す。",
        inputSchema: {
            type: "object",
            properties: {
                query: { type: "string", description: "検索語（2文字以上）" },
                platform: { type: "string", enum: ["apple", "google"], default: "apple" },
            },
            required: ["query"],
        },
    },
    {
        name: "compare_category_across_countries",
        description: "1つのカテゴリを複数国で横並び比較する。どの国の同カテゴリが最も参入機会が大きいか判定する。",
        inputSchema: {
            type: "object",
            properties: {
                category_id: { type: "string", description: "Apple カテゴリID" },
                rank_type: { type: "string", enum: ["free", "paid", "grossing"], default: "free" },
                platform: { type: "string", enum: ["apple", "google"], default: "apple" },
            },
            required: ["category_id"],
        },
    },
];
const server = new Server({ name: "airlogicpro-mcp", version: "0.1.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
const arg = (a, k, d = "") => String(a[k] ?? d);
const argN = (a, k, d = 0) => (typeof a[k] === "number" ? a[k] : d);
server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args = {} } = req.params;
    const a = args;
    if (name === "get_category_opportunity") {
        const categoryId = arg(a, "category_id");
        const country = arg(a, "country", "jp");
        const platform = arg(a, "platform", "apple");
        const rankType = arg(a, "rank_type", "free");
        if (!categoryId)
            throw new Error("category_id is required");
        const qs = new URLSearchParams({ type: rankType, country, platform });
        const list = (await callApi(`/api/categories?${qs}`));
        const hit = list.find((row) => String(row.category_id) === categoryId);
        if (!hit) {
            return { content: [{ type: "text", text: `not found: ${categoryId} (${country}/${platform}/${rankType})` }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(hit, null, 2) }] };
    }
    if (name === "list_top_apps") {
        const categoryId = arg(a, "category_id");
        const country = arg(a, "country", "jp");
        const platform = arg(a, "platform", "apple");
        const rankType = arg(a, "rank_type", "free");
        const limit = Math.min(15, argN(a, "limit", 10));
        if (!categoryId)
            throw new Error("category_id is required");
        const qs = new URLSearchParams({ type: rankType, country, platform });
        const detail = (await callApi(`/api/category/${encodeURIComponent(categoryId)}?${qs}`));
        const sliced = { ...detail, apps: detail.apps.slice(0, limit) };
        return { content: [{ type: "text", text: JSON.stringify(sliced, null, 2) }] };
    }
    if (name === "search_apps") {
        const query = arg(a, "query");
        const platform = arg(a, "platform", "apple");
        if (query.length < 2)
            throw new Error("query must be at least 2 characters");
        const qs = new URLSearchParams({ q: query, platform });
        const list = (await callApi(`/api/search?${qs}`));
        return { content: [{ type: "text", text: JSON.stringify(list.slice(0, 25), null, 2) }] };
    }
    if (name === "compare_category_across_countries") {
        const categoryId = arg(a, "category_id");
        const platform = arg(a, "platform", "apple");
        const rankType = arg(a, "rank_type", "free");
        if (!categoryId)
            throw new Error("category_id is required");
        const qs = new URLSearchParams({ category_id: categoryId, type: rankType, platform });
        const rows = (await callApi(`/api/compare?${qs}`));
        return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
    }
    throw new Error(`Unknown tool: ${name}`);
});
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[airlogicpro-mcp] ready");
