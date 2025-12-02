// Supabase Edge Function: groq-generate-images
// Generates fashion item descriptions using Groq Cloud AI

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface ImageGenerationRequest {
  category: 'shoes' | 'dresses' | 'hats' | 'suits' | 'accessories' | 'shirts' | 'blouses' | 'belts' | 'ties'
  player_type: 'child' | 'teen' | 'adult'
  count: number
  description?: string
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
    const data: ImageGenerationRequest = await req.json()

    const styleMap = {
      child: 'cartoon, colorful, fun, simple shapes',
      teen: 'stylish, trendy, modern, cool',
      adult: 'realistic, professional, elegant, detailed'
    }

    const style = styleMap[data.player_type]

    const prompt = `Generate ${data.count} diverse fashion item descriptions for ${data.category}.

Style: ${style}
Target Audience: ${data.player_type}
Base Description: ${data.description || 'various designs'}

Create diverse items with different:
- Colors (bright for children, trendy for teens, classic for adults)
- Styles (casual, formal, sporty, etc.)
- Difficulty levels (1=very distinct, 5=very similar)

RESPOND WITH VALID JSON ONLY:
{
  "items": [
    {
      "name": "<item name>",
      "description": "<detailed visual description>",
      "colors": ["<color1>", "<color2>"],
      "difficulty": <1-5>,
      "style_tags": ["<tag1>", "<tag2>"]
    }
  ]
}

Make items visually distinct for easier matching. Include variety in colors and styles.`

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
            content: 'You are a fashion design AI. Generate diverse, age-appropriate fashion descriptions. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      }),
    })

    if (!groqResponse.ok) {
      throw new Error(`Groq API error: ${groqResponse.statusText}`)
    }

    const groqData = await groqResponse.json()
    const aiResponse = JSON.parse(groqData.choices[0].message.content)

    console.log('AI Generated Items:', aiResponse)

    // Save generated items to database
    const generatedItems = []

    for (const item of aiResponse.items) {
      // For now, use placeholder images
      // TODO: Integrate with actual image generation API (DALL-E, Stable Diffusion, etc.)
      const imageUrl = `https://via.placeholder.com/400x400/${item.colors[0]?.replace('#', '')}/${item.colors[1]?.replace('#', '')}?text=${encodeURIComponent(item.name)}`

      const { data: dbItem, error } = await supabase
        .from('fashion_items')
        .insert({
          name: item.name,
          category: data.category,
          image_url: imageUrl,
          source: 'ai_generated',
          is_approved: true,
          is_active: true,
          age_appropriate_for: [data.player_type],
          difficulty_level: item.difficulty
        })
        .select()
        .single()

      if (!error && dbItem) {
        generatedItems.push(dbItem)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        items: generatedItems,
        count: generatedItems.length
      }),
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
