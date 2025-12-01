// src/types/fashion.types.ts

export type FashionCategory = 
  | 'shoes' 
  | 'dresses' 
  | 'hats' 
  | 'suits' 
  | 'accessories' 
  | 'shirts' 
  | 'blouses' 
  | 'underwear' 
  | 'belts' 
  | 'ties';

export type FashionSource = 'ai_generated' | 'user_upload';
export type UploadStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type PlayerType = 'child' | 'teen' | 'adult';

export interface FashionItem {
  id: string;
  name: string;
  category: FashionCategory;
  image_url: string;
  thumbnail_url?: string;
  source: FashionSource;
  uploader_id?: string;
  is_approved: boolean;
  is_active: boolean;
  age_appropriate_for: PlayerType[];
  difficulty_level: number;
  usage_count: number;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface UserUpload {
  id: string;
  user_id: string;
  fashion_item_id?: string;
  category: FashionCategory;
  original_image_url: string;
  status: UploadStatus;
  rejection_reason?: string;
  moderation_notes?: string;
  ai_moderation_score?: number;
  ai_moderation_flags?: Record<string, any>;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface UploadRequest {
  category: FashionCategory;
  image_uri: string;
  name?: string;
}

export interface ModerationFlags {
  inappropriate_content?: boolean;
  violence?: boolean;
  nudity?: boolean;
  hate_symbols?: boolean;
  text_overlay?: boolean;
  low_quality?: boolean;
  confidence_score: number;
}
