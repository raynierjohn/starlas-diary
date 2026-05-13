export interface User {
  id: string
  email: string
  created_at: string
}

export interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral'
  sentimentScore: number
  keywords: string[]
  entities: Array<{ text: string; type: string }>
  topics: string[]
  wordCount: number
  charCount: number
}

export interface AnalysisHistory {
  id: string
  user_id: string
  text_input: string
  sentiment: string
  sentiment_score: number
  entities: any
  keywords: string[]
  topics: string[]
  created_at: string
}

export interface ValidationError {
  field: string
  message: string
}