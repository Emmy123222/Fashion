// Groq AI Image Generation Service
// Calls Supabase Edge Function for AI-powered fashion image generation

import { FashionCategory, PlayerType } from '../../types/fashion.types';
import { ApiResponse } from '../../types/api.types';

interface ImageGenerationRequest {
  category: FashionCategory;
  player_type: PlayerType;
  count: number;
  description?: string;
}

interface GeneratedItem {
  id: string;
  name: string;
  category: FashionCategory;
  image_url: string;
  source: 'ai_generated';
  is_approved: boolean;
  is_active: boolean;
  age_appropriate_for: PlayerType[];
  difficulty_level: number;
}

class GroqImageService {
  private apiUrl: string;
  private anonKey: string;

  constructor() {
    this.apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/groq-generate-images`;
    this.anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  }

  async generateFashionItems(
    category: FashionCategory,
    playerType: PlayerType,
    count: number = 10,
    description?: string
  ): Promise<ApiResponse<GeneratedItem[]>> {
    try {
      console.log('🎨 Generating fashion items with Groq AI...');
      console.log('📦 Category:', category);
      console.log('👤 Player Type:', playerType);
      console.log('🔢 Count:', count);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.anonKey}`
        },
        body: JSON.stringify({
          category,
          player_type: playerType,
          count,
          description
        } as ImageGenerationRequest)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ Generated', result.count, 'items');
      
      return {
        success: true,
        data: result.items
      };
    } catch (error: any) {
      console.error('❌ Image generation error:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Failed to generate images',
          code: error.code
        }
      };
    }
  }

  async generateShoes(playerType: PlayerType, count: number = 10): Promise<ApiResponse<GeneratedItem[]>> {
    return this.generateFashionItems('shoes', playerType, count, 'Various shoe styles');
  }

  async generateDresses(playerType: PlayerType, count: number = 10): Promise<ApiResponse<GeneratedItem[]>> {
    return this.generateFashionItems('dresses', playerType, count, 'Various dress styles');
  }

  async generateHats(playerType: PlayerType, count: number = 10): Promise<ApiResponse<GeneratedItem[]>> {
    return this.generateFashionItems('hats', playerType, count, 'Various hat styles');
  }

  async generateAccessories(playerType: PlayerType, count: number = 10): Promise<ApiResponse<GeneratedItem[]>> {
    return this.generateFashionItems('accessories', playerType, count, 'Various accessories');
  }

  async generateMixedItems(playerType: PlayerType, totalCount: number = 30): Promise<ApiResponse<GeneratedItem[]>> {
    try {
      const categories: FashionCategory[] = ['shoes', 'dresses', 'hats', 'accessories'];
      const perCategory = Math.ceil(totalCount / categories.length);
      
      const allItems: GeneratedItem[] = [];

      for (const category of categories) {
        const result = await this.generateFashionItems(category, playerType, perCategory);
        if (result.success && result.data) {
          allItems.push(...result.data);
        }
      }

      return {
        success: true,
        data: allItems
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to generate mixed items',
          code: error.code
        }
      };
    }
  }
}

export const groqImageService = new GroqImageService();
