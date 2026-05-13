// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set')
    return new Response(
      JSON.stringify({ 
        response: "I'm ready to help! However, the AI service is currently configuring. Please try again in a moment. 🤖",
        fallback: true 
      }),
      { headers: corsHeaders, status: 200 }
    )
  }

  try {
    const { message, analysis, conversationHistory } = await req.json()
    
    console.log('Chat request:', message?.substring(0, 100))

    // Build context-aware prompt
    let systemPrompt = `You are a friendly, helpful AI assistant for a sentiment analysis application.`
    
    if (analysis) {
      systemPrompt += `\n\nCurrent text analysis context:
- Sentiment: ${analysis.sentiment} (${Math.round(analysis.sentimentScore * 100)}% confidence)
- Keywords: ${analysis.keywords?.join(', ') || 'none'}
- Topics: ${analysis.topics?.join(', ') || 'general'}
${analysis.emotions?.primary ? `- Primary emotion: ${analysis.emotions.primary}` : ''}

Use this context to answer questions about the user's analyzed text. Be conversational, use emojis occasionally, and keep responses helpful and concise.`
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ]

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', response.status, errorText)
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()
    const aiResponse = result.choices[0]?.message?.content || "I'm not sure how to respond to that. Could you rephrase your question?"

    return new Response(
      JSON.stringify({ response: aiResponse, fallback: false }),
      { headers: corsHeaders, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error.message)
    
    // Return intelligent fallback responses
    let fallbackResponse = "I'm here to help! You can ask me about the sentiment analysis, keywords, or how to improve your text. What would you like to know?"
    
    return new Response(
      JSON.stringify({ response: fallbackResponse, fallback: true }),
      { headers: corsHeaders, status: 200 }
    )
  }
})