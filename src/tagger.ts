import Anthropic from "@anthropic-ai/sdk"
import type { Env, TagResult } from "./types"
import { extractJson } from "./utils"

const SYSTEM_PROMPT = `You are a tagging assistant for a personal second-brain.

Given a note, return 2-5 relevant tags and a single category.

Tags must be:
- lowercase kebab-case (e.g. "deep-work", "interview-prep")
- specific and meaningful
- 2-5 tags total

Category must be exactly one of: work, personal, ideas, learning, health, finance, misc

Respond with ONLY valid JSON:
{"tags":["tag1","tag2"],"category":"work"}`

export async function tag(text: string, env: Env): Promise<TagResult> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: text }],
  })

  const content = response.content[0]
  if (content.type !== "text") throw new Error("Unexpected tagger response type")

  return JSON.parse(extractJson(content.text)) as TagResult
}
