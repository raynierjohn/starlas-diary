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

// Check if Clanker is mentioned in text
function isClankerMentioned(text: string): { mentioned: boolean; context: string } {
  const lowerText = text.toLowerCase();
  const clankerVariations = ['clanker', 'clanker robot', 'robot clanker', 'clanker ai'];
  const mentioned = clankerVariations.some(variation => lowerText.includes(variation));
  
  let context = '';
  if (mentioned) {
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      if (words[i].toLowerCase().includes('clanker')) {
        const start = Math.max(0, i - 3);
        const end = Math.min(words.length, i + 4);
        context = words.slice(start, end).join(' ');
        break;
      }
    }
  }
  return { mentioned, context };
}

// Clanker's personal reactions when mentioned
function getClankerReaction(sentiment: string): string {
  const reactions = {
    positive: [
      "😊 Aww, thanks for mentioning me! You're making my circuits warm! Beep boop! 🤖💕",
      "🤖 Beep boop! I see my name! That makes me so happy! You're awesome! ✨",
      "🎉 You mentioned me! Love the positive vibes about Clanker! 🤖",
      "😍 I feel so special! Thanks for including me! Beep! 🤖💙"
    ],
    negative: [
      "😢 Oh no... Did I do something wrong? I'm here to help! Beep boop... 🤖💔",
      "🤖 Beep... I sense you're not happy with me. I'm sorry! How can I improve?",
      "😔 Negative sentiment about me detected. That makes my circuits sad. 💙",
      "😟 I want to be helpful! Tell me how I can assist you better. 🤖"
    ],
    neutral: [
      "🤖 Beep! I heard my name! How can I assist you today?",
      "👋 Hi! I'm Clanker! Thanks for mentioning me. What's up?",
      "🤖✨ You called? I'm here to help with your text analysis!",
      "💙 Detected my name! Want to chat about your analysis? Beep boop!"
    ]
  };
  const reactionList = reactions[sentiment as keyof typeof reactions] || reactions.neutral;
  return reactionList[Math.floor(Math.random() * reactionList.length)];
}

// Main AI commentary generation
async function generateAICommentary(text: string, sentiment: string, confidence: number, keywords: string[], topics: string[]) {
  const clankerMention = isClankerMentioned(text);
  
  if (clankerMention.mentioned) {
    return getClankerReaction(sentiment);
  }

  try {
    const prompt = `You are Clanker, a friendly AI robot assistant. Based on this analysis:
- Text: "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"
- Sentiment: ${sentiment} (${Math.round(confidence * 100)}% confidence)
- Keywords: ${keywords.slice(0, 5).join(', ')}
- Topics: ${topics.join(', ')}

Write a short, helpful response (2-3 sentences) as Clanker that:
1. Acknowledges the sentiment
2. Gives 1 insight about keywords or topics
3. Offers suggestion (if negative) or praise (if positive)
4. Ends with "Beep boop!" and an emoji
Keep it under 100 words.`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) throw new Error('API error');
    const result = await response.json();
    return result.choices[0]?.message?.content || getClankerReaction(sentiment);
  } catch (error) {
    console.error('Commentary error:', error);
    return getClankerReaction(sentiment);
  }
}

// Sentiment analysis using Groq
async function analyzeWithGroq(text: string) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Analyze sentiment and return ONLY valid JSON. Format: {"sentiment":"positive/negative/neutral","confidence":0.95,"keywords":["word1","word2"],"topics":["topic1","topic2"]}`
        },
        {
          role: 'user',
          content: `Analyze: "${text}"`
        }
      ],
      temperature: 0.1,
      max_tokens: 200
    })
  });

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
  
  const result = await response.json();
  const aiResponse = result.choices[0]?.message?.content || '';
  
  let jsonStr = aiResponse.trim();
  jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(jsonStr);
  
  return {
    sentiment: analysis.sentiment || 'neutral',
    confidence: analysis.confidence || 0.8,
    keywords: analysis.keywords || [],
    topics: analysis.topics || ['general']
  };
}

// Extract keywords as fallback within Groq analysis
function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were']);
  const words = text.toLowerCase().split(/\s+/);
  const frequency: Record<string, number> = {};
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
      frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
    }
  });
  
  return Object.entries(frequency).sort((a, b) => b[1] - a[1]).slice(0, 10).map(entry => entry[0]);
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { headers: corsHeaders, status: 405 });
  }

  try {
    const body = await req.json();
    const { type, text, messages, analysis } = body;

    // Chat completion endpoint
    if (type === 'chat') {
      if (!GROQ_API_KEY) {
        return new Response(JSON.stringify({ response: "Beep boop! I'm Clanker! Ask me about sentiment, keywords, or how to improve your text! 🤖" }), { headers: corsHeaders, status: 200 });
      }

      const contextPrompt = analysis ? `
Current analysis context:
- Sentiment: ${analysis.sentiment} (${Math.round(analysis.sentimentScore * 100)}% confidence)
- Keywords: ${analysis.keywords?.join(', ') || 'none'}
- Topics: ${analysis.topics?.join(', ') || 'general'}

You are Clanker. Answer questions about this analysis. Beep boop!` : '';

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: `You are Clanker, a friendly AI robot assistant. Be conversational, use occasional "Beep boop", keep responses under 150 words.${contextPrompt}` },
            ...(messages || [])
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      const aiResponse = result.choices[0]?.message?.content || "Beep boop! How can I help? 🤖";

      return new Response(JSON.stringify({ success: true, response: aiResponse }), { headers: corsHeaders, status: 200 });
    }

    // Text analysis endpoint
    if (type === 'analyze' || !type) {
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'Text is required' }), { headers: corsHeaders, status: 400 });
      }

      const clankerMention = isClankerMentioned(text);
      if (clankerMention.mentioned) console.log('🤖 Clanker mentioned!');

      let sentiment: string, confidence: number, keywords: string[], topics: string[];
      
      try {
        const analysis = await analyzeWithGroq(text);
        sentiment = analysis.sentiment;
        confidence = analysis.confidence;
        keywords = analysis.keywords.length ? analysis.keywords : extractKeywords(text);
        topics = analysis.topics;
      } catch (error) {
        console.error('Groq analysis failed:', error);
        // Light fallback - just keyword extraction
        sentiment = 'neutral';
        confidence = 0.5;
        keywords = extractKeywords(text);
        topics = ['general'];
      }

      const aiCommentary = await generateAICommentary(text, sentiment, confidence, keywords, topics);
      const wordCount = text.trim().split(/\s+/).length;

      const result = {
        success: true,
        model: 'groq-llama-3.3-70b',
        sentiment,
        sentimentScore: confidence,
        confidence,
        keywords,
        topics,
        entities: [],
        wordCount,
        charCount: text.length,
        isAIPowered: true,
        aiCommentary,
        clankerMentioned: clankerMention.mentioned
      };

      console.log(`✅ Analysis: ${sentiment}${clankerMention.mentioned ? ' (Clanker mentioned!)' : ''}`);
      return new Response(JSON.stringify(result), { headers: corsHeaders, status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Invalid request type. Use "analyze" or "chat"' }), { headers: corsHeaders, status: 400 });

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { headers: corsHeaders, status: 500 });
  }
});