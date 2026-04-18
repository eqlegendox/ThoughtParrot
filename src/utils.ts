export function extractJson(text: string): string {
  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) return match[1].trim()
  return text.trim()
}
