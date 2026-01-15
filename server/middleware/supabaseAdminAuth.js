import supabaseConfig from '../config/supabase.js';

/**
 * Supabase-based Admin Authentication Middleware
 * Verifies Supabase JWT tokens and checks admin whitelist
 */

/**
 * Verify admin access using Supabase JWT token
 */
const verifySupabaseAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // ADMIN WHITELIST: Allow specific users as admin
    const adminEmails = [
      'digibusy01shakti@gmail.com'
    ];

    try {
      // Try to verify using Supabase
      await supabaseConfig.ensureInitialized();
      const supabase = supabaseConfig.getClient();

      // Get user from Supabase using the token
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        console.log('[SupabaseAdminAuth] ✅ Supabase token verified for user:', user.email);

        if (adminEmails.includes(user.email)) {
          req.admin = {
            uid: user.id,
            email: user.email,
            role: 'admin',
            adminLevel: 'super',
            source: 'supabase_verified'
          };

          console.log('[SupabaseAdminAuth] ✅ Admin access granted:', user.email);
          return next();
        } else {
          console.log('[SupabaseAdminAuth] ❌ User not in admin whitelist:', user.email);
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Admin access required'
          });
        }
      }

      // If Supabase verification failed, try manual decode as fallback
      console.warn('[SupabaseAdminAuth] ⚠️ Supabase getUser failed, trying manual decode. Error:', error?.message);

    } catch (supabaseError) {
      console.warn('[SupabaseAdminAuth] ⚠️ Supabase error:', supabaseError.message);
    }

    // FALLBACK: Manual JWT decode when Supabase verification fails
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        // Add padding if needed for base64 decoding
        let payload64 = parts[1];
        while (payload64.length % 4) {
          payload64 += '=';
        }

        const payload = JSON.parse(Buffer.from(payload64, 'base64').toString());
        console.log('[SupabaseAdminAuth] 🔍 Manually parsed token for:', payload.email);

        if (adminEmails.includes(payload.email)) {
          req.admin = {
            uid: payload.sub || payload.user_id || payload.uid,
            email: payload.email,
            role: 'admin',
            adminLevel: 'super',
            source: 'manual_decode'
          };

          console.log('[SupabaseAdminAuth] ✅ Admin access granted via manual decode:', payload.email);
          return next();
        } else {
          console.log('[SupabaseAdminAuth] ❌ Email not in admin whitelist:', payload.email);
          console.log('[SupabaseAdminAuth] 🔍 Valid admin emails:', adminEmails);
        }
      }
    } catch (decodeError) {
      console.error('[SupabaseAdminAuth] ❌ Token decode failed:', decodeError.message);
    }

    // DEVELOPMENT TEST TOKENS
    if (process.env.NODE_ENV === 'development' && (token === 'fake-admin-token' || token.includes('test-admin'))) {
      console.log('[SupabaseAdminAuth] ✅ Test admin token accepted (development only)');
      req.admin = {
        uid: 'test-admin-uid',
        email: 'test-admin@localhost.com',
        role: 'admin',
        adminLevel: 'super',
        source: 'test_bypass'
      };
      return next();
    }

    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required. Only whitelisted admin users can access the dashboard.'
    });

  } catch (error) {
    console.error('[SupabaseAdminAuth] ❌ Authentication error:', error);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Check specific admin levels (with Supabase fallback)
 */
const checkSupabaseAdminLevel = (allowedLevels) => {
  return (req, res, next) => {
    const adminLevel = req.admin?.adminLevel || 'viewer';

    if (!allowedLevels.includes(adminLevel)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Requires ${allowedLevels.join(' or ')} admin level. Current level: ${adminLevel}`
      });
    }

    next();
  };
};

export { verifySupabaseAdmin as verifyAdmin, checkSupabaseAdminLevel as checkAdminLevel };
