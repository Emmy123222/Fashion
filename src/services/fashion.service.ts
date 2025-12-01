// src/services/fashion.service.ts
import { supabase } from '../lib/supabase';
import { FashionItem, FashionCategory, PlayerType } from '../types/fashion.types';
import { ApiResponse, PaginatedResponse } from '../types/api.types';

interface GetFashionItemsParams {
  category?: FashionCategory;
  player_type?: PlayerType;
  difficulty_level?: number;
  limit?: number;
  offset?: number;
  approved_only?: boolean;
}

class FashionService {
  /**
   * Get fashion items with filters
   */
  async getFashionItems(params: GetFashionItemsParams = {}): Promise<ApiResponse<FashionItem[]>> {
    try {
      let query = supabase
        .from('fashion_items')
        .select('*', { count: 'exact' });

      // Apply filters
      if (params.approved_only !== false) {
        query = query.eq('is_approved', true).eq('is_active', true);
      }

      if (params.category) {
        query = query.eq('category', params.category);
      }

      if (params.player_type) {
        query = query.contains('age_appropriate_for', [params.player_type]);
      }

      if (params.difficulty_level) {
        query = query.eq('difficulty_level', params.difficulty_level);
      }

      // Pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch fashion items',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get random fashion items for game
   */
  async getRandomFashionItems(
    count: number,
    player_type: PlayerType,
    difficulty_level: number
  ): Promise<ApiResponse<FashionItem[]>> {
    try {
      // Get items appropriate for player type and difficulty
      const { data, error } = await supabase
        .from('fashion_items')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true)
        .contains('age_appropriate_for', [player_type])
        .lte('difficulty_level', difficulty_level)
        .limit(count * 3); // Get more than needed for randomization

      if (error) throw error;

      // Shuffle and take required count
      const shuffled = (data || []).sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, count);

      return { success: true, data: selected };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch random items',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get fashion item by ID
   */
  async getFashionItemById(id: string): Promise<ApiResponse<FashionItem>> {
    try {
      const { data, error } = await supabase
        .from('fashion_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch fashion item',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get fashion items by category
   */
  async getFashionItemsByCategory(
    category: FashionCategory,
    player_type?: PlayerType
  ): Promise<ApiResponse<FashionItem[]>> {
    try {
      let query = supabase
        .from('fashion_items')
        .select('*')
        .eq('category', category)
        .eq('is_approved', true)
        .eq('is_active', true);

      if (player_type) {
        query = query.contains('age_appropriate_for', [player_type]);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch items by category',
          code: error.code,
        },
      };
    }
  }

  /**
   * Create AI-generated fashion item (admin only)
   */
  async createAIFashionItem(item: Partial<FashionItem>): Promise<ApiResponse<FashionItem>> {
    try {
      const { data, error } = await supabase
        .from('fashion_items')
        .insert({
          ...item,
          source: 'ai_generated',
          is_approved: true,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to create fashion item',
          code: error.code,
        },
      };
    }
  }

  /**
   * Update fashion item (admin only)
   */
  async updateFashionItem(id: string, updates: Partial<FashionItem>): Promise<ApiResponse<FashionItem>> {
    try {
      const { data, error } = await supabase
        .from('fashion_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to update fashion item',
          code: error.code,
        },
      };
    }
  }

  /**
   * Delete fashion item (admin only)
   */
  async deleteFashionItem(id: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('fashion_items')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to delete fashion item',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get fashion items by IDs
   */
  async getFashionItemsByIds(ids: string[]): Promise<ApiResponse<FashionItem[]>> {
    try {
      const { data, error } = await supabase
        .from('fashion_items')
        .select('*')
        .in('id', ids);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch fashion items',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get popular fashion items
   */
  async getPopularFashionItems(limit: number = 10): Promise<ApiResponse<FashionItem[]>> {
    try {
      const { data, error } = await supabase
        .from('fashion_items')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true)
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch popular items',
          code: error.code,
        },
      };
    }
  }
}

export const fashionService = new FashionService();
