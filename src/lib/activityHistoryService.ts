/**
 * Activity History Service
 * Frontend service for fetching automation activity history from backend
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

interface Activity {
  id: string;
  location_id: string;
  user_id: string;
  created_at: string;
  status: 'success' | 'failed' | 'pending';
  error_message?: string;
  metadata?: any;
}

interface PostActivity extends Activity {
  post_content?: string;
  post_summary?: string;
}

interface ReplyActivity extends Activity {
  review_id: string;
  reviewer_name?: string;
  review_rating?: number;
  review_content?: string;
  reply_content?: string;
}

interface ActivityStats {
  total: number;
  successful: number;
  failed: number;
  pending?: number;
  successRate?: number;
  avgRating?: number;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

class ActivityHistoryService {
  private cache: Map<string, CachedData<any>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;

    const now = Date.now();
    return (now - cached.timestamp) < CACHE_TTL;
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(cacheKey: string): T | null {
    if (!this.isCacheValid(cacheKey)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return this.cache.get(cacheKey)?.data || null;
  }

  /**
   * Set data in cache
   */
  private setCache<T>(cacheKey: string, data: T): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear cache for specific location
   */
  clearLocationCache(locationId: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(locationId)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Fetch auto-post activity history
   */
  async fetchAutoPostActivity(
    locationId: string,
    userId: string,
    limit: number = 20,
    offset: number = 0,
    useCache: boolean = true
  ): Promise<{ history: PostActivity[]; stats: ActivityStats }> {
    const cacheKey = `post_${locationId}_${userId}_${limit}_${offset}`;

    // Check cache first
    if (useCache) {
      const cached = this.getFromCache<{ history: PostActivity[]; stats: ActivityStats }>(cacheKey);
      if (cached) {
        console.log(`[ActivityHistoryService] Returning cached post activity for ${locationId}`);
        return cached;
      }
    }

    try {
      const url = `${BACKEND_URL}/api/automation/activity/posts/${locationId}?userId=${userId}&limit=${limit}&offset=${offset}`;
      console.log(`[ActivityHistoryService] Fetching post activity from: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch post activity');
      }

      const result = {
        history: data.history || [],
        stats: data.stats || { total: 0, successful: 0, failed: 0, pending: 0 }
      };

      // Cache the result
      if (useCache) {
        this.setCache(cacheKey, result);
      }

      console.log(`[ActivityHistoryService] ✅ Fetched ${result.history.length} post activities`);
      return result;
    } catch (error) {
      console.error('[ActivityHistoryService] ❌ Error fetching post activity:', error);
      // Return empty result on error
      return {
        history: [],
        stats: { total: 0, successful: 0, failed: 0, pending: 0 }
      };
    }
  }

  /**
   * Fetch auto-reply activity history
   */
  async fetchAutoReplyActivity(
    locationId: string,
    userId: string,
    limit: number = 20,
    offset: number = 0,
    useCache: boolean = true
  ): Promise<{ history: ReplyActivity[]; stats: ActivityStats }> {
    const cacheKey = `reply_${locationId}_${userId}_${limit}_${offset}`;

    // Check cache first
    if (useCache) {
      const cached = this.getFromCache<{ history: ReplyActivity[]; stats: ActivityStats }>(cacheKey);
      if (cached) {
        console.log(`[ActivityHistoryService] Returning cached reply activity for ${locationId}`);
        return cached;
      }
    }

    try {
      const url = `${BACKEND_URL}/api/automation/activity/replies/${locationId}?userId=${userId}&limit=${limit}&offset=${offset}`;
      console.log(`[ActivityHistoryService] Fetching reply activity from: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch reply activity');
      }

      const result = {
        history: data.history || [],
        stats: data.stats || { total: 0, successful: 0, failed: 0, successRate: 0, avgRating: 0 }
      };

      // Cache the result
      if (useCache) {
        this.setCache(cacheKey, result);
      }

      console.log(`[ActivityHistoryService] ✅ Fetched ${result.history.length} reply activities`);
      return result;
    } catch (error) {
      console.error('[ActivityHistoryService] ❌ Error fetching reply activity:', error);
      // Return empty result on error
      return {
        history: [],
        stats: { total: 0, successful: 0, failed: 0, successRate: 0, avgRating: 0 }
      };
    }
  }

  /**
   * Fetch recent activity summary (last 7 days)
   */
  async fetchActivitySummary(
    locationId: string,
    userId: string,
    useCache: boolean = true
  ): Promise<{
    last7Days: {
      posts: number;
      successfulPosts: number;
      replies: number;
      successfulReplies: number;
    }
  }> {
    const cacheKey = `summary_${locationId}_${userId}`;

    // Check cache first
    if (useCache) {
      const cached = this.getFromCache<any>(cacheKey);
      if (cached) {
        console.log(`[ActivityHistoryService] Returning cached summary for ${locationId}`);
        return cached;
      }
    }

    try {
      const url = `${BACKEND_URL}/api/automation/activity/summary/${locationId}?userId=${userId}`;
      console.log(`[ActivityHistoryService] Fetching activity summary from: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch activity summary');
      }

      const result = data.last7Days || {
        posts: 0,
        successfulPosts: 0,
        replies: 0,
        successfulReplies: 0
      };

      // Cache the result
      if (useCache) {
        this.setCache(cacheKey, { last7Days: result });
      }

      console.log(`[ActivityHistoryService] ✅ Fetched activity summary`);
      return { last7Days: result };
    } catch (error) {
      console.error('[ActivityHistoryService] ❌ Error fetching activity summary:', error);
      // Return empty result on error
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
   * Refresh activity data (clear cache and fetch fresh)
   */
  async refreshPostActivity(locationId: string, userId: string, limit: number = 20) {
    this.clearLocationCache(locationId);
    return this.fetchAutoPostActivity(locationId, userId, limit, 0, false);
  }

  /**
   * Refresh reply activity data (clear cache and fetch fresh)
   */
  async refreshReplyActivity(locationId: string, userId: string, limit: number = 20) {
    this.clearLocationCache(locationId);
    return this.fetchAutoReplyActivity(locationId, userId, limit, 0, false);
  }
}

// Create singleton instance
const activityHistoryService = new ActivityHistoryService();

export default activityHistoryService;
export { ActivityHistoryService };
export type { PostActivity, ReplyActivity, ActivityStats };
