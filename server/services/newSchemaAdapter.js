/**
 * New Schema Adapter Service
 * Maps all operations to the new database schema with gmail_id as primary key
 *
 * Tables:
 * - users (gmail_id PRIMARY KEY)
 * - user_locations (gmail_id + location_id UNIQUE)
 * - qr_codes (code PRIMARY KEY, gmail_id FK)
 * - coupons (code PRIMARY KEY)
 * - coupon_usage (gmail_id + coupon_code PRIMARY KEY)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[NewSchemaAdapter] ❌ Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class NewSchemaAdapter {
  constructor() {
    console.log('[NewSchemaAdapter] ✅ Initialized with gmail_id as primary key');
  }

  // =====================================================
  // USER OPERATIONS
  // =====================================================

  /**
   * Create or update user - called during OAuth
   * IMPORTANT: Preserves subscription_status if user exists
   */
  async upsertUser(userData) {
    const {
      gmailId,
      firebaseUid,
      displayName,
      googleAccessToken,
      googleRefreshToken,
      googleTokenExpiry,
      googleAccountId,
      subscriptionStatus
    } = userData;

    if (!gmailId) {
      throw new Error('[NewSchemaAdapter] gmailId is required');
    }

    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('gmail_id, subscription_status, is_admin')
        .eq('gmail_id', gmailId)
        .single();

      const now = new Date().toISOString();
      const upsertData = {
        gmail_id: gmailId,
        updated_at: now
      };

      // Add fields if provided
      if (firebaseUid) upsertData.firebase_uid = firebaseUid;
      if (displayName) upsertData.display_name = displayName;
      if (googleAccessToken) upsertData.google_access_token = googleAccessToken;
      if (googleRefreshToken) upsertData.google_refresh_token = googleRefreshToken;
      if (googleTokenExpiry) upsertData.google_token_expiry = googleTokenExpiry;
      if (googleAccountId) upsertData.google_account_id = googleAccountId;

      // Set token validity
      if (googleAccessToken && googleRefreshToken) {
        upsertData.has_valid_token = true;
        upsertData.token_last_refreshed = now;
        upsertData.token_error = null;
      }

      // Handle new user vs existing user
      if (!existingUser) {
        // New user - set trial
        upsertData.subscription_status = subscriptionStatus || 'trial';
        upsertData.trial_start_date = now;
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 15); // 15 day trial
        upsertData.trial_end_date = trialEnd.toISOString();
        upsertData.created_at = now;
        console.log(`[NewSchemaAdapter] Creating new user: ${gmailId}`);
      } else {
        // Existing user - preserve subscription_status
        console.log(`[NewSchemaAdapter] Updating existing user: ${gmailId}`);
      }

      const { data, error } = await supabase
        .from('users')
        .upsert(upsertData, { onConflict: 'gmail_id' })
        .select()
        .single();

      if (error) throw error;
      console.log(`[NewSchemaAdapter] ✅ User upserted: ${gmailId}`);
      return data;

    } catch (error) {
      console.error('[NewSchemaAdapter] Error upserting user:', error);
      throw error;
    }
  }

  /**
   * Get user by gmail_id
   */
  async getUser(gmailId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('gmail_id', gmailId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Get user by gmail_id (alias)
   */
  async getUserByGmailId(gmailId) {
    return this.getUser(gmailId);
  }

  /**
   * Check subscription status
   * IMPORTANT: Uses .trim() to handle whitespace
   */
  async checkSubscriptionStatus(gmailId) {
    const user = await this.getUser(gmailId);

    if (!user) {
      return { isValid: false, status: 'not_found', reason: 'User not found' };
    }

    const status = (user.subscription_status || '').trim();

    // Admin = unlimited access
    if (status === 'admin' || user.is_admin) {
      return { isValid: true, status: 'admin', reason: 'Admin user' };
    }

    // Active subscription
    if (status === 'active') {
      if (user.subscription_end_date && new Date(user.subscription_end_date) < new Date()) {
        return { isValid: false, status: 'expired', reason: 'Subscription expired' };
      }
      return { isValid: true, status: 'active', reason: 'Active subscription' };
    }

    // Trial
    if (status === 'trial') {
      if (user.trial_end_date && new Date(user.trial_end_date) < new Date()) {
        return { isValid: false, status: 'trial_expired', reason: 'Trial expired' };
      }
      return { isValid: true, status: 'trial', reason: 'Trial active' };
    }

    return { isValid: false, status: status || 'unknown', reason: 'Invalid status' };
  }

  /**
   * Update user tokens
   */
  async updateUserTokens(gmailId, accessToken, refreshToken, expiryDate) {
    const { data, error } = await supabase
      .from('users')
      .update({
        google_access_token: accessToken,
        google_refresh_token: refreshToken,
        google_token_expiry: expiryDate,
        has_valid_token: true,
        token_last_refreshed: new Date().toISOString(),
        token_error: null,
        updated_at: new Date().toISOString()
      })
      .eq('gmail_id', gmailId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mark token as invalid
   */
  async markTokenInvalid(gmailId, errorMessage) {
    const { data, error } = await supabase
      .from('users')
      .update({
        has_valid_token: false,
        token_error: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('gmail_id', gmailId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(gmailId, status, paymentData = {}) {
    const updateData = {
      subscription_status: status,
      updated_at: new Date().toISOString()
    };

    if (status === 'active') {
      updateData.subscription_start_date = new Date().toISOString();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      updateData.subscription_end_date = endDate.toISOString();
    }

    if (paymentData.razorpayOrderId) updateData.razorpay_order_id = paymentData.razorpayOrderId;
    if (paymentData.razorpayPaymentId) updateData.razorpay_payment_id = paymentData.razorpayPaymentId;
    if (paymentData.amountPaid) updateData.amount_paid = paymentData.amountPaid;
    if (paymentData.profileCount) updateData.profile_count = paymentData.profileCount;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('gmail_id', gmailId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // =====================================================
  // USER LOCATIONS OPERATIONS
  // =====================================================

  /**
   * Upsert a location for a user
   * AUTO-REPLY IS ENABLED BY DEFAULT for new locations
   */
  async upsertLocation(locationData) {
    const {
      gmailId,
      locationId,
      businessName,
      address,
      category,
      keywords,
      autopostingEnabled,
      autopostingSchedule,
      autopostingFrequency,
      autopostingTimezone,
      autoreplyEnabled
    } = locationData;

    if (!gmailId || !locationId) {
      throw new Error('[NewSchemaAdapter] gmailId and locationId are required');
    }

    try {
      // First check if location already exists
      const existing = await this.getLocation(gmailId, locationId);
      const isNewLocation = !existing;

      const upsertData = {
        gmail_id: gmailId,
        location_id: locationId,
        updated_at: new Date().toISOString()
      };

      if (businessName !== undefined) upsertData.business_name = businessName;
      if (address !== undefined) upsertData.address = address;
      if (category !== undefined) upsertData.category = category;
      if (keywords !== undefined) upsertData.keywords = keywords;
      if (autopostingEnabled !== undefined) upsertData.autoposting_enabled = autopostingEnabled;
      if (autopostingSchedule !== undefined) upsertData.autoposting_schedule = autopostingSchedule;
      if (autopostingFrequency !== undefined) upsertData.autoposting_frequency = autopostingFrequency;
      if (autopostingTimezone !== undefined) upsertData.autoposting_timezone = autopostingTimezone;

      // AUTO-REPLY: Enable by default for new locations, or use provided value
      if (autoreplyEnabled !== undefined) {
        upsertData.autoreply_enabled = autoreplyEnabled;
      } else if (isNewLocation) {
        // NEW LOCATION - enable auto-reply by default!
        console.log(`[NewSchemaAdapter] 🆕 New location ${locationId} - enabling auto-reply by DEFAULT`);
        upsertData.autoreply_enabled = true;
        upsertData.autoreply_status = 'active';
      }

      // Update status based on enabled
      if (autopostingEnabled === true) upsertData.autoposting_status = 'active';
      if (autopostingEnabled === false) upsertData.autoposting_status = 'disabled';
      if (autoreplyEnabled === true) upsertData.autoreply_status = 'active';
      if (autoreplyEnabled === false) upsertData.autoreply_status = 'disabled';

      const { data, error } = await supabase
        .from('user_locations')
        .upsert(upsertData, { onConflict: 'gmail_id,location_id' })
        .select()
        .single();

      if (error) throw error;
      console.log(`[NewSchemaAdapter] ✅ Location upserted: ${locationId} for ${gmailId}`);
      return data;

    } catch (error) {
      console.error('[NewSchemaAdapter] Error upserting location:', error);
      throw error;
    }
  }

  /**
   * Get all locations for a user
   */
  async getUserLocations(gmailId) {
    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('gmail_id', gmailId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get location by gmail_id and location_id
   */
  async getLocation(gmailId, locationId) {
    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('gmail_id', gmailId)
      .eq('location_id', locationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Get all locations with autoposting enabled
   */
  async getEnabledAutopostingLocations() {
    const { data, error } = await supabase
      .from('user_locations')
      .select(`
        *,
        users!inner (
          gmail_id,
          google_access_token,
          google_refresh_token,
          google_token_expiry,
          google_account_id,
          subscription_status,
          has_valid_token,
          is_admin
        )
      `)
      .eq('autoposting_enabled', true);

    if (error) throw error;

    // Filter valid subscriptions
    return (data || []).filter(loc => {
      const status = (loc.users?.subscription_status || '').trim();
      return ['active', 'trial', 'admin'].includes(status) && loc.users?.has_valid_token;
    });
  }

  /**
   * Get all locations with autoreply enabled
   */
  async getEnabledAutoreplyLocations() {
    const { data, error } = await supabase
      .from('user_locations')
      .select(`
        *,
        users!inner (
          gmail_id,
          google_access_token,
          google_refresh_token,
          google_token_expiry,
          google_account_id,
          subscription_status,
          has_valid_token,
          is_admin
        )
      `)
      .eq('autoreply_enabled', true);

    if (error) throw error;

    return (data || []).filter(loc => {
      const status = (loc.users?.subscription_status || '').trim();
      return ['active', 'trial', 'admin'].includes(status) && loc.users?.has_valid_token;
    });
  }

  /**
   * Update post result for a location
   */
  async updatePostResult(gmailId, locationId, success, errorMsg = null) {
    const updateData = {
      last_post_date: new Date().toISOString(),
      last_post_success: success,
      updated_at: new Date().toISOString()
    };

    if (success) {
      updateData.last_post_error = null;
      // Increment total posts
      const { data: current } = await supabase
        .from('user_locations')
        .select('total_posts_created')
        .eq('gmail_id', gmailId)
        .eq('location_id', locationId)
        .single();
      updateData.total_posts_created = (current?.total_posts_created || 0) + 1;
    } else {
      updateData.last_post_error = errorMsg;
    }

    const { data, error } = await supabase
      .from('user_locations')
      .update(updateData)
      .eq('gmail_id', gmailId)
      .eq('location_id', locationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // =====================================================
  // QR CODE OPERATIONS
  // =====================================================

  /**
   * Upsert QR code
   */
  async upsertQRCode(qrData) {
    const {
      code,
      gmailId,
      userId,
      locationId,
      locationName,
      address,
      placeId,
      qrDataUrl,
      reviewLink,
      publicReviewUrl,
      keywords,
      businessCategory
    } = qrData;

    if (!code || !gmailId || !locationId) {
      throw new Error('[NewSchemaAdapter] code, gmailId, and locationId are required');
    }

    const upsertData = {
      code,
      gmail_id: gmailId,
      user_id: userId,
      location_id: locationId,
      updated_at: new Date().toISOString()
    };

    if (locationName !== undefined) upsertData.location_name = locationName;
    if (address !== undefined) upsertData.address = address;
    if (placeId !== undefined) upsertData.place_id = placeId;
    if (qrDataUrl !== undefined) upsertData.qr_data_url = qrDataUrl;
    if (reviewLink !== undefined) upsertData.review_link = reviewLink;
    if (publicReviewUrl !== undefined) upsertData.public_review_url = publicReviewUrl;
    if (keywords !== undefined) upsertData.keywords = keywords;
    if (businessCategory !== undefined) upsertData.business_category = businessCategory;

    const { data, error } = await supabase
      .from('qr_codes')
      .upsert(upsertData, { onConflict: 'code' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get QR codes for a user
   */
  async getUserQRCodes(gmailId) {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('gmail_id', gmailId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get QR code by code
   */
  async getQRCode(code) {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Increment QR scan count
   */
  async incrementQRScan(code) {
    const { data, error } = await supabase
      .from('qr_codes')
      .update({
        scans: supabase.rpc('increment', { x: 1 }),
        last_scanned_at: new Date().toISOString()
      })
      .eq('code', code)
      .select()
      .single();

    // Fallback if rpc doesn't work
    if (error) {
      const qr = await this.getQRCode(code);
      if (qr) {
        const { data: updated } = await supabase
          .from('qr_codes')
          .update({
            scans: (qr.scans || 0) + 1,
            last_scanned_at: new Date().toISOString()
          })
          .eq('code', code)
          .select()
          .single();
        return updated;
      }
    }
    return data;
  }

  // =====================================================
  // COUPON OPERATIONS
  // =====================================================

  /**
   * Create coupon
   */
  async createCoupon(couponData) {
    const {
      code,
      gmailId,
      discountType,
      discountValue,
      maxUses,
      validFrom,
      validUntil,
      singleUse
    } = couponData;

    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        gmail_id: gmailId,
        discount_type: discountType,
        discount_value: discountValue,
        max_uses: maxUses,
        valid_from: validFrom,
        valid_until: validUntil,
        single_use: singleUse || false,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get coupon by code
   */
  async getCoupon(code) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Validate and apply coupon
   */
  async validateCoupon(code, gmailId) {
    const coupon = await this.getCoupon(code);

    if (!coupon) {
      return { valid: false, reason: 'Coupon not found' };
    }

    if (!coupon.is_active) {
      return { valid: false, reason: 'Coupon is inactive' };
    }

    if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) {
      return { valid: false, reason: 'Coupon not yet valid' };
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return { valid: false, reason: 'Coupon expired' };
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return { valid: false, reason: 'Coupon max uses reached' };
    }

    // Check if single use and already used by this user
    if (coupon.single_use) {
      const { data: usage } = await supabase
        .from('coupon_usage')
        .select('*')
        .eq('gmail_id', gmailId)
        .eq('coupon_code', code.toUpperCase())
        .single();

      if (usage) {
        return { valid: false, reason: 'Coupon already used' };
      }
    }

    return {
      valid: true,
      coupon,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value
    };
  }

  /**
   * Use coupon
   */
  async useCoupon(code, gmailId) {
    const upperCode = code.toUpperCase();

    // Record usage
    await supabase
      .from('coupon_usage')
      .insert({
        gmail_id: gmailId,
        coupon_code: upperCode
      });

    // Increment used_count
    const coupon = await this.getCoupon(upperCode);
    await supabase
      .from('coupons')
      .update({
        used_count: (coupon.used_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('code', upperCode);

    return true;
  }

  /**
   * Get all coupons (admin)
   */
  async getAllCoupons() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // =====================================================
  // ADMIN OPERATIONS
  // =====================================================

  /**
   * Get all users (admin)
   */
  async getAllUsers(limit = 100, offset = 0) {
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { users: data || [], total: count };
  }

  /**
   * Search users by email
   */
  async searchUsers(searchTerm) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('gmail_id', `%${searchTerm}%`)
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  /**
   * Set user as admin
   */
  async setAdmin(gmailId, isAdmin = true) {
    const { data, error } = await supabase
      .from('users')
      .update({
        is_admin: isAdmin,
        subscription_status: isAdmin ? 'admin' : 'trial',
        updated_at: new Date().toISOString()
      })
      .eq('gmail_id', gmailId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Check if user is admin
   */
  async isAdmin(gmailId) {
    const user = await this.getUser(gmailId);
    if (!user) return false;
    const status = (user.subscription_status || '').trim();
    return user.is_admin === true || status === 'admin';
  }
}

const newSchemaAdapter = new NewSchemaAdapter();
export default newSchemaAdapter;
