import supabaseConfig from '../config/supabase.js';

/**
 * Feedback Service
 * Handles customer feedback storage and retrieval
 */
class FeedbackService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized && this.client) {
      return this.client;
    }

    try {
      this.client = await supabaseConfig.ensureInitialized();
      this.initialized = true;
      console.log('[FeedbackService] ✅ Initialized');
      return this.client;
    } catch (error) {
      console.error('[FeedbackService] ❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Submit customer feedback (public endpoint - no auth required)
   */
  async submitFeedback(feedbackData) {
    try {
      await this.initialize();

      const {
        locationId,
        userId,
        customerName,
        customerEmail,
        customerPhone,
        rating,
        feedbackText,
        feedbackCategory
      } = feedbackData;

      // Validate required fields
      if (!locationId || !userId || !rating || !feedbackText) {
        throw new Error('Missing required fields: locationId, userId, rating, feedbackText');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const record = {
        location_id: locationId,
        user_id: userId,
        customer_name: customerName || 'Anonymous',
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        rating: rating,
        feedback_text: feedbackText,
        feedback_category: feedbackCategory || 'general',
        is_resolved: false,
        metadata: {
          submitted_at: new Date().toISOString(),
          source: 'qr_code'
        }
      };

      const { data, error } = await this.client
        .from('customer_feedback')
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error('[FeedbackService] ❌ Failed to submit feedback:', error);
        throw error;
      }

      console.log(`[FeedbackService] ✅ Feedback submitted successfully for location ${locationId}`);
      return data;
    } catch (error) {
      console.error('[FeedbackService] Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback for a location
   */
  async getFeedbackForLocation(locationId, userId, filters = {}) {
    try {
      await this.initialize();

      let query = this.client
        .from('customer_feedback')
        .select('*')
        .eq('location_id', locationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.rating) {
        query = query.eq('rating', filters.rating);
      }

      if (filters.isResolved !== undefined) {
        query = query.eq('is_resolved', filters.isResolved);
      }

      if (filters.category) {
        query = query.eq('feedback_category', filters.category);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[FeedbackService] ❌ Failed to get feedback:', error);
        throw error;
      }

      console.log(`[FeedbackService] 📊 Retrieved ${data?.length || 0} feedback items for location ${locationId}`);
      return data || [];
    } catch (error) {
      console.error('[FeedbackService] Error getting feedback:', error);
      return [];
    }
  }

  /**
   * Get all feedback for a user across all locations
   */
  async getAllFeedbackForUser(userId, filters = {}) {
    try {
      await this.initialize();

      let query = this.client
        .from('customer_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.rating) {
        query = query.eq('rating', filters.rating);
      }

      if (filters.isResolved !== undefined) {
        query = query.eq('is_resolved', filters.isResolved);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[FeedbackService] ❌ Failed to get all feedback:', error);
        throw error;
      }

      console.log(`[FeedbackService] 📊 Retrieved ${data?.length || 0} total feedback items for user ${userId}`);
      return data || [];
    } catch (error) {
      console.error('[FeedbackService] Error getting all feedback:', error);
      return [];
    }
  }

  /**
   * Mark feedback as resolved
   */
  async resolveFeedback(feedbackId, userId, resolutionNotes) {
    try {
      await this.initialize();

      const { data, error } = await this.client
        .from('customer_feedback')
        .update({
          is_resolved: true,
          resolved_by: userId,
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes || null
        })
        .eq('id', feedbackId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[FeedbackService] ❌ Failed to resolve feedback:', error);
        throw error;
      }

      console.log(`[FeedbackService] ✅ Feedback ${feedbackId} marked as resolved`);
      return data;
    } catch (error) {
      console.error('[FeedbackService] Error resolving feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback statistics for a location
   */
  async getFeedbackStats(locationId, userId) {
    try {
      await this.initialize();

      const { data, error } = await this.client
        .from('customer_feedback')
        .select('rating, is_resolved')
        .eq('location_id', locationId)
        .eq('user_id', userId);

      if (error) {
        console.error('[FeedbackService] ❌ Failed to get feedback stats:', error);
        throw error;
      }

      const total = data.length;
      const resolved = data.filter(f => f.is_resolved).length;
      const pending = total - resolved;

      const ratingCounts = {
        1: data.filter(f => f.rating === 1).length,
        2: data.filter(f => f.rating === 2).length,
        3: data.filter(f => f.rating === 3).length,
        4: data.filter(f => f.rating === 4).length,
        5: data.filter(f => f.rating === 5).length
      };

      const avgRating = total > 0
        ? (data.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
        : 0;

      const stats = {
        total,
        resolved,
        pending,
        avgRating: parseFloat(avgRating),
        ratingCounts
      };

      console.log(`[FeedbackService] 📊 Feedback stats for location ${locationId}:`, stats);
      return stats;
    } catch (error) {
      console.error('[FeedbackService] Error getting feedback stats:', error);
      return {
        total: 0,
        resolved: 0,
        pending: 0,
        avgRating: 0,
        ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
  }

  /**
   * Delete feedback
   */
  async deleteFeedback(feedbackId, userId) {
    try {
      await this.initialize();

      const { error } = await this.client
        .from('customer_feedback')
        .delete()
        .eq('id', feedbackId)
        .eq('user_id', userId);

      if (error) {
        console.error('[FeedbackService] ❌ Failed to delete feedback:', error);
        throw error;
      }

      console.log(`[FeedbackService] ✅ Feedback ${feedbackId} deleted`);
      return true;
    } catch (error) {
      console.error('[FeedbackService] Error deleting feedback:', error);
      throw error;
    }
  }
}

// Create singleton instance
const feedbackService = new FeedbackService();

export default feedbackService;
export { FeedbackService };
