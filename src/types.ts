export interface Env {
  AI: Ai
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_WEBHOOK_SECRET: string
  ALLOWED_TELEGRAM_USER_ID: string
  ANTHROPIC_API_KEY: string
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
}

export interface TelegramUpdate {
  message?: TelegramMessage
}

export interface TelegramMessage {
  message_id: number
  from: TelegramUser
  chat: TelegramChat
  text?: string
}

export interface TelegramUser {
  id: number
  first_name: string
  username?: string
}

export interface TelegramChat {
  id: number
}

export interface ClassifyResult {
  type: "note" | "query"
  complexity: "simple" | "deep"
  intent: string
}

export interface TagResult {
  tags: string[]
  category: string
}

export interface Note {
  userId: string
  content: string
  tags: string[]
  category: string
  embedding: number[]
}

export interface NoteRow {
  id: string
  content: string
  tags: string[]
  category: string
  created_at: string
  similarity: number
}
