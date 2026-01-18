import connectionPool from '../database/connectionPool.js';
import cacheManager from '../cache/cacheManager.js';
import crypto from 'crypto';
import fetch from 'node-fetch';

/**
 * Supabase Token Storage
 * Uses NEW SCHEMA with gmail_id as primary identifier
 * Tokens are stored in the users table (google_access_token, google_refresh_token, etc.)
 * Now using centralized connection pool and caching for scalability
 */
class SupabaseTokenStorage {
  constructor() {
    this.client = null;
    this.encryptionKey = process.env.TOKEN_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    this.initialized = false;
    this.initPromise = null;
  }

  async initialize() {
    if (this.initialized) {
      return this.client;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  async _doInitialize() {
    try {
      console.log('[SupabaseTokenStorage] Initializing connection from pool...');
      this.client = await connectionPool.getClient();
      this.initialized = true;
      console.log('[SupabaseTokenStorage] ✅ Using centralized connection pool');
      return this.client;
    } catch (error) {
      console.error('[SupabaseTokenStorage] ❌ Failed to get connection:', error.message);
      this.initialized = false;
      this.client = null;
      throw error;
    }
  }

  /**
   * Encrypt sensitive token data
   */
  encrypt(text) {
    try {
      if (!text) return null;

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)), iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('[SupabaseTokenStorage] Encryption error:', error);
      console.warn('[SupabaseTokenStorage] ⚠️ Storing token unencrypted due to encryption failure');
      return `UNENCRYPTED:${text}`;
    }
  }

