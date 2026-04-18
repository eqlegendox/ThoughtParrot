import { classify } from "./classifier"
import { embed } from "./embedder"
import { handleQuery } from "./query"
import { saveNote } from "./storage"
import { sendMessage, sendTyping } from "./telegram"
import { tag } from "./tagger"
import type { Env, TelegramMessage, TelegramUpdate } from "./types"

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname !== `/webhook/${env.TELEGRAM_WEBHOOK_SECRET}`) {
      return new Response("Not found", { status: 404 })
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 })
    }

    let update: TelegramUpdate
    try {
      update = await request.json<TelegramUpdate>()
    } catch {
      return new Response("Bad request", { status: 400 })
    }

    const msg = update.message
    if (!msg?.text || String(msg.from.id) !== env.ALLOWED_TELEGRAM_USER_ID) {
      return new Response("OK")
    }

    ctx.waitUntil(processMessage(msg, env))
    return new Response("OK")
  },
}

async function processMessage(msg: TelegramMessage, env: Env): Promise<void> {
  try {
    await sendTyping(msg.chat.id, env)

    const classified = await classify(msg.text!, env)

    if (classified.type === "note") {
      const [{ tags, category }, embedding] = await Promise.all([
        tag(msg.text!, env),
        embed(msg.text!, env.AI),
      ])

      await saveNote({
        userId: String(msg.from.id),
        content: msg.text!,
        tags,
        category,
        embedding,
      }, env)

      const tagList = tags.map(t => `#${t}`).join(" ")
      await sendMessage(
        msg.chat.id,
        `✓ Saved to *${category}*\n${tagList}`,
        env
      )
    } else {
      const answer = await handleQuery(
        msg.text!,
        classified.complexity,
        String(msg.from.id),
        env
      )
      await sendMessage(msg.chat.id, answer, env)
    }
  } catch (err) {
    console.error("processMessage error:", err)
    await sendMessage(msg.chat.id, "Something went wrong — please try again.", env)
  }
}
