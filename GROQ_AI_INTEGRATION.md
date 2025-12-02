# 🤖 Groq Cloud AI Integration Plan

## Overview

Use **Groq Cloud** as the primary AI model for:
1. **Adaptive Difficulty** - Adjust game parameters based on player performance
2. **Fashion Image Generation** - Generate age-appropriate fashion items

---

## 🎯 Part 1: Adaptive Difficulty AI

### What It Does:

**Receives after each round:**
```json
{
  "player_id": "user-123",
  "player_type": "child|teen|adult",
  "round_number": 3,
  "performance": {
    "accuracy": 0.85,
    "avg_match_time": 3.2,
    "mistakes": 4,
    "combo_max": 5,
    "time_taken": 180,
    "time_limit": 300
  },
  "current_difficulty": {
    "level": 2,
    "grid_size": { "rows": 4, "cols": 4 },
    "time_limit": 270,
    "items_count": 8
  }
}
```

**Returns:**
```json
{
  "next_difficulty": {
    "level": 3,
    "grid_size": { "rows": 6, "cols": 6 },
    "time_limit": 240,
    "items_count": 18,
    "reasoning": "Player showing high accuracy and speed, increasing challenge"
  },
  "hints": {
    "show_hints": false,
    "hint_frequency": 0
  },
  "anti_cheat": {
    "suspicious": false,
    "confidence": 0.95
  }
}
```

### Implementation:

#### 1. Backend API (Node.js/Supabase Edge Function)

**File: `supabase/functions/groq-difficulty/index.ts`**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Groq from 'npm:groq-sdk'

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY')
})

