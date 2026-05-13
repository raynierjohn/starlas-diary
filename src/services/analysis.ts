import { supabase } from './supabase'
import { AnalysisResult, AnalysisHistory } from '../types'

class AnalysisService {
  async analyzeText(text: string): Promise<{ data: AnalysisResult | null; error: string | null }> {
    // Validate input
    const validation = this.validateText(text)
    if (!validation.isValid) {
      return { data: null, error: validation.error }
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-text`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  async saveAnalysis(userId: string, text: string, result: AnalysisResult): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.from('analyses').insert({
        user_id: userId,
        text_input: text,
        sentiment: result.sentiment,
        sentiment_score: result.sentimentScore,
        entities: result.entities,
        keywords: result.keywords,
        topics: result.topics
      })

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getAnalysisHistory(userId: string, limit: number = 20): Promise<{ data: AnalysisHistory[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error: any) {
      return { data: [], error: error.message }
    }
  }

  async deleteAnalysis(analysisId: string, userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('id', analysisId)
        .eq('user_id', userId)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async updateAnalysisNote(analysisId: string, userId: string, note: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('analyses')
        .update({ notes: note })
        .eq('id', analysisId)
        .eq('user_id', userId)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private validateText(text: string): { isValid: boolean; error: string | null } {
    if (!text || typeof text !== 'string') {
      return { isValid: false, error: 'Text is required' }
    }

    const trimmedText = text.trim()
    
    if (trimmedText.length === 0) {
      return { isValid: false, error: 'Please enter some text to analyze' }
    }

    if (trimmedText.length < 3) {
      return { isValid: false, error: 'Text must be at least 3 characters long' }
    }

    if (trimmedText.length > 5000) {
      return { isValid: false, error: 'Text cannot exceed 5000 characters' }
    }

    return { isValid: true, error: null }
  }
}

export default new AnalysisService()