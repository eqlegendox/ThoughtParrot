import Anthropic from "@anthropic-ai/sdk"
import { embed } from "./embedder"
import { searchNotes } from "./storage"
import type { Env, NoteRow } from "./types"

export async function handleQuery(
  queryText: string,
  complexity: "simple" | "deep",
  userId: string,
  env: Env
): Promise<string> {
  const queryEmbedding = await embed(queryText, env.AI)
  const notes = await searchNotes(queryEmbedding, userId, env)

  if (notes.length === 0) {
    return "No notes found on that topic yet. Send me some thoughts first!"
  }

  const model = complexity === "deep" ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001"
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

  const notesContext = formatNotesForContext(notes)
  const systemPrompt = buildSystemPrompt(complexity)

  const response = await client.messages.create({
    model,
    max_tokens: complexity === "deep" ? 1500 : 600,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Query: ${queryText}\n\nRelevant notes:\n${notesContext}`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== "text") throw new Error("Unexpected query response type")

  const modelLabel = complexity === "deep" ? " _(deep analysis)_" : ""
  return `${content.text}${modelLabel}`
}

function formatNotesForContext(notes: NoteRow[]): string {
  return notes
    .map((n, i) => {
      const date = new Date(n.created_at).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
      const tags = n.tags.length ? ` [${n.tags.join(", ")}]` : ""
      return `${i + 1}. (${date}${tags})\n${n.content}`
    })
    .join("\n\n")
}

function buildSystemPrompt(complexity: "simple" | "deep"): string {
  if (complexity === "deep") {
    return `You are a thoughtful second-brain assistant with access to the user's personal notes.
The user is asking a deep question that requires synthesis, strategic thinking, or pattern recognition.
Analyse the provided notes carefully, identify connections and patterns, and give a substantive, actionable response.
Be direct and specific. Reference the notes where relevant. Format your response clearly using markdown.`
  }

  return `You are a second-brain assistant helping the user find and understand their notes.
Summarise the relevant notes concisely and directly in response to the user's query.
Be brief and clear. Use markdown formatting where helpful.`
}