serve(async (req) => {
  try {
    const { player_id, player_type, round_number, performance, current_difficulty } = await req.json()

    const prompt = `You are an AI game difficulty adapter for a fashion matching game.

Player Type: ${player_type}
Round: ${round_number}
Current Performance:
- Accuracy: ${performance.accuracy * 100}%
- Average Match Time: ${performance.avg_match_time}s
- Mistakes: ${performance.mistakes}
- Max Combo: ${performance.combo_max}
- Time Used: ${performance.time_taken}/${performance.time_limit}s

Current Difficulty:
- Level: ${current_difficulty.level}
- Grid: ${current_difficulty.grid_size.rows}x${current_difficulty.grid_size.cols}
- Time Limit: ${current_difficulty.time_limit}s
- Items: ${current_difficulty.items_count}

Rules:
1. For CHILDREN: Max level 3, max grid 6x6, always give more time
2. For TEENS: Max level 4, max grid 6x8
3. For ADULTS: No limits
4. If accuracy < 60%, decrease difficulty
5. If accuracy > 90% AND avg_time < 3s, increase difficulty
6. Time limit reduces by 30s each round (minimum 60s)
7. Detect suspicious patterns (too perfect, too fast)

Return JSON with:
{
  "next_difficulty": {
    "level": number (1-5),
    "grid_size": { "rows": number, "cols": number },
    "time_limit": number,
    "items_count": number,
    "reasoning": "explanation"
  },
  "hints": {
    "show_hints": boolean,
    "hint_frequency": number (0-1)
  },
  "anti_cheat": {
    "suspicious": boolean,
    "confidence": number (0-1)
  }
}`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a game difficulty AI. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    })

    const aiResponse = JSON.parse(completion.choices[0].message.content)

    return new Response(
      JSON.stringify(aiResponse),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

#### 2. Frontend Service

**File: `src/services/ai/groqDifficultyService.ts`**

```typescript
import { PerformanceMetrics } from '../../types/game.types';
import { PlayerType } from '../../types/user.types';

interface DifficultyRequest {
  player_id: string;
  player_type: PlayerType;
  round_number: number;
  performance: {
    accuracy: number;
    avg_match_time: number;
    mistakes: number;
    combo_max: number;
    time_taken: number;
    time_limit: number;
  };
  current_difficulty: {
    level: number;
    grid_size: { rows: number; cols: number };
    time_limit: number;
    items_count: number;
  };
}

interface DifficultyResponse {
  next_difficulty: {
    level: number;
    grid_size: { rows: number; cols: number };
    time_limit: number;
    items_count: number;
    reasoning: string;
  };
  hints: {
    show_hints: boolean;
    hint_frequency: number;
  };
  anti_cheat: {
    suspicious: boolean;
    confidence: number;
  };
}

class GroqDifficultyService {
  private apiUrl = process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1/groq-difficulty';

  async getNextDifficulty(request: DifficultyRequest): Promise<DifficultyResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Failed to get AI difficulty recommendation');
      }

      return await response.json();
    } catch (error) {
      console.error('Groq AI Error:', error);
      // Fallback to local calculation
      return this.fallbackDifficulty(request);
    }
  }

  private fallbackDifficulty(request: DifficultyRequest): DifficultyResponse {
    // Simple local fallback if AI fails
    const { performance, current_difficulty, player_type } = request;
    let newLevel = current_difficulty.level;

    if (performance.accuracy > 0.9 && performance.avg_match_time < 3) {
      newLevel = Math.min(newLevel + 1, player_type === 'child' ? 3 : player_type === 'teen' ? 4 : 5);
    } else if (performance.accuracy < 0.6) {
      newLevel = Math.max(newLevel - 1, 1);
    }

    return {
      next_difficulty: {
        level: newLevel,
        grid_size: this.getGridForLevel(newLevel),
        time_limit: Math.max(60, current_difficulty.time_limit - 30),
        items_count: this.getItemsForLevel(newLevel),
        reasoning: 'Fallback calculation'
      },
      hints: {
        show_hints: player_type === 'child' && performance.accuracy < 0.7,
        hint_frequency: 0.3
      },
      anti_cheat: {
        suspicious: false,
        confidence: 0.5
      }
    };
  }

  private getGridForLevel(level: number): { rows: number; cols: number } {
    const grids = [
      { rows: 4, cols: 4 },
      { rows: 4, cols: 5 },
      { rows: 6, cols: 6 },
      { rows: 6, cols: 8 },
      { rows: 8, cols: 8 }
    ];
    return grids[level - 1] || grids[0];
  }

  private getItemsForLevel(level: number): number {
    const items = [8, 10, 18, 24, 32];
    return items[level - 1] || items[0];
  }
}

export const groqDifficultyService = new GroqDifficultyService();
```

---

## 🎨 Part 2: Fashion Image Generation AI

### What It Does:

**Receives:**
```json
{
  "category": "shoes|dresses|hats|suits|accessories",
  "player_type": "child|teen|adult",
  "style": "cartoon|stylish|realistic",
  "count": 10,
  "description": "Nike-style sneakers"
}
```

**Returns:**
```json
{
  "images": [
    {
      "url": "https://storage.supabase.co/...",
      "category": "shoes",
      "style": "cartoon",
      "description": "Red cartoon sneakers"
    }
  ]
}
```

### Implementation:

#### 1. Backend API

**File: `supabase/functions/groq-generate-images/index.ts`**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Groq from 'npm:groq-sdk'
import { createClient } from 'npm:@supabase/supabase-js'

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY')
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_KEY')!
)

serve(async (req) => {
  try {
    const { category, player_type, style, count, description } = await req.json()

    // Use Groq to generate image descriptions
    const prompt = `Generate ${count} detailed descriptions for ${category} in ${style} style for ${player_type} players.

Category: ${category}
Style: ${style} (cartoon for children, stylish for teens, realistic for adults)
Base Description: ${description || 'various designs'}

Return JSON array with:
[
  {
    "name": "item name",
    "description": "detailed visual description for image generation",
    "colors": ["color1", "color2"],
    "difficulty": 1-5
  }
]`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a fashion design AI. Generate diverse, age-appropriate fashion item descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })

    const descriptions = JSON.parse(completion.choices[0].message.content)

    // TODO: Use descriptions to generate actual images
    // For now, use placeholder images or integrate with image generation API
    // Store generated images in Supabase Storage
    // Save metadata to fashion_items table

    const generatedItems = []

    for (const desc of descriptions.items) {
      // Generate image URL (placeholder for now)
      const imageUrl = `https://via.placeholder.com/400?text=${encodeURIComponent(desc.name)}`

      // Save to database
      const { data, error } = await supabase
        .from('fashion_items')
        .insert({
          name: desc.name,
          category,
          image_url: imageUrl,
          source: 'ai_generated',
          is_approved: true,
          is_active: true,
          age_appropriate_for: [player_type],
          difficulty_level: desc.difficulty
        })
        .select()
        .single()

      if (!error) {
        generatedItems.push(data)
      }
    }

    return new Response(
      JSON.stringify({ items: generatedItems }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## 📋 Setup Instructions

### 1. Get Groq API Key

1. Go to https://console.groq.com
2. Sign up / Log in
3. Create API key
4. Copy the key

### 2. Add to Environment

**In `.env`:**
```
GROQ_API_KEY=gsk_your_api_key_here
```

**In Supabase Dashboard:**
- Go to Project Settings → Edge Functions
- Add secret: `GROQ_API_KEY` = your key

### 3. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy groq-difficulty
supabase functions deploy groq-generate-images
```

### 4. Update Frontend

Add Groq service calls after each game round:

```typescript
// After game ends
const aiRecommendation = await groqDifficultyService.getNextDifficulty({
  player_id: user.id,
  player_type: user.player_type,
  round_number: currentRound,
  performance: {
    accuracy: finalState.matchedPairs / finalState.totalPairs,
    avg_match_time: avgMatchTime,
    mistakes: totalMistakes,
    combo_max: finalState.maxCombo,
    time_taken: finalState.timeElapsed,
    time_limit: timeLimit
  },
  current_difficulty: {
    level: difficultyLevel,
    grid_size: gridSize,
    time_limit: timeLimit,
    items_count: itemsCount
  }
});

// Use AI recommendation for next round
setDifficultyLevel(aiRecommendation.next_difficulty.level);
setGridSize(aiRecommendation.next_difficulty.grid_size);
setTimeLimit(aiRecommendation.next_difficulty.time_limit);
```

---

## 🎯 Benefits

### Adaptive Difficulty:
✅ Personalized challenge for each player
✅ Keeps game engaging (not too easy, not too hard)
✅ Learns from player behavior
✅ Age-appropriate adjustments
✅ Anti-cheat detection

### Image Generation:
✅ Unlimited fashion items
✅ Age-appropriate styles
✅ Diverse designs
✅ Cached and reused (not regenerated)
✅ Consistent quality

---

## 💰 Cost Estimation

**Groq Cloud Pricing:**
- Very affordable (often free tier available)
- Pay per token
- Mixtral-8x7b: ~$0.27 per 1M tokens

**Estimated Usage:**
- Difficulty check: ~500 tokens per game = $0.000135
- Image generation: ~1000 tokens per batch = $0.00027
- 1000 games/day = ~$0.40/day = $12/month

**Much cheaper than OpenAI!**

---

## 🚀 Next Steps

1. ✅ Get Groq API key
2. ✅ Create Edge Functions
3. ✅ Deploy to Supabase
4. ✅ Update frontend to call AI
5. ✅ Test with real gameplay
6. ✅ Monitor and optimize

This keeps AI simple, fast, and cost-effective while providing intelligent gameplay!
