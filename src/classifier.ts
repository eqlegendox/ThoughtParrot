import Anthropic from "@anthropic-ai/sdk"
import type { ClassifyResult, Env } from "./types"
import { extractJson } from "./utils"

const SYSTEM_PROMPT = `You are a message classifier for a personal second-brain note-taking assistant.

Classify the user's message as either a "note" or a "query".

Rules:
- "note": capturing information, ideas, tasks, thoughts, reminders, or anything the user wants to remember
- "query": asking to find, search, summarise, recall, explain, analyse, or get advice based on stored notes

For queries, also classify complexity:
- "simple": find/search/summarise specific notes (e.g. "find my ideas about X", "show notes from this week")
- "deep": requires synthesis, strategic recommendations, pattern recognition, or multi-step reasoning (e.g. "what should I focus on?", "what patterns do you see?", "help me prepare for X")

Respond with ONLY valid JSON matching this schema exactly:
{"type":"note"|"query","complexity":"simple"|"deep","intent":"one sentence describing what the user wants"}`

export async function classify(text: string, env: Env): Promise<ClassifyResult> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: text }],
  })

  const content = response.content[0]
  if (content.type !== "text") throw new Error("Unexpected classifier response type")

  return JSON.parse(extractJson(content.text)) as ClassifyResult
}
