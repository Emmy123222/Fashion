// Groq AI Difficulty Service
// Calls Supabase Edge Function for AI-powered difficulty adaptation

import { PlayerType } from '../../types/user.types';

export interface DifficultyRequest {
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

export interface DifficultyResponse {
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
  private apiUrl: string;
  private anonKey: string;

  constructor() {
    this.apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/groq-difficulty`;
    this.anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  }

  async getNextDifficulty(request: DifficultyRequest): Promise<DifficultyResponse> {
    try {
      console.log('🤖 Calling Groq AI for difficulty adaptation...');
      console.log('📊 Request:', request);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.anonKey}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const aiResponse: DifficultyResponse = await response.json();
      
      console.log('✅ AI Response:', aiResponse);
      console.log('🎯 Next Level:', aiResponse.next_difficulty.level);
      console.log('📐 Next Grid:', aiResponse.next_difficulty.grid_size);
      console.log('⏱️ Next Time:', aiResponse.next_difficulty.time_limit);
      console.log('💡 Reasoning:', aiResponse.next_difficulty.reasoning);

      return aiResponse;
    } catch (error) {
      console.error('❌ Groq AI Error:', error);
      console.log('⚠️ Using fallback difficulty calculation');
      return this.fallbackDifficulty(request);
    }
  }

  private fallbackDifficulty(request: DifficultyRequest): DifficultyResponse {
    const { performance, current_difficulty, player_type } = request;
    let newLevel = current_difficulty.level;

    // Simple rule-based fallback
    if (performance.accuracy > 0.9 && performance.avg_match_time < 3) {
      newLevel = Math.min(newLevel + 1, this.getMaxLevel(player_type));
    } else if (performance.accuracy < 0.6) {
      newLevel = Math.max(newLevel - 1, 1);
    }

    const gridSize = this.getGridForLevel(newLevel);
    const timeLimit = Math.max(
      this.getMinTime(player_type),
      current_difficulty.time_limit - 30
    );

    return {
      next_difficulty: {
        level: newLevel,
        grid_size: gridSize,
        time_limit: timeLimit,
        items_count: (gridSize.rows * gridSize.cols) / 2,
        reasoning: 'Fallback calculation (AI unavailable)'
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

  private getMaxLevel(playerType: PlayerType): number {
    switch (playerType) {
      case 'child': return 3;
      case 'teen': return 4;
      case 'adult': return 5;
      default: return 3;
    }
  }

  private getMinTime(playerType: PlayerType): number {
    switch (playerType) {
      case 'child': return 60;
      case 'teen': return 45;
      case 'adult': return 45;
      default: return 60;
    }
  }

  private getGridForLevel(level: number): { rows: number; cols: number } {
    const grids = [
      { rows: 4, cols: 4 },   // Level 1
      { rows: 4, cols: 5 },   // Level 2
      { rows: 6, cols: 6 },   // Level 3
      { rows: 6, cols: 8 },   // Level 4
      { rows: 8, cols: 8 }    // Level 5
    ];
    return grids[level - 1] || grids[0];
  }
}

export const groqDifficultyService = new GroqDifficultyService();
