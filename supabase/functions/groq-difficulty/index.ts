// Supabase Edge Function: groq-difficulty
// Handles AI-powered difficulty adaptation using Groq Cloud

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

interface DifficultyRequest {
  player_id: string
  player_type: 'child' | 'teen' | 'adult'
  round_number: number
  performance: {
    accuracy: number
    avg_match_time: number
    mistakes: number
    combo_max: number
    time_taken: number
    time_limit: number
  }
  current_difficulty: {
    level: number
    grid_size: { rows: number; cols: number }
    time_limit: number
    items_count: number
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data: DifficultyRequest = await req.json()

    const prompt = `You are an AI game difficulty adapter for a fashion matching memory game.

PLAYER INFO:
- Type: ${data.player_type}
- Round: ${data.round_number}

CURRENT PERFORMANCE:
- Accuracy: ${(data.performance.accuracy * 100).toFixed(1)}%
- Average Match Time: ${data.performance.avg_match_time.toFixed(1)}s
- Mistakes: ${data.performance.mistakes}
- Max Combo: ${data.performance.combo_max}
- Time Used: ${data.performance.time_taken}s / ${data.performance.time_limit}s

CURRENT DIFFICULTY:
- Level: ${data.current_difficulty.level}
- Grid: ${data.current_difficulty.grid_size.rows}x${data.current_difficulty.grid_size.cols}
- Time Limit: ${data.current_difficulty.time_limit}s
- Items: ${data.current_difficulty.items_count}

RULES:
1. CHILDREN: Max level 3, max grid 6x6, always give more time, show hints if accuracy < 70%
2. TEENS: Max level 4, max grid 6x8, moderate time
3. ADULTS: No limits, max level 5, max grid 8x8
4. If accuracy < 60%, DECREASE difficulty by 1 level
5. If accuracy > 90% AND avg_time < 3s, INCREASE difficulty by 1 level
6. Time limit reduces by 30s each round (minimum 60s for children, 45s for others)
7. Detect suspicious patterns: accuracy > 98% AND avg_time < 1s = suspicious
8. Never jump more than 1 level at a time

RESPOND WITH VALID JSON ONLY:
{
  "next_difficulty": {
    "level": <number 1-5>,
    "grid_size": { "rows": <number>, "cols": <number> },
    "time_limit": <number>,
    "items_count": <number>,
    "reasoning": "<brief explanation>"
  },
  "hints": {
    "show_hints": <boolean>,
    "hint_frequency": <number 0-1>
  },
  "anti_cheat": {
    "suspicious": <boolean>,
    "confidence": <number 0-1>
  }
}`

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are a game difficulty AI. Always respond with valid JSON only. No markdown, no explanations, just JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      }),
    })

    if (!groqResponse.ok) {
      throw new Error(`Groq API error: ${groqResponse.statusText}`)
    }

    const groqData = await groqResponse.json()
    const aiResponse = JSON.parse(groqData.choices[0].message.content)

    console.log('AI Difficulty Response:', aiResponse)

    return new Response(
      JSON.stringify(aiResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
