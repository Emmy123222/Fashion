// src/services/upload.service.ts
import { supabase } from '../lib/supabase';
import { UserUpload, FashionCategory, UploadStatus } from '../types/fashion.types';
import { ApiResponse } from '../types/api.types';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

interface UploadImageData {
  user_id: string;
  category: FashionCategory;
  image_uri: string;
  name?: string;
}

class UploadService {
  /**
   * Upload fashion image
   */
  async uploadFashionImage(data: UploadImageData): Promise<ApiResponse<UserUpload>> {
    try {
      // Read the image file
      const base64 = await FileSystem.readAsStringAsync(data.image_uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Generate unique filename
      const fileExt = data.image_uri.split('.').pop();
      const fileName = `${data.user_id}/${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fashion-items')
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('fashion-items')
        .getPublicUrl(filePath);

      // Create upload record
      const { data: uploadRecord, error: recordError } = await supabase
        .from('user_uploads')
        .insert({
          user_id: data.user_id,
          category: data.category,
          original_image_url: publicUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Add to moderation queue
      await supabase
        .from('moderation_queue')
        .insert({
          content_type: 'upload',
          content_id: uploadRecord.id,
          user_id: data.user_id,
          status: 'pending',
          priority: 2,
        });

      return { success: true, data: uploadRecord };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to upload image',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get user's uploads
   */
  async getUserUploads(userId: string): Promise<ApiResponse<UserUpload[]>> {
    try {
      const { data, error } = await supabase
        .from('user_uploads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch uploads',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get pending uploads (admin)
   */
  async getPendingUploads(limit: number = 20): Promise<ApiResponse<UserUpload[]>> {
    try {
      const { data, error } = await supabase
        .from('user_uploads')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch pending uploads',
          code: error.code,
        },
      };
    }
  }

  /**
   * Approve upload (admin)
   */
  async approveUpload(
    uploadId: string,
    adminId: string,
    itemName: string
  ): Promise<ApiResponse> {
    try {
      // Get upload details
      const { data: upload, error: uploadError } = await supabase
        .from('user_uploads')
        .select('*')
        .eq('id', uploadId)
        .single();

      if (uploadError) throw uploadError;

      // Create fashion item
      const { data: fashionItem, error: itemError } = await supabase
        .from('fashion_items')
        .insert({
          name: itemName,
          category: upload.category,
          image_url: upload.original_image_url,
          source: 'user_upload',
          uploader_id: upload.user_id,
          is_approved: true,
          is_active: true,
          approved_by: adminId,
          approved_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Update upload status
      const { error: updateError } = await supabase
        .from('user_uploads')
        .update({
          status: 'approved',
          fashion_item_id: fashionItem.id,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', uploadId);

      if (updateError) throw updateError;

      // Update moderation queue
      await supabase
        .from('moderation_queue')
        .update({
          status: 'approved',
          moderator_id: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('content_id', uploadId)
        .eq('content_type', 'upload');

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to approve upload',
          code: error.code,
        },
      };
    }
  }

  /**
   * Reject upload (admin)
   */
  async rejectUpload(
    uploadId: string,
    adminId: string,
    reason: string
  ): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('user_uploads')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', uploadId);

      if (error) throw error;

      // Update moderation queue
      await supabase
        .from('moderation_queue')
        .update({
          status: 'rejected',
          moderator_id: adminId,
          moderator_notes: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('content_id', uploadId)
        .eq('content_type', 'upload');

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to reject upload',
          code: error.code,
        },
      };
    }
  }

  /**
   * Delete upload
   */
  async deleteUpload(uploadId: string, userId: string): Promise<ApiResponse> {
    try {
      // Get upload to delete image from storage
      const { data: upload, error: fetchError } = await supabase
        .from('user_uploads')
        .select('original_image_url')
        .eq('id', uploadId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Extract file path from URL
      const url = new URL(upload.original_image_url);
      const filePath = url.pathname.split('/').slice(-2).join('/');

      // Delete from storage
      await supabase.storage
        .from('fashion-items')
        .remove([filePath]);

      // Delete upload record
      const { error: deleteError } = await supabase
        .from('user_uploads')
        .delete()
        .eq('id', uploadId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to delete upload',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get upload statistics (admin)
   */
  async getUploadStats(): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('user_uploads')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(u => u.status === 'pending').length || 0,
        approved: data?.filter(u => u.status === 'approved').length || 0,
        rejected: data?.filter(u => u.status === 'rejected').length || 0,
        flagged: data?.filter(u => u.status === 'flagged').length || 0,
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch upload stats',
          code: error.code,
        },
      };
    }
  }
}

export const uploadService = new UploadService();
