import { createClient } from "@supabase/supabase-js"
import type { Env, Note, NoteRow } from "./types"

function getClient(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
}

export async function saveNote(note: Note, env: Env): Promise<void> {
  const supabase = getClient(env)

  const { error } = await supabase.from("notes").insert({
    telegram_user_id: note.userId,
    content: note.content,
    tags: note.tags,
    category: note.category,
    embedding: JSON.stringify(note.embedding),
    created_at: new Date().toISOString(),
  })

  if (error) throw new Error(`Failed to save note: ${error.message}`)
}

export async function searchNotes(
  embedding: number[],
  userId: string,
  env: Env,
  limit = 10
): Promise<NoteRow[]> {
  const supabase = getClient(env)

  const { data, error } = await supabase.rpc("match_notes", {
    query_embedding: JSON.stringify(embedding),
    match_threshold: 0.65,
    match_count: limit,
    p_user_id: userId,
  })

  if (error) throw new Error(`Vector search failed: ${error.message}`)
  return (data as NoteRow[]) ?? []
}
