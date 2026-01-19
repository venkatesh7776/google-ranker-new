import supabaseConfig from '../config/supabase.js';
import supabaseSubscriptionService from './supabaseSubscriptionService.js';
import supabaseUserMappingService from './supabaseUserMappingService.js';

/**
 * Supabase-based Admin User Service
 * Replaces Firebase Admin SDK with Supabase Admin API
 */
class SupabaseAdminUserService {
  constructor() {
    this.supabase = null;
  }

  async ensureInitialized() {
    try {
      await supabaseConfig.ensureInitialized();
      this.supabase = supabaseConfig.getClient();
      return true;
    } catch (error) {
      console.error('[SupabaseAdminUserService] Initialization error:', error);
      return false;
    }
  }

  /**
   * Get all users from Supabase Auth with subscription data
   */
  async getAllUsers({ page = 1, limit = 50, search = '', status = 'all' }) {
    try {
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        throw new Error('Supabase is not initialized');
      }

      console.log('[SupabaseAdminUserService] Fetching users from Supabase Auth...');

      // Get users from Supabase Auth admin API
      // Note: This requires service_role key
      const { data: authData, error: authError } = await this.supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000 // Get all users first, then filter/paginate
      });

      if (authError) {
        console.error('[SupabaseAdminUserService] Auth error:', authError);
        throw new Error(`Failed to fetch users: ${authError.message}`);
      }

      const authUsers = authData?.users || [];
      console.log(`[SupabaseAdminUserService] Found ${authUsers.length} users in Supabase Auth`);

      // Get all subscriptions
      const subscriptions = await supabaseSubscriptionService.getAllSubscriptions();
      const subscriptionsByUserId = {};
      const subscriptionsByEmail = {};

      subscriptions.forEach(sub => {
        if (sub.userId) subscriptionsByUserId[sub.userId] = sub;
        if (sub.email) subscriptionsByEmail[sub.email.toLowerCase()] = sub;
      });

      // Get user-GBP mappings
      const mapping = await supabaseUserMappingService.getAllMappings();

      // Combine user data with subscriptions
      let users = authUsers.map(user => {
        // Try to find subscription by user ID first, then by email
        let subscription = subscriptionsByUserId[user.id] ||
                          subscriptionsByEmail[user.email?.toLowerCase()];

        // Also check mapping
        const gbpAccountId = mapping.userToGbpMapping?.[user.id] ||
                            mapping.userToGbpMapping?.[user.email];

        return {
          uid: user.id,
          email: user.email || 'N/A',
          displayName: user.user_metadata?.full_name ||
                      user.user_metadata?.name ||
                      user.user_metadata?.display_name ||
                      user.email?.split('@')[0] ||
                      'N/A',
          emailVerified: user.email_confirmed_at ? true : false,
          disabled: user.banned_until ? true : false,
          createdAt: user.created_at,
          lastLoginAt: user.last_sign_in_at,
          provider: user.app_metadata?.provider || 'email',
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          gbpAccountId: gbpAccountId || subscription?.gbpAccountId || null,
          subscription: subscription ? {
            status: subscription.status,
            planId: subscription.planId,
            trialEndDate: subscription.trialEndDate,
            subscriptionEndDate: subscription.subscriptionEndDate,
            profileCount: subscription.profileCount || 0,
            paidSlots: subscription.paidSlots || 0
          } : null
        };
      });

      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(user =>
          user.email?.toLowerCase().includes(searchLower) ||
          user.displayName?.toLowerCase().includes(searchLower) ||
          user.uid.toLowerCase().includes(searchLower)
        );
      }

      // Filter by subscription status
      if (status !== 'all') {
        if (status === 'none') {
          users = users.filter(user => !user.subscription);
        } else {
          users = users.filter(user => user.subscription?.status === status);
        }
      }

      // Sort by created date (newest first)
      users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const total = users.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);

      return {
        users: paginatedUsers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[SupabaseAdminUserService] Error getting users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID with detailed information
   */
  async getUserById(uid) {
    try {
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        throw new Error('Supabase is not initialized');
      }

      const { data: userData, error } = await this.supabase.auth.admin.getUserById(uid);

      if (error) {
        throw new Error(`Failed to fetch user: ${error.message}`);
      }

      const user = userData?.user;
      if (!user) {
        throw new Error('User not found');
      }

      // Get subscription data
      const subscriptions = await supabaseSubscriptionService.getAllSubscriptions();
      const subscription = subscriptions.find(sub =>
        sub.userId === uid || sub.email?.toLowerCase() === user.email?.toLowerCase()
      );

      // Get mapping
      const mapping = await supabaseUserMappingService.getAllMappings();
      const gbpAccountId = mapping.userToGbpMapping?.[uid] || subscription?.gbpAccountId;

      return {
        uid: user.id,
        email: user.email,
        displayName: user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    user.email?.split('@')[0] ||
                    'N/A',
        emailVerified: user.email_confirmed_at ? true : false,
        disabled: user.banned_until ? true : false,
        phone: user.phone,
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        createdAt: user.created_at,
        lastLoginAt: user.last_sign_in_at,
        provider: user.app_metadata?.provider || 'email',
        providers: user.app_metadata?.providers || [],
        role: user.user_metadata?.role || user.app_metadata?.role || 'user',
        gbpAccountId,
        subscription: subscription || null
      };
    } catch (error) {
      console.error('[SupabaseAdminUserService] Error getting user:', error);
      throw error;
    }
  }

  /**
   * Update user role (using user_metadata)
   */
  async setUserRole(uid, role, adminLevel = 'viewer') {
    try {
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        throw new Error('Supabase is not initialized');
      }

      const { error } = await this.supabase.auth.admin.updateUserById(uid, {
        user_metadata: {
          role,
          adminLevel
        }
      });

      if (error) {
        throw new Error(`Failed to update user role: ${error.message}`);
      }

      return {
        success: true,
        message: `User role updated to ${role}${role === 'admin' ? ` (${adminLevel})` : ''}`
      };
    } catch (error) {
      console.error('[SupabaseAdminUserService] Error setting user role:', error);
      throw error;
    }
  }

  /**
   * Disable/Enable user account
   */
  async toggleUserStatus(uid, disabled) {
    try {
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        throw new Error('Supabase is not initialized');
      }

      if (disabled) {
        // Ban user for 100 years (effectively permanent)
        const banUntil = new Date();
        banUntil.setFullYear(banUntil.getFullYear() + 100);

        const { error } = await this.supabase.auth.admin.updateUserById(uid, {
          ban_duration: '876000h' // ~100 years
        });

        if (error) {
          throw new Error(`Failed to disable user: ${error.message}`);
        }
      } else {
        // Unban user
        const { error } = await this.supabase.auth.admin.updateUserById(uid, {
          ban_duration: 'none'
        });

        if (error) {
          throw new Error(`Failed to enable user: ${error.message}`);
        }
      }

      return {
        success: true,
        message: disabled ? 'User account suspended' : 'User account activated'
      };
    } catch (error) {
      console.error('[SupabaseAdminUserService] Error toggling user status:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        throw new Error('Supabase is not initialized');
      }

      // Get all users
      const { data: authData, error: authError } = await this.supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });

      if (authError) {
        throw new Error(`Failed to fetch users: ${authError.message}`);
      }

      const allUsers = authData?.users || [];

      // Get subscriptions
      const subscriptions = await supabaseSubscriptionService.getAllSubscriptions();

      const stats = {
        totalUsers: allUsers.length,
        activeSubscriptions: 0,
        trialSubscriptions: 0,
        expiredSubscriptions: 0,
        cancelledSubscriptions: 0,
        noSubscription: 0,
        emailVerified: 0,
        disabledUsers: 0,
        googleUsers: 0,
        emailUsers: 0
      };

      // Count subscriptions by status
      subscriptions.forEach(sub => {
        switch (sub.status) {
          case 'active':
            stats.activeSubscriptions++;
            break;
          case 'trial':
            stats.trialSubscriptions++;
            break;
          case 'expired':
            stats.expiredSubscriptions++;
            break;
          case 'cancelled':
            stats.cancelledSubscriptions++;
            break;
        }
      });

      stats.noSubscription = stats.totalUsers - (stats.activeSubscriptions + stats.trialSubscriptions + stats.expiredSubscriptions + stats.cancelledSubscriptions);
      if (stats.noSubscription < 0) stats.noSubscription = 0;

      // Count user statuses
      allUsers.forEach(user => {
        if (user.email_confirmed_at) stats.emailVerified++;
        if (user.banned_until) stats.disabledUsers++;
        if (user.app_metadata?.provider === 'google') {
          stats.googleUsers++;
        } else {
          stats.emailUsers++;
        }
      });

      return stats;
    } catch (error) {
      console.error('[SupabaseAdminUserService] Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(uid) {
    try {
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        throw new Error('Supabase is not initialized');
      }

      const { error } = await this.supabase.auth.admin.deleteUser(uid);

      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }

      return {
        success: true,
        message: 'User account deleted successfully'
      };
    } catch (error) {
      console.error('[SupabaseAdminUserService] Error deleting user:', error);
      throw error;
    }
  }
}

export default new SupabaseAdminUserService();
