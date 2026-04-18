# ThoughtParrot

I built this because I kept losing ideas, notes, and random thoughts that never made it anywhere useful. ThoughtParrot is a Telegram bot that acts as a personal second brain — you send it anything, and it remembers it intelligently.

## What it does

Send any thought, idea, task, or note to the bot on Telegram. It automatically tags and categorises it, then stores it with a semantic embedding so you can find it later by meaning, not just keywords.

Ask it a question like "what were my ideas about productivity?" and it searches your notes semantically and summarises what's relevant. Ask something deeper like "what should I focus on this week?" and it synthesises across everything you've stored.

## How

Built on Cloudflare Workers with Supabase (pgvector) for semantic storage, Cloudflare Workers AI for embeddings, and Anthropic Claude for classification, tagging, and answering queries.

```
Telegram message
      ↓
Cloudflare Worker (webhook handler)
      ↓
Claude Haiku — classify: note or query?
      ↓
  [note]                    [query]
    ↓                          ↓
Claude Haiku             embed query
tag + categorise         vector search (pgvector)
    ↓                          ↓
embed text              simple → Claude Haiku
save to Supabase        deep   → Claude Sonnet
    ↓                          ↓
"Saved! #tags"          answer sent to Telegram
```

```
src/
├── index.ts        # Worker entry — webhook validation + dispatch
├── classifier.ts   # Haiku: classify message as note or query
├── tagger.ts       # Haiku: generate tags and category for notes
├── embedder.ts     # Cloudflare AI: text → 768-dim vector
├── storage.ts      # Supabase: save notes, vector search
├── query.ts        # Search → retrieve → summarise pipeline
├── telegram.ts     # Telegram sendMessage + sendTyping
├── types.ts        # Shared TypeScript interfaces
└── utils.ts        # extractJson helper
```
