import supabaseConfig from '../config/supabase.js';

/**
 * Automation History Service
 * Tracks auto-posting and auto-reply activity for analytics and transparency
 */
class AutomationHistoryService {
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
      console.log('[AutomationHistoryService] ✅ Initialized');
      return this.client;
    } catch (error) {
      console.error('[AutomationHistoryService] ❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Log auto-post activity
   * @param {string} locationId - GBP location ID
   * @param {string} userId - Firebase user ID
   * @param {object} postData - Post data {content, summary, id, topicType, callToAction}
   * @param {string} status - 'success', 'failed', or 'pending'
   * @param {Error} error - Error object if failed
   */
  async logAutoPost(locationId, userId, postData, status, error = null) {
    try {
      await this.initialize();

      const record = {
        location_id: locationId,
        user_id: userId,
        post_content: postData.content || postData.summary,
        post_summary: postData.summary || (postData.content ? postData.content.substring(0, 150) : null),
        status,
        error_message: error?.message || null,
        metadata: {
          post_id: postData.id || null,
          topic_type: postData.topicType || null,
          call_to_action: postData.callToAction || null,
          media_count: postData.media?.length || 0,
          action_type: postData.actionType || null
        }
      };

      const { data, error: dbError } = await this.client
        .from('automation_post_history')
        .insert(record)
        .select()
        .single();

      if (dbError) {
        console.error('[AutomationHistoryService] ❌ Failed to log auto-post:', dbError);
        throw dbError;
      }

      console.log(`[AutomationHistoryService] ✅ Logged auto-post activity (${status}) for location: ${locationId}`);
      return data;
    } catch (err) {
      console.error('[AutomationHistoryService] Error logging auto-post:', err);
      // Don't throw - logging failures shouldn't break the main automation flow
      return null;
    }
  }

  /**
   * Log auto-reply activity
   * @param {string} locationId - GBP location ID
   * @param {string} userId - Firebase user ID
   * @param {object} reviewData - Review data {id, reviewer, starRating, comment, createTime}
   * @param {object} replyData - Reply data {comment, updateTime}
   * @param {string} status - 'success' or 'failed'
   * @param {Error} error - Error object if failed
   */
  async logAutoReply(locationId, userId, reviewData, replyData, status, error = null) {
    try {
      await this.initialize();

      const record = {
        location_id: locationId,
        user_id: userId,
        review_id: reviewData.id || reviewData.reviewId || null,
        reviewer_name: reviewData.reviewer?.displayName || reviewData.reviewerName || null,
        review_rating: reviewData.starRating || reviewData.rating || null,
        review_content: reviewData.comment || reviewData.reviewText || null,
        reply_content: replyData.comment || replyData.reply || null,
        status,
        error_message: error?.message || null,
        metadata: {
          review_create_time: reviewData.createTime || null,
          reply_update_time: replyData.updateTime || new Date().toISOString(),
          reviewer_profile_url: reviewData.reviewer?.profilePhotoUrl || null,
          is_anonymous: reviewData.reviewer?.isAnonymous || false
        }
      };

      const { data, error: dbError } = await this.client
        .from('automation_reply_history')
        .insert(record)
        .select()
        .single();

      if (dbError) {
        console.error('[AutomationHistoryService] ❌ Failed to log auto-reply:', dbError);
        throw dbError;
      }

      console.log(`[AutomationHistoryService] ✅ Logged auto-reply activity (${status}) for location: ${locationId}`);
      return data;
    } catch (err) {
      console.error('[AutomationHistoryService] Error logging auto-reply:', err);
      // Don't throw - logging failures shouldn't break the main automation flow
      return null;
    }
  }

  /**
   * Get post history for a location
   * @param {string} locationId - GBP location ID
   * @param {string} userId - Firebase user ID
   * @param {number} limit - Number of records to return (default: 20)
   * @param {number} offset - Number of records to skip (default: 0)
   */
  async getPostHistory(locationId, userId, limit = 20, offset = 0) {
    try {
      await this.initialize();

      const { data, error } = await this.client
        .from('automation_post_history')
        .select('*')
        .eq('location_id', locationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('[AutomationHistoryService] ❌ Failed to get post history:', error);
        throw error;
      }

      console.log(`[AutomationHistoryService] 📊 Retrieved ${data?.length || 0} post history records for location: ${locationId}`);
      return data || [];
    } catch (err) {
      console.error('[AutomationHistoryService] Error getting post history:', err);
      return [];
    }
  }

  /**
   * Get reply history for a location
   * @param {string} locationId - GBP location ID
   * @param {string} userId - Firebase user ID
   * @param {number} limit - Number of records to return (default: 20)
   * @param {number} offset - Number of records to skip (default: 0)
   */
  async getReplyHistory(locationId, userId, limit = 20, offset = 0) {
    try {
      await this.initialize();

      const { data, error } = await this.client
        .from('automation_reply_history')
        .select('*')
        .eq('location_id', locationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('[AutomationHistoryService] ❌ Failed to get reply history:', error);
        throw error;
      }

      console.log(`[AutomationHistoryService] 📊 Retrieved ${data?.length || 0} reply history records for location: ${locationId}`);
      return data || [];
    } catch (err) {
      console.error('[AutomationHistoryService] Error getting reply history:', err);
      return [];
    }
  }

  /**
   * Get post statistics for a location
   * @param {string} locationId - GBP location ID
   * @param {string} userId - Firebase user ID
   */
  async getPostStats(locationId, userId) {
    try {
      await this.initialize();

      const { data, error } = await this.client
        .from('automation_post_history')
        .select('status')
        .eq('location_id', locationId)
        .eq('user_id', userId);

      if (error) {
        console.error('[AutomationHistoryService] ❌ Failed to get post stats:', error);
        throw error;
      }

      const total = data.length;
      const successful = data.filter(d => d.status === 'success').length;
      const failed = data.filter(d => d.status === 'failed').length;
      const pending = data.filter(d => d.status === 'pending').length;

      const stats = { total, successful, failed, pending };
      console.log(`[AutomationHistoryService] 📊 Post stats for location ${locationId}:`, stats);
      return stats;
    } catch (err) {
      console.error('[AutomationHistoryService] Error getting post stats:', err);
      return { total: 0, successful: 0, failed: 0, pending: 0 };
    }
  }

  /**
   * Get reply statistics for a location
   * @param {string} locationId - GBP location ID
   * @param {string} userId - Firebase user ID
   */
  async getReplyStats(locationId, userId) {
    try {
      await this.initialize();

      const { data, error } = await this.client
        .from('automation_reply_history')
        .select('status, review_rating')
        .eq('location_id', locationId)
        .eq('user_id', userId);

      if (error) {
        console.error('[AutomationHistoryService] ❌ Failed to get reply stats:', error);
        throw error;
      }

      const total = data.length;
      const successful = data.filter(d => d.status === 'success').length;
      const failed = data.filter(d => d.status === 'failed').length;
      const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

      // Calculate average rating of reviews that were replied to
      const ratings = data
        .filter(d => d.review_rating !== null)
        .map(d => d.review_rating);
      const avgRating = ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : 0;

      const stats = { total, successful, failed, successRate, avgRating: parseFloat(avgRating) };
      console.log(`[AutomationHistoryService] 📊 Reply stats for location ${locationId}:`, stats);
      return stats;
    } catch (err) {
      console.error('[AutomationHistoryService] Error getting reply stats:', err);
      return { total: 0, successful: 0, failed: 0, successRate: 0, avgRating: 0 };
    }
  }

  /**
   * Get recent activity summary (last 7 days)
   * @param {string} locationId - GBP location ID
   * @param {string} userId - Firebase user ID
   */
  async getRecentActivitySummary(locationId, userId) {
    try {
      await this.initialize();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      // Get recent posts
      const { data: posts, error: postError } = await this.client
        .from('automation_post_history')
        .select('status, created_at')
        .eq('location_id', locationId)
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgoISO);

      if (postError) throw postError;

      // Get recent replies
      const { data: replies, error: replyError } = await this.client
        .from('automation_reply_history')
        .select('status, created_at')
        .eq('location_id', locationId)
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgoISO);

      if (replyError) throw replyError;

      const summary = {
        last7Days: {
          posts: posts.length,
          successfulPosts: posts.filter(p => p.status === 'success').length,
          replies: replies.length,
          successfulReplies: replies.filter(r => r.status === 'success').length
        }
      };

      console.log(`[AutomationHistoryService] 📊 Recent activity summary for location ${locationId}:`, summary);
      return summary;
    } catch (err) {
      console.error('[AutomationHistoryService] Error getting recent activity summary:', err);
      return {
        last7Days: {
          posts: 0,
          successfulPosts: 0,
          replies: 0,
          successfulReplies: 0
        }
      };
    }
  }

  /**
   * Delete old history records (cleanup utility)
   * @param {number} daysToKeep - Number of days of history to keep (default: 90)
   */
  async cleanupOldHistory(daysToKeep = 90) {
    try {
      await this.initialize();

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffDateISO = cutoffDate.toISOString();

      // Delete old post history
      const { error: postError } = await this.client
        .from('automation_post_history')
        .delete()
        .lt('created_at', cutoffDateISO);

      if (postError) throw postError;

      // Delete old reply history
      const { error: replyError } = await this.client
        .from('automation_reply_history')
        .delete()
        .lt('created_at', cutoffDateISO);

      if (replyError) throw replyError;

      console.log(`[AutomationHistoryService] 🧹 Cleaned up history older than ${daysToKeep} days`);
      return true;
    } catch (err) {
      console.error('[AutomationHistoryService] Error cleaning up old history:', err);
      return false;
    }
  }
}

// Create singleton instance
const automationHistoryService = new AutomationHistoryService();

export default automationHistoryService;
export { AutomationHistoryService };