  /**
   * Decrypt sensitive token data
   */
  decrypt(encryptedText) {
    try {
      if (!encryptedText) return null;

      // Handle unencrypted tokens
      if (encryptedText.startsWith('UNENCRYPTED:')) {
        console.warn('[SupabaseTokenStorage] ⚠️ Reading unencrypted token');
        return encryptedText.substring(12);
      }

      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted token format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)), iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('[SupabaseTokenStorage] Decryption error:', error);
      return encryptedText;
    }
  }

  /**
   * Save user token to Supabase
   * NEW SCHEMA: Tokens are stored in users table (gmail_id is primary key)
   * @param {string} gmailId - User's Gmail (PRIMARY KEY in new schema)
   */
  async saveUserToken(gmailId, tokenData) {
    try {
      console.log(`[SupabaseTokenStorage] ========================================`);
      console.log(`[SupabaseTokenStorage] 💾 SAVE USER TOKEN (new schema): ${gmailId}`);

      await this.initialize();

      if (!this.client) {
        throw new Error('Supabase not available');
      }

      // Encrypt sensitive tokens
      const encryptedAccessToken = this.encrypt(tokenData.access_token);
      const encryptedRefreshToken = tokenData.refresh_token ? this.encrypt(tokenData.refresh_token) : null;

      // Calculate expiry timestamp (Unix timestamp in milliseconds for compatibility)
      const expiryTimestamp = tokenData.expiry_date
        ? tokenData.expiry_date
        : Date.now() + (tokenData.expires_in || 3600) * 1000;

      // NEW SCHEMA: Update the users table directly
      const updateData = {
        google_access_token: encryptedAccessToken,
        google_refresh_token: encryptedRefreshToken,
        google_token_expiry: expiryTimestamp,
        has_valid_token: true,
        token_last_refreshed: new Date().toISOString(),
        token_error: null,
        updated_at: new Date().toISOString()
      };

      // If account ID is provided, update it
      if (tokenData.accountId) {
        updateData.google_account_id = tokenData.accountId;
      }

      // Upsert to users table (gmail_id is PRIMARY KEY)
      const { data, error } = await this.client
        .from('users')
        .upsert({
          gmail_id: gmailId,
          ...updateData
        }, {
          onConflict: 'gmail_id',
          returning: 'minimal'
        });

      if (error) {
        console.error(`[SupabaseTokenStorage] ❌ Error saving token:`, error);
        throw error;
      }

      console.log(`[SupabaseTokenStorage] ✅ Token saved successfully for user ${gmailId}`);
      console.log(`[SupabaseTokenStorage] Expires at: ${new Date(expiryTimestamp).toISOString()}`);

      // Invalidate cache since token was updated
      const cacheKey = cacheManager.getTokenKey(gmailId);
      cacheManager.delete(cacheKey);
      console.log(`[SupabaseTokenStorage] 🔄 Cache invalidated for user ${gmailId}`);

      console.log(`[SupabaseTokenStorage] ========================================`);

      return true;
    } catch (error) {
      console.error(`[SupabaseTokenStorage] Failed to save token for user ${gmailId}:`, error);
      console.log(`[SupabaseTokenStorage] ========================================`);
      throw error;
    }
  }

  /**
   * Get user token from Supabase (with caching)
   * NEW SCHEMA: Tokens are stored in users table (gmail_id is primary key)
   * @param {string} gmailId - User's Gmail (PRIMARY KEY in new schema)
   */
  async getUserToken(gmailId) {
    try {
      console.log(`[SupabaseTokenStorage] ========================================`);
      console.log(`[SupabaseTokenStorage] 🔍 GET USER TOKEN (new schema): ${gmailId}`);

      // Check cache first
      const cacheKey = cacheManager.getTokenKey(gmailId);
      const cached = cacheManager.get(cacheKey);

      if (cached) {
        console.log(`[SupabaseTokenStorage] ✅ Cache HIT for user ${gmailId}`);
        console.log(`[SupabaseTokenStorage] ========================================`);
        return cached;
      }

      console.log(`[SupabaseTokenStorage] ❌ Cache MISS for user ${gmailId}`);

      await this.initialize();

      if (!this.client) {
        console.log(`[SupabaseTokenStorage] ❌ Supabase not available, no token for user ${gmailId}`);
        console.log(`[SupabaseTokenStorage] ========================================`);
        return null;
      }

      // NEW SCHEMA: Fetch token from users table
      const { data, error } = await this.client
        .from('users')
        .select('gmail_id, google_access_token, google_refresh_token, google_token_expiry, google_account_id, has_valid_token')
        .eq('gmail_id', gmailId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - user needs to connect
          console.log(`[SupabaseTokenStorage] ❌ No token found for user ${gmailId}`);
          console.log(`[SupabaseTokenStorage] 💡 User needs to connect Google Business Profile`);
          console.log(`[SupabaseTokenStorage] ========================================`);
          return null;
        }
        throw error;
      }

      if (!data || !data.google_access_token) {
        console.log(`[SupabaseTokenStorage] ❌ No token data for user ${gmailId}`);
        console.log(`[SupabaseTokenStorage] ========================================`);
        return null;
      }

      // Decrypt tokens from new schema columns
      const decryptedTokens = {
        access_token: this.decrypt(data.google_access_token),
        refresh_token: data.google_refresh_token ? this.decrypt(data.google_refresh_token) : null,
        token_type: 'Bearer',
        scope: 'https://www.googleapis.com/auth/business.manage',
        expires_in: 3600, // Default
        expiry_date: data.google_token_expiry,
        accountId: data.google_account_id,
        hasValidToken: data.has_valid_token
      };

      // Check if token is expired
      const now = Date.now();
      if (data.google_token_expiry && data.google_token_expiry < now) {
        console.log(`[SupabaseTokenStorage] ⚠️ Token expired for user ${gmailId}`);
        console.log(`[SupabaseTokenStorage] Expired at: ${new Date(data.google_token_expiry).toISOString()}`);
        console.log(`[SupabaseTokenStorage] Will attempt refresh if refresh_token exists`);
      } else {
        console.log(`[SupabaseTokenStorage] ✅ Token found for user ${gmailId}`);
        console.log(`[SupabaseTokenStorage] Expires at: ${new Date(data.google_token_expiry).toISOString()}`);

        // Cache valid tokens for 2 minutes
        cacheManager.set(cacheKey, decryptedTokens, 120);
      }

      console.log(`[SupabaseTokenStorage] ========================================`);
      return decryptedTokens;
    } catch (error) {
      console.error(`[SupabaseTokenStorage] Error getting token for user ${gmailId}:`, error);
      console.log(`[SupabaseTokenStorage] ========================================`);
      return null;
    }
  }

  /**
   * Get valid token (with automatic refresh)
   * NEW SCHEMA: Uses gmail_id as primary identifier
   * @param {string} gmailId - User's Gmail (PRIMARY KEY in new schema)
   */
  async getValidToken(gmailId) {
    try {
      console.log(`[SupabaseTokenStorage] ========================================`);
      console.log(`[SupabaseTokenStorage] 🔄 GET VALID TOKEN (with auto-refresh): ${gmailId}`);

      const token = await this.getUserToken(gmailId);

      if (!token) {
        console.log(`[SupabaseTokenStorage] ❌ No valid token available for user ${gmailId}`);
        console.log(`[SupabaseTokenStorage] 💡 SOLUTION: User needs to reconnect Google Business Profile`);
        console.log(`[SupabaseTokenStorage] ========================================`);
        return null;
      }

      // Check if token is expired OR will expire soon (AGGRESSIVE REFRESH)
      const now = Date.now();
      const expiryDate = token.expiry_date;
      const REFRESH_BUFFER_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
      const timeUntilExpiry = expiryDate - now;
      const minutesUntilExpiry = Math.round(timeUntilExpiry / 1000 / 60);

      // AGGRESSIVE: Refresh if token expires in less than 30 minutes
      if (expiryDate && timeUntilExpiry < REFRESH_BUFFER_MS) {
        console.log(`[SupabaseTokenStorage] 🔄 Token expires soon (${minutesUntilExpiry} min), refreshing proactively for user ${gmailId}`);

        if (!token.refresh_token) {
          console.log(`[SupabaseTokenStorage] ❌ No refresh token available`);
          console.log(`[SupabaseTokenStorage] ========================================`);
          return null;
        }

        // Refresh the token
        const refreshedToken = await this.refreshToken(gmailId, token.refresh_token);

        if (refreshedToken) {
          console.log(`[SupabaseTokenStorage] ✅ Token refreshed successfully (new expiry: 60 min)`);
          console.log(`[SupabaseTokenStorage] ========================================`);
          return refreshedToken;
        } else {
          console.log(`[SupabaseTokenStorage] ❌ Token refresh failed - returning existing token`);
          console.log(`[SupabaseTokenStorage] ⚠️ Warning: Token may expire soon!`);
          console.log(`[SupabaseTokenStorage] ========================================`);
          // Return existing token even if refresh failed - it might still work
          return token;
        }
      }

      console.log(`[SupabaseTokenStorage] ✅ Token is valid for user ${gmailId} (expires in ${minutesUntilExpiry} min)`);
      console.log(`[SupabaseTokenStorage] ========================================`);
      return token;
    } catch (error) {
      console.error(`[SupabaseTokenStorage] Error getting valid token:`, error);
      console.log(`[SupabaseTokenStorage] ========================================`);
      return null;
    }
  }

  /**
   * Refresh OAuth token
   * NEW SCHEMA: Uses gmail_id as primary identifier
   * @param {string} gmailId - User's Gmail (PRIMARY KEY in new schema)
   */
  async refreshToken(gmailId, refreshToken) {
    try {
      console.log(`[SupabaseTokenStorage] 🔄 Refreshing token for user ${gmailId}`);

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured');
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`[SupabaseTokenStorage] Token refresh failed:`, error);

        // Log refresh failure and mark token as invalid
        await this.markTokenInvalid(gmailId, 'refresh_failed', error);

        return null;
      }

      const newTokenData = await response.json();

      // Save new token
      await this.saveUserToken(gmailId, {
        access_token: newTokenData.access_token,
        refresh_token: refreshToken, // Keep the same refresh token
        expires_in: newTokenData.expires_in || 3600,
        token_type: newTokenData.token_type,
        scope: newTokenData.scope
      });

      console.log(`[SupabaseTokenStorage] ✅ Token refreshed and saved for user ${gmailId}`);

      return {
        access_token: newTokenData.access_token,
        refresh_token: refreshToken,
        expires_in: newTokenData.expires_in || 3600,
        token_type: newTokenData.token_type,
        scope: newTokenData.scope,
        expiry_date: Date.now() + (newTokenData.expires_in || 3600) * 1000
      };
    } catch (error) {
      console.error(`[SupabaseTokenStorage] Error refreshing token:`, error);
      await this.markTokenInvalid(gmailId, 'refresh_error', error.message);
      return null;
    }
  }

  /**
   * Remove user token (clear token fields in users table)
   * NEW SCHEMA: Tokens are in users table, so we just clear the token fields
   * @param {string} gmailId - User's Gmail (PRIMARY KEY in new schema)
   */
  async removeUserToken(gmailId) {
    try {
      console.log(`[SupabaseTokenStorage] Removing token for user ${gmailId}`);

      await this.initialize();

      if (!this.client) {
        console.log(`[SupabaseTokenStorage] Supabase not available, cannot remove token`);
        return false;
      }

      // NEW SCHEMA: Clear token fields in users table (don't delete the user)
      const { error } = await this.client
        .from('users')
        .update({
          google_access_token: null,
          google_refresh_token: null,
          google_token_expiry: null,
          has_valid_token: false,
          token_error: 'Token removed by user',
          updated_at: new Date().toISOString()
        })
        .eq('gmail_id', gmailId);

      if (error) {
        console.error(`[SupabaseTokenStorage] Error removing token:`, error);
        return false;
      }

      // Invalidate cache
      const cacheKey = cacheManager.getTokenKey(gmailId);
      cacheManager.delete(cacheKey);

      console.log(`[SupabaseTokenStorage] ✅ Token removed for user ${gmailId}`);
      return true;
    } catch (error) {
      console.error(`[SupabaseTokenStorage] Error removing token:`, error);
      return false;
    }
  }

  /**
   * Mark token as invalid in the users table
   * NEW SCHEMA: Store error in users table token_error field
   * @param {string} gmailId - User's Gmail (PRIMARY KEY in new schema)
   */
  async markTokenInvalid(gmailId, errorType, errorMessage) {
    try {
      await this.initialize();

      if (!this.client) return;

      // NEW SCHEMA: Update users table with error info
      await this.client
        .from('users')
        .update({
          has_valid_token: false,
          token_error: `${errorType}: ${String(errorMessage).substring(0, 500)}`,
          updated_at: new Date().toISOString()
        })
        .eq('gmail_id', gmailId);

      console.log(`[SupabaseTokenStorage] ⚠️ Token marked as invalid for ${gmailId}: ${errorType}`);
    } catch (error) {
      console.error('[SupabaseTokenStorage] Error marking token as invalid:', error);
    }
  }

  /**
   * Health check
   * NEW SCHEMA: Check users table instead of user_tokens
   */
  async healthCheck() {
    try {
      if (!this.initialized) {
        return {
          status: 'not_initialized',
          storage: 'supabase',
          message: 'Supabase not initialized'
        };
      }

      await this.initialize();

      // NEW SCHEMA: Check users table
      const { data, error } = await this.client
        .from('users')
        .select('gmail_id')
        .limit(1);

      if (error) {
        return {
          status: 'error',
          storage: 'supabase',
          message: error.message
        };
      }

      return {
        status: 'healthy',
        storage: 'supabase',
        message: 'Supabase token storage operational (new schema with users table)'
      };
    } catch (error) {
      return {
        status: 'error',
        storage: 'supabase',
        message: error.message
      };
    }
  }
}

// Create singleton instance
const supabaseTokenStorage = new SupabaseTokenStorage();

export default supabaseTokenStorage;




