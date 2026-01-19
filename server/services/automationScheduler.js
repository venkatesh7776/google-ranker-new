import cron from 'node-cron';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import supabaseTokenStorage from './supabaseTokenStorage.js';
import supabaseAutomationService from './supabaseAutomationService.js';
import automationHistoryService from './automationHistoryService.js';
import subscriptionGuard from './subscriptionGuard.js';
import appConfig from '../config.js';
import { getCategoryMapping, generateCategoryPrompt } from '../config/categoryReviewMapping.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default timezone for all scheduled tasks (IST - Indian Standard Time)
const DEFAULT_TIMEZONE = appConfig.timezone || 'Asia/Kolkata';

class AutomationScheduler {
  constructor() {
    // REMOVED: JSON file storage - now using Supabase only
    // NEW SCHEMA: Uses gmail_id as primary identifier instead of userId
    this.settings = { automations: {} }; // In-memory cache, loaded from Supabase
    this.scheduledJobs = new Map();
    this.reviewCheckIntervals = new Map();

    // Post creation locks to prevent duplicate posts (fixes 3 posts at same time issue)
    this.postCreationLocks = new Map(); // locationId -> timestamp of last post creation
    this.DUPLICATE_POST_WINDOW = 60 * 1000; // 60 seconds - prevent duplicate posts within this window

    // Gemini AI configuration from environment variables
    this.geminiApiKey = process.env.GEMINI_API_KEY || appConfig.geminiApiKey || '';
    this.geminiModel = process.env.GEMINI_MODEL || appConfig.geminiModel || 'gemini-2.0-flash';

    // Log Gemini AI configuration status
    console.log('[AutomationScheduler] ✅ Gemini AI Configuration:');
    console.log(`  - API Key: ${this.geminiApiKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  - Model: ✅ ${this.geminiModel}`);
    console.log('[AutomationScheduler] ✅ Using NEW SCHEMA with gmail_id as primary identifier');
  }

  // Load settings from Supabase (called on initialization)
  // NEW SCHEMA: Uses gmail_id as primary identifier
  async loadSettings() {
    try {
      console.log('[AutomationScheduler] 📥 Loading automation settings from Supabase (new schema)...');
      const allSettings = await supabaseAutomationService.getAllEnabledAutomations();

      // Convert Supabase format to existing format for compatibility
      this.settings = { automations: {} };
      for (const setting of allSettings) {
        // formatSettings returns camelCase properties: locationId, gmailId, userId, etc.
        const locationId = setting.locationId || setting.location_id;

        if (!locationId) {
          console.error(`[AutomationScheduler] ❌ Skipping setting without location_id:`, setting);
          continue;
        }

        // The setting object already has the full settings merged in from formatSettings
        // Use the setting object directly instead of trying to parse setting.settings
        // NEW SCHEMA: gmailId is the primary identifier, userId is an alias
        this.settings.automations[locationId] = setting;

        // Ensure gmailId is set (new schema) - userId is alias for gmailId
        if (!setting.gmailId && setting.userId) {
          this.settings.automations[locationId].gmailId = setting.userId;
        }

        // 🔧 FIX: Ensure autoPosting.enabled is set if database enabled=true
        // This prevents the double-check from filtering out accounts
        if (setting.enabled && setting.autoPosting) {
          if (!setting.autoPosting.enabled) {
            console.log(`[AutomationScheduler] ⚠️ Fixing autoPosting.enabled for location ${locationId} - setting to true`);
            setting.autoPosting.enabled = true;
            this.settings.automations[locationId].autoPosting.enabled = true;
          }
        }

        // 🔧 FIX: Ensure autoReply is properly configured if database autoReplyEnabled=true
        if (setting.autoReplyEnabled) {
          // Create autoReply object if it doesn't exist
          if (!setting.autoReply) {
            setting.autoReply = { enabled: true };
            this.settings.automations[locationId].autoReply = { enabled: true };
          }
          // Ensure enabled is set
          if (!setting.autoReply.enabled) {
            console.log(`[AutomationScheduler] ⚠️ Fixing autoReply.enabled for location ${locationId} - setting to true`);
            setting.autoReply.enabled = true;
            this.settings.automations[locationId].autoReply.enabled = true;
          }
          // Ensure autoReply has all required fields for reply generation
          setting.autoReply.businessName = setting.businessName || 'Business';
          setting.autoReply.keywords = setting.keywords || '';
          setting.autoReply.category = setting.category || 'business';
          setting.autoReply.userId = setting.gmailId || setting.userId;
          setting.autoReply.gmailId = setting.gmailId || setting.userId;
          setting.autoReply.accountId = setting.accountId;
          setting.autoReply.gbpAccountId = setting.accountId;
          this.settings.automations[locationId].autoReply = setting.autoReply;
          console.log(`[AutomationScheduler] ✅ AutoReply configured for ${locationId}:`, {
            enabled: setting.autoReply.enabled,
            businessName: setting.autoReply.businessName,
            accountId: setting.autoReply.accountId,
            userId: setting.autoReply.userId
          });
        }

        console.log(`[AutomationScheduler] ✅ Loaded settings for location ${locationId}:`, {
          databaseEnabled: setting.enabled,
          hasAutoPosting: !!setting?.autoPosting,
          autoPostingEnabled: setting?.autoPosting?.enabled,
          hasAutoReply: !!setting?.autoReply,
          autoReplyEnabled: setting?.autoReply?.enabled,
          gmailId: setting.gmailId,
          userId: setting.userId // Alias for backward compatibility
        });
      }

      console.log(`[AutomationScheduler] ✅ Loaded ${Object.keys(this.settings.automations).length} automation(s) from Supabase`);
    } catch (error) {
      console.error('[AutomationScheduler] ❌ Error loading settings from Supabase:', error);
      this.settings = { automations: {} };
    }
  }

  // Save settings to Supabase (no more JSON files)
  async saveSettings(settings = this.settings) {
    try {
      console.log('[AutomationScheduler] 💾 Automation settings updated in memory cache');
      // Settings are automatically saved to Supabase via API endpoints
      // This method now just updates the in-memory cache
    } catch (error) {
      console.error('[AutomationScheduler] Error updating settings cache:', error);
    }
  }

  // Get valid token for user with automatic refresh
  // NEW SCHEMA: gmailId is the primary identifier (userId is alias)
  async getValidTokenForUser(gmailId) {
    return await supabaseTokenStorage.getValidToken(gmailId);
  }

  // Initialize all automation schedules (now async to load from Supabase)
  async initializeAutomations() {
    console.log('[AutomationScheduler] 🚀 Initializing all automations from Supabase...');

    // Load settings from Supabase first
    await this.loadSettings();

    const automations = this.settings.automations || {};
    console.log(`[AutomationScheduler] 📋 Processing ${Object.keys(automations).length} total automation settings...`);

    let scheduledCount = 0;
    let skippedCount = 0;

    for (const [locationId, config] of Object.entries(automations)) {
      console.log(`[AutomationScheduler] 📍 Processing location ${locationId}:`, {
        userId: config.userId,
        hasAutoPosting: !!config.autoPosting,
        autoPostingEnabled: config.autoPosting?.enabled,
        hasAutoReply: !!config.autoReply,
        autoReplyEnabled: config.autoReply?.enabled
      });

      if (config.autoPosting?.enabled) {
        console.log(`[AutomationScheduler] ✅ Scheduling auto-posting for location ${locationId}`);
        // Pass full config so cron job has access to gmailId, userId, accountId
        this.scheduleAutoPosting(locationId, config.autoPosting, config);
        scheduledCount++;
      } else {
        console.log(`[AutomationScheduler] ⏭️ Skipping auto-posting for location ${locationId} - not enabled`);
        skippedCount++;
      }

      if (config.autoReply?.enabled) {
        console.log(`[AutomationScheduler] ✅ Starting review monitoring for location ${locationId}`);
        // Merge full config with autoReply settings to include businessName, keywords, etc.
        // 🔧 FIX: Include gmailId which is the primary identifier for token retrieval
        const fullAutoReplyConfig = {
          ...config.autoReply,
          businessName: config.businessName || config.autoReply.businessName || 'Business',
          keywords: config.keywords || config.autoReply.keywords || '',
          category: config.category || config.autoReply.category || 'business',
          gmailId: config.gmailId || config.autoReply.gmailId || config.userId,
          userId: config.userId || config.autoReply.userId,
          accountId: config.accountId || config.autoReply.accountId,
          gbpAccountId: config.gbpAccountId || config.autoReply.gbpAccountId || config.accountId
        };
        console.log(`[AutomationScheduler] 📋 AutoReply config for ${locationId}:`, {
          gmailId: fullAutoReplyConfig.gmailId,
          accountId: fullAutoReplyConfig.accountId,
          businessName: fullAutoReplyConfig.businessName
        });
        this.startReviewMonitoring(locationId, fullAutoReplyConfig);
      } else {
        console.log(`[AutomationScheduler] ⏭️ Skipping review monitoring for location ${locationId} - not enabled`);
      }
    }

    console.log(`[AutomationScheduler] ✅ Initialized ${this.scheduledJobs.size} posting schedules and ${this.reviewCheckIntervals.size} review monitors`);
    console.log(`[AutomationScheduler] 📊 Summary: ${scheduledCount} scheduled, ${skippedCount} skipped`);

    // Start catch-up mechanism to handle missed posts
    this.startMissedPostChecker();

    // Check for missed posts immediately on startup
    console.log('[AutomationScheduler] Running initial check for missed posts...');
    this.checkAndCreateMissedPosts();
  }

  // Start a background checker for missed posts (runs every 1 minute as per working code)
  startMissedPostChecker() {
    if (this.missedPostCheckerInterval) {
      clearInterval(this.missedPostCheckerInterval);
    }

    console.log('[AutomationScheduler] ⏰ Starting missed post checker (every 1 minute)');

    // Check every 1 minute for any posts that should have been created
    this.missedPostCheckerInterval = setInterval(async () => {
      console.log('[AutomationScheduler] 🔍 Running periodic check for missed posts...');
      await this.checkAndCreateMissedPosts();
    }, 1 * 60 * 1000); // 1 minute interval (matching working code)

    // Track last settings reload time
    this.lastSettingsReload = Date.now();
  }

  // Check for missed posts and create them
  // CRITICAL: Uses IST time comparison (matching working code)
  async checkAndCreateMissedPosts() {
    try {
      const automations = this.settings.automations || {};

      // Reload settings from database every 5 minutes to catch UI changes
      const now = Date.now();
      const SETTINGS_RELOAD_INTERVAL = 5 * 60 * 1000; // 5 minutes

      if (!this.lastSettingsReload || (now - this.lastSettingsReload) > SETTINGS_RELOAD_INTERVAL) {
        console.log('[AutomationScheduler] 🔄 Reloading settings from database to ensure freshness...');
        await this.loadSettings();
        this.lastSettingsReload = now;
      }

      // Get current time in IST (critical for correct comparison)
      const nowUTC = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const nowISTMillis = nowUTC.getTime() + istOffset;
      const nowIST = new Date(nowISTMillis);

      // Extract IST time components
      const currentISTHour = nowIST.getUTCHours();
      const currentISTMinute = nowIST.getUTCMinutes();

      console.log(`[AutomationScheduler] 📅 Checking ${Object.keys(automations).length} locations for missed posts`);
      console.log(`[AutomationScheduler] 🕐 Current IST time: ${currentISTHour}:${String(currentISTMinute).padStart(2, '0')}`);

      for (const [locationId, config] of Object.entries(automations)) {
        if (!config.autoPosting?.enabled) {
          continue;
        }

        const autoPosting = config.autoPosting;

        // Get the configured schedule time (e.g., "10:30" or "17:49")
        const scheduleTime = autoPosting.schedule || '10:00';
        const [scheduleHour, scheduleMinute] = scheduleTime.split(':').map(Number);

        // Check if we are EXACTLY at the schedule time (within current minute)
        const isExactScheduleTime = (currentISTHour === scheduleHour && currentISTMinute === scheduleMinute);

        console.log(`[AutomationScheduler] 📊 Location ${locationId}:`);
        console.log(`  - Business: ${autoPosting.businessName || config.businessName || 'Unknown'}`);
        console.log(`  - Schedule: ${scheduleTime} IST`);
        console.log(`  - Current IST: ${currentISTHour}:${String(currentISTMinute).padStart(2, '0')}`);
        console.log(`  - Is exact match: ${isExactScheduleTime}`);

        // If current IST time matches schedule, create the post
        if (isExactScheduleTime) {
          console.log(`[AutomationScheduler] ⚡ EXACT SCHEDULE TIME MATCH for ${locationId}! Creating post now...`);
          console.log(`  - Frequency: ${autoPosting.frequency}`);
          console.log(`  - 🕐 Trigger time: ${nowUTC.toISOString()}`);

          // IMPORTANT: Pass the FULL config (with gmailId, userId, accountId)
          const fullConfig = {
            ...config,
            ...autoPosting,
            gmailId: config.gmailId || config.userId,
            userId: config.userId || config.gmailId,
            accountId: config.accountId
          };

          console.log(`[AutomationScheduler] 📋 Full config for post creation:`, {
            gmailId: fullConfig.gmailId,
            userId: fullConfig.userId,
            accountId: fullConfig.accountId,
            businessName: fullConfig.businessName
          });

          // Create the post (will be prevented by lock if duplicate)
          await this.createAutomatedPost(locationId, fullConfig);

          // Update last run time in cache AND Supabase
          this.settings.automations[locationId].autoPosting.lastRun = nowUTC.toISOString();
          await this.updateAutomationSettings(locationId, this.settings.automations[locationId]);

          console.log(`[AutomationScheduler] ✅ Post created and lastRun updated for ${locationId}`);
        }
      }
    } catch (error) {
      console.error('[AutomationScheduler] ❌ Error checking missed posts:', error);
    }
  }

  // Calculate the next scheduled time based on frequency and last run
  calculateNextScheduledTime(config, lastRun) {
    if (!config.schedule || !config.frequency) {
      return null;
    }

    const [hour, minute] = config.schedule.split(':').map(Number);
    const now = new Date();

    // If never run before, schedule for today (or tomorrow if time has passed)
    if (!lastRun) {
      const scheduledToday = new Date();
      scheduledToday.setHours(hour, minute, 0, 0);

      console.log(`[AutomationScheduler] ⏰ First-time scheduling:`);
      console.log(`  - Scheduled time today: ${scheduledToday.toISOString()}`);
      console.log(`  - Current time: ${now.toISOString()}`);
      console.log(`  - Time has passed: ${scheduledToday <= now}`);

      // If scheduled time today has passed, schedule for tomorrow
      // Otherwise schedule for today
      if (scheduledToday <= now) {
        // Time has passed - for FIRST run, still allow today's time to trigger
        // so the scheduler can catch up on missed posts
        console.log(`  - Result: Returning TODAY's time (for catch-up)`);
        return scheduledToday;
      } else {
        // Time hasn't passed yet - schedule for today
        console.log(`  - Result: Scheduled for TODAY`);
        return scheduledToday;
      }
    }

    // Calculate next run based on frequency
    const nextRun = new Date(lastRun);
    nextRun.setHours(hour, minute, 0, 0);

    switch (config.frequency) {
      case 'daily':
        // Next day at scheduled time
        nextRun.setDate(nextRun.getDate() + 1);
        break;

      case 'alternative':
        // Every 2 days
        nextRun.setDate(nextRun.getDate() + 2);
        break;

      case 'weekly':
        // Next week same day
        nextRun.setDate(nextRun.getDate() + 7);
        break;

      case 'twice-weekly':
        // Next occurrence (3 or 4 days based on current day)
        const currentDay = nextRun.getDay();
        if (currentDay === 1) { // Monday -> Thursday
          nextRun.setDate(nextRun.getDate() + 3);
        } else { // Thursday -> Monday
          nextRun.setDate(nextRun.getDate() + 4);
        }
        break;

      case 'test30s':
        // Every 30 seconds
        nextRun.setSeconds(nextRun.getSeconds() + 30);
        break;

      default:
        return null;
    }

    return nextRun;
  }

  // Update automation settings (now updates Supabase AND in-memory cache)
  // NEW SCHEMA: Uses gmail_id as primary identifier
  async updateAutomationSettings(locationId, settings) {
    console.log(`[AutomationScheduler] 💾 Updating settings for location ${locationId}`);

    if (!this.settings.automations) {
      this.settings.automations = {};
    }

    // Update in-memory cache
    this.settings.automations[locationId] = {
      ...this.settings.automations[locationId],
      ...settings,
      updatedAt: new Date().toISOString()
    };

    // Save to Supabase (not JSON files anymore)
    // NEW SCHEMA: Use gmailId as primary identifier, userId is alias
    try {
      const gmailId = settings.gmailId || settings.userId || settings.autoPosting?.userId || settings.autoReply?.userId;
      if (gmailId) {
        await supabaseAutomationService.saveSettings(gmailId, locationId, {
          ...this.settings.automations[locationId],
          enabled: settings.autoPosting?.enabled || settings.autoReply?.enabled || false,
          autoReplyEnabled: settings.autoReply?.enabled || false
        });
        console.log(`[AutomationScheduler] ✅ Settings saved to Supabase for location ${locationId} (gmailId: ${gmailId})`);
      }
    } catch (error) {
      console.error('[AutomationScheduler] ❌ Error saving to Supabase:', error);
    }

    // Restart relevant automations
    if (settings.autoPosting !== undefined) {
      this.stopAutoPosting(locationId);
      if (settings.autoPosting?.enabled) {
        // Pass full settings so cron job has access to gmailId, userId, accountId
        this.scheduleAutoPosting(locationId, settings.autoPosting, settings);
      }
    }

    if (settings.autoReply !== undefined) {
      this.stopReviewMonitoring(locationId);
      if (settings.autoReply?.enabled) {
        // Merge full settings with autoReply config to include businessName, keywords, etc.
        // 🔧 FIX: Include gmailId which is the primary identifier for token retrieval
        const fullAutoReplyConfig = {
          ...settings.autoReply,
          businessName: settings.businessName || settings.autoReply.businessName || 'Business',
          keywords: settings.keywords || settings.autoReply.keywords || '',
          category: settings.category || settings.autoReply.category || 'business',
          gmailId: settings.gmailId || settings.autoReply.gmailId || settings.userId,
          userId: settings.userId || settings.autoReply.userId,
          accountId: settings.accountId || settings.autoReply.accountId,
          gbpAccountId: settings.gbpAccountId || settings.autoReply.gbpAccountId || settings.accountId
        };
        console.log(`[AutomationScheduler] 📋 AutoReply config updated for ${locationId}:`, {
          gmailId: fullAutoReplyConfig.gmailId,
          accountId: fullAutoReplyConfig.accountId,
          businessName: fullAutoReplyConfig.businessName
        });
        this.startReviewMonitoring(locationId, fullAutoReplyConfig);
      }
    }

    return this.settings.automations[locationId];
  }

  // Schedule auto-posting for a location
  // fullConfig contains gmailId, userId, accountId needed for token retrieval
  scheduleAutoPosting(locationId, config, fullConfig = null) {
    if (!config.schedule || !config.frequency) {
      console.log(`[AutomationScheduler] No schedule configured for location ${locationId}`);
      return;
    }

    // Stop existing schedule if any
    this.stopAutoPosting(locationId);

    // Merge config with fullConfig to ensure we have gmailId, userId, accountId
    const mergedConfig = {
      ...fullConfig,
      ...config,
      gmailId: fullConfig?.gmailId || fullConfig?.userId || config.gmailId || config.userId,
      userId: fullConfig?.userId || fullConfig?.gmailId || config.userId || config.gmailId,
      accountId: fullConfig?.accountId || config.accountId
    };

    let cronExpression;
    const [hour, minute] = config.schedule.split(':');

    switch (config.frequency) {
      case 'daily':
        // Daily at specified time (e.g., "09:00")
        cronExpression = `${minute} ${hour} * * *`;
        break;
      case 'alternative':
        // For "alternative" (every 2 days), run daily at scheduled time
        // The createAutomatedPost method will check lastRun and only post if 2 days have passed
        cronExpression = `${minute} ${hour} * * *`;
        break;
      case 'weekly':
        // Weekly on specified day and time
        const weekDay = config.dayOfWeek || 1; // Default Monday
        cronExpression = `${minute} ${hour} * * ${weekDay}`;
        break;
      case 'twice-weekly':
        // Twice weekly (Monday and Thursday)
        cronExpression = `${minute} ${hour} * * 1,4`;
        break;
      case 'test30s':
        // Test mode - every 30 seconds
        cronExpression = `*/30 * * * * *`;
        break;
      case 'custom':
        // Custom schedule - use first time slot for now
        if (config.customTimes && config.customTimes.length > 0) {
          const [customHour, customMinute] = config.customTimes[0].split(':');
          cronExpression = `${customMinute} ${customHour} * * *`;
        } else {
          console.log(`[AutomationScheduler] No custom times configured`);
          return;
        }
        break;
      default:
        console.log(`[AutomationScheduler] Unknown frequency: ${config.frequency}`);
        return;
    }

    console.log(`[AutomationScheduler] Scheduling auto-posting for location ${locationId} with cron: ${cronExpression}`);
    console.log(`[AutomationScheduler] 📅 Frequency: ${config.frequency}, Schedule: ${config.schedule}, Timezone: ${config.timezone || DEFAULT_TIMEZONE}`);

    const job = cron.schedule(cronExpression, async () => {
      console.log(`[AutomationScheduler] ⏰ CRON TRIGGERED - Running scheduled post for location ${locationId}`);
      console.log(`[AutomationScheduler] 🕐 Trigger time: ${new Date().toISOString()}`);
      console.log(`[AutomationScheduler] 📋 Config for post:`, {
        gmailId: mergedConfig.gmailId,
        userId: mergedConfig.userId,
        accountId: mergedConfig.accountId,
        businessName: mergedConfig.businessName
      });

      // For frequencies that need interval checking (like "alternative"), verify it's time to post
      if (mergedConfig.frequency === 'alternative') {
        const lastRun = mergedConfig.lastRun ? new Date(mergedConfig.lastRun) : null;
        const nextScheduledTime = this.calculateNextScheduledTime(mergedConfig, lastRun);
        const now = new Date();

        if (nextScheduledTime && now < nextScheduledTime) {
          console.log(`[AutomationScheduler] ⏭️  Skipping - Next post scheduled for: ${nextScheduledTime.toISOString()}`);
          console.log(`[AutomationScheduler] ⏱️  Time remaining: ${Math.floor((nextScheduledTime - now) / 1000 / 60 / 60)} hours`);
          return; // Skip this run
        }
      }

      // Use mergedConfig which includes gmailId, userId, accountId
      await this.createAutomatedPost(locationId, mergedConfig);
    }, {
      scheduled: true,
      timezone: config.timezone || DEFAULT_TIMEZONE
    });

    this.scheduledJobs.set(locationId, job);
    console.log(`[AutomationScheduler] ✅ Cron job registered. Total active jobs: ${this.scheduledJobs.size}`);
  }

  // Stop auto-posting for a location
  stopAutoPosting(locationId) {
    const job = this.scheduledJobs.get(locationId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(locationId);
      console.log(`[AutomationScheduler] Stopped auto-posting for location ${locationId}`);
    }
  }

  // Create an automated post with a provided token
  async createAutomatedPostWithToken(locationId, config, accessToken) {
    try {
      console.log(`[AutomationScheduler] Creating automated post with provided token for location ${locationId}`);
      console.log(`[AutomationScheduler] Config received:`, JSON.stringify(config, null, 2));

      // Ensure userId is set for address fetching
      const userId = config.userId || 'default';
      console.log(`[AutomationScheduler] Using userId for content generation: ${userId}`);

      // Generate post content using AI
      const postContent = await this.generatePostContent(config, locationId, userId);

      // Create the post via Google Business Profile API (v4 - current version)
      // v4 requires accountId in the path - MUST have valid accountId
      let accountId = config.accountId;

      // If accountId is missing, try to fetch it from GBP API
      if (!accountId) {
        console.log(`[AutomationScheduler] ⚠️ No accountId in config for location ${locationId}, fetching from GBP API...`);
        try {
          const accountsResponse = await fetch(
            'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (accountsResponse.ok) {
            const accountsData = await accountsResponse.json();
            const accounts = accountsData.accounts || [];
            if (accounts.length > 0) {
              accountId = accounts[0].name.split('/')[1];
              console.log(`[AutomationScheduler] ✅ Fetched accountId from GBP API: ${accountId}`);

              // Save accountId to database for future use
              const gmailId = config.gmailId || config.userId;
              if (gmailId) {
                try {
                  const { createClient } = await import('@supabase/supabase-js');
                  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
                  await supabase
                    .from('users')
                    .update({ google_account_id: accountId, updated_at: new Date().toISOString() })
                    .eq('gmail_id', gmailId);
                  console.log(`[AutomationScheduler] ✅ Saved accountId to database for user ${gmailId}`);
                } catch (saveError) {
                  console.error(`[AutomationScheduler] ⚠️ Failed to save accountId to database:`, saveError.message);
                }
              }
            }
          } else {
            console.error(`[AutomationScheduler] ❌ Failed to fetch accounts from GBP API:`, accountsResponse.status);
          }
        } catch (fetchError) {
          console.error(`[AutomationScheduler] ❌ Error fetching accountId from GBP API:`, fetchError.message);
        }
      }

      if (!accountId) {
        console.error(`[AutomationScheduler] ❌ No accountId available for location ${locationId} - cannot create post`);
        console.error(`[AutomationScheduler] User must reconnect Google Business Profile to get accountId`);
        return null;
      }
      const postUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`;
      console.log(`[AutomationScheduler] Posting to URL: ${postUrl}`);
      
      const postData = {
        languageCode: 'en',
        summary: postContent.content,
        topicType: config.topicType || 'STANDARD'
      };

      // Add call to action if generated
      if (postContent.callToAction) {
        console.log('[AutomationScheduler] Adding CTA to post:', postContent.callToAction);
        postData.callToAction = postContent.callToAction;
      } else {
        console.log('[AutomationScheduler] No CTA to add to post');
      }

      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[AutomationScheduler] ✅ Successfully created post for location ${locationId}:`, result.name || result.id);

        // Log the post creation to old activity system
        this.logAutomationActivity(locationId, 'post_created', {
          userId: config.userId || 'system',
          postId: result.name || result.id,
          content: postContent.content,
          timestamp: new Date().toISOString()
        });

        // Log to new activity history system
        await automationHistoryService.logAutoPost(
          locationId,
          config.userId || 'system',
          {
            content: postContent.content,
            summary: postContent.content.substring(0, 150),
            id: result.name || result.id,
            topicType: config.topicType || 'STANDARD',
            callToAction: postContent.callToAction
          },
          'success'
        );

        return result; // Return success result
      } else {
        const errorText = await response.text();
        console.error(`[AutomationScheduler] ❌ Failed to create post for location ${locationId}`);
        console.error(`[AutomationScheduler] HTTP Status: ${response.status} ${response.statusText}`);
        console.error(`[AutomationScheduler] Error Response:`, errorText);
        console.error(`[AutomationScheduler] Post URL used: ${postUrl}`);
        console.error(`[AutomationScheduler] Account ID: ${accountId}`);

        // Try fallback to older API if the new one fails
        console.log(`[AutomationScheduler] 🔄 Trying fallback API endpoint...`);
        return await this.createPostWithFallbackAPI(locationId, postContent, accessToken, config);
      }
    } catch (error) {
      console.error(`[AutomationScheduler] Error creating automated post:`, error);

      // Log failure to activity history
      await automationHistoryService.logAutoPost(
        locationId,
        config.userId || 'system',
        {
          content: error.message,
          summary: `Failed to create post: ${error.message}`
        },
        'failed',
        error
      );

      return null; // Return null to indicate failure
    }
  }

  // Fallback method for post creation using alternative API
  async createPostWithFallbackAPI(locationId, postContent, accessToken, config) {
    try {
      // Use Google My Business API v4 as fallback - MUST have accountId
      const accountId = config.accountId;
      if (!accountId) {
        console.error(`[AutomationScheduler] ❌ No accountId for fallback API`);
        return null;
      }
      const fallbackUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`;
      
      console.log(`[AutomationScheduler] Using fallback API: ${fallbackUrl}`);
      
      const fallbackPostData = {
        languageCode: 'en',
        summary: postContent.content,
        topicType: config.topicType || 'STANDARD'
      };

      // Add call to action if available
      if (postContent.callToAction) {
        fallbackPostData.callToAction = postContent.callToAction;
      }

      const response = await fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fallbackPostData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[AutomationScheduler] ✅ Fallback API succeeded for location ${locationId}`);

        // Log success to activity history
        await automationHistoryService.logAutoPost(
          locationId,
          config.userId || 'system',
          {
            content: postContent.content,
            summary: postContent.content.substring(0, 150),
            id: result.name || result.id,
            topicType: config.topicType || 'STANDARD',
            callToAction: postContent.callToAction
          },
          'success'
        );

        return result;
      } else {
        const errorText = await response.text();
        console.error(`[AutomationScheduler] ❌ Fallback API also failed:`, errorText);

        // Log failure to activity history
        await automationHistoryService.logAutoPost(
          locationId,
          config.userId || 'system',
          {
            content: postContent.content,
            summary: `Fallback API failed: ${errorText.substring(0, 100)}`
          },
          'failed',
          new Error(errorText)
        );

        return null;
      }
    } catch (error) {
      console.error(`[AutomationScheduler] Fallback API error:`, error);

      // Log failure to activity history
      await automationHistoryService.logAutoPost(
        locationId,
        config.userId || 'system',
        {
          content: postContent.content,
          summary: `Fallback API error: ${error.message}`
        },
        'failed',
        error
      );

      return null;
    }
  }

  // Create an automated post
  // NEW SCHEMA: Uses gmail_id as primary identifier
  async createAutomatedPost(locationId, config) {
    try {
      console.log(`[AutomationScheduler] 🤖 Creating automated post for location ${locationId}`);
      console.log(`[AutomationScheduler] Config:`, {
        businessName: config.businessName,
        gmailId: config.gmailId,
        userId: config.userId, // Alias for gmailId
        frequency: config.frequency,
        schedule: config.schedule
      });

      // 🔒 CHECK FOR DUPLICATE POST PREVENTION LOCK
      const now = Date.now();
      const lastPostTime = this.postCreationLocks.get(locationId);

      if (lastPostTime) {
        const timeSinceLastPost = now - lastPostTime;
        const secondsSinceLastPost = Math.floor(timeSinceLastPost / 1000);

        if (timeSinceLastPost < this.DUPLICATE_POST_WINDOW) {
          console.log(`[AutomationScheduler] 🔒 DUPLICATE POST PREVENTED for location ${locationId}`);
          console.log(`[AutomationScheduler] ⏱️  Last post was ${secondsSinceLastPost} seconds ago (within ${this.DUPLICATE_POST_WINDOW / 1000}s window)`);
          console.log(`[AutomationScheduler] ✅ Skipping this post creation request to prevent duplicates`);
          return null; // Exit early - don't create duplicate post
        }
      }

      // Set lock IMMEDIATELY to prevent race conditions
      this.postCreationLocks.set(locationId, now);
      console.log(`[AutomationScheduler] 🔓 Lock acquired for location ${locationId} at ${new Date(now).toISOString()}`);

      // Try to get a valid token for the configured user first
      // NEW SCHEMA: Use gmailId as primary identifier, userId is alias
      let userToken = null;
      const targetGmailId = config.gmailId || config.userId || 'default';

      console.log(`[AutomationScheduler] ========================================`);
      console.log(`[AutomationScheduler] 🔍 TOKEN RETRIEVAL DIAGNOSTICS`);
      console.log(`[AutomationScheduler] Target Gmail ID: ${targetGmailId}`);
      console.log(`[AutomationScheduler] Attempting to get valid token for user: ${targetGmailId}`);

      userToken = await this.getValidTokenForUser(targetGmailId);

      console.log(`[AutomationScheduler] Token retrieval result:`, {
        hasToken: !!userToken,
        hasAccessToken: !!userToken?.access_token,
        hasRefreshToken: !!userToken?.refresh_token,
        tokenExpiresAt: userToken?.expiresAt ? new Date(userToken.expiresAt).toISOString() : 'N/A'
      });

      if (!userToken) {
        // Try to find any available token from automation settings
        console.log(`[AutomationScheduler] ❌ No token found for ${targetGmailId}`);
        console.log(`[AutomationScheduler] 🔍 Checking for tokens from other automation users...`);

        // Get unique gmail IDs from automation settings
        const gmailIds = this.getAutomationUserIds();
        console.log(`[AutomationScheduler] Found ${gmailIds.length} user(s) with automations:`, gmailIds);

        if (gmailIds.length > 0) {
          // Try each available user
          for (const gmailId of gmailIds) {
            if (gmailId === targetGmailId) continue; // Already tried this one
            console.log(`[AutomationScheduler] 🔄 Trying to get valid token for fallback user: ${gmailId}`);
            const validToken = await this.getValidTokenForUser(gmailId);
            if (validToken) {
              userToken = validToken;
              console.log(`[AutomationScheduler] ✅ Using valid token from fallback user: ${gmailId}`);
              break;
            } else {
              console.log(`[AutomationScheduler] ❌ Token for fallback user ${gmailId} is invalid or expired`);
            }
          }
        } else {
          console.log(`[AutomationScheduler] ❌ No other automation users found`);
        }

        if (!userToken) {
          console.error(`[AutomationScheduler] ========================================`);
          console.error(`[AutomationScheduler] ❌ CRITICAL: No valid tokens available!`);
          console.error(`[AutomationScheduler] 💡 SOLUTION: User needs to reconnect to Google Business Profile.`);
          console.error(`[AutomationScheduler] 💡 Go to: Settings > Connections > Connect Google Business Profile`);
          console.error(`[AutomationScheduler] 💡 Target Gmail ID: ${targetGmailId}`);
          console.error(`[AutomationScheduler] ========================================`);

          // Log this as a failed attempt
          this.logAutomationActivity(locationId, 'post_failed', {
            error: 'No valid tokens available',
            timestamp: new Date().toISOString(),
            reason: 'authentication_required',
            gmailId: targetGmailId,
            diagnostics: {
              targetGmailId: targetGmailId
            }
          });

          return null;
        }
      }

      console.log(`[AutomationScheduler] ✅ Valid token acquired, proceeding with post creation...`);
      console.log(`[AutomationScheduler] ========================================`);

      // 🔒 SUBSCRIPTION CHECK - Verify user has valid trial or active subscription
      const gbpAccountId = config.gbpAccountId || config.accountId;
      console.log(`[AutomationScheduler] 🔒 Validating subscription for user ${targetGmailId}, GBP Account: ${gbpAccountId}`);

      const validationResult = await subscriptionGuard.validateBeforeAutomation(targetGmailId, gbpAccountId, 'auto_posting');

      if (!validationResult.allowed) {
        console.error(`[AutomationScheduler] ❌ SUBSCRIPTION CHECK FAILED`);
        console.error(`[AutomationScheduler] Reason: ${validationResult.reason}`);
        console.error(`[AutomationScheduler] Message: ${validationResult.message}`);
        console.error(`[AutomationScheduler] 🚫 AUTO-POSTING BLOCKED - Trial/Subscription expired!`);

        // Log this blocked attempt
        this.logAutomationActivity(locationId, 'post_failed', {
          gmailId: targetGmailId,
          error: validationResult.message,
          reason: validationResult.reason,
          timestamp: new Date().toISOString(),
          blockedBy: 'subscription_guard'
        });

        return null; // Stop - don't create post
      }

      console.log(`[AutomationScheduler] ✅ Subscription validated - ${validationResult.status} (${validationResult.daysRemaining} days remaining)`);

      // Use the updated method with better API handling
      const result = await this.createAutomatedPostWithToken(locationId, config, userToken.access_token);

      // If post was created successfully, update lastRun timestamp
      if (result) {
        console.log(`[AutomationScheduler] ✅ Post created successfully, updating lastRun timestamp`);

        // Update the lastRun time in settings
        if (this.settings.automations && this.settings.automations[locationId]) {
          if (!this.settings.automations[locationId].autoPosting) {
            this.settings.automations[locationId].autoPosting = {};
          }
          this.settings.automations[locationId].autoPosting.lastRun = new Date().toISOString();
          await this.updateAutomationSettings(locationId, this.settings.automations[locationId]);
          console.log(`[AutomationScheduler] ✅ lastRun updated in Supabase: ${this.settings.automations[locationId].autoPosting.lastRun}`);
        }

        // Also update last_post_date in database for UI display
        const gmailId = config.gmailId || config.userId;
        if (gmailId) {
          await supabaseAutomationService.updatePostResult(gmailId, locationId, true);
          console.log(`[AutomationScheduler] ✅ last_post_date updated in database for ${gmailId}`);
        }
      }

      return result;

    } catch (error) {
      console.error(`[AutomationScheduler] ❌ Error creating automated post:`, error);
      console.error(`[AutomationScheduler] Error stack:`, error.stack);

      // Log the error
      // NEW SCHEMA: Use gmailId as primary identifier
      const targetGmailId = config?.gmailId || config?.userId || config?.autoPosting?.userId || 'system';
      this.logAutomationActivity(locationId, 'post_failed', {
        gmailId: targetGmailId,
        error: error.message,
        timestamp: new Date().toISOString(),
        reason: 'system_error',
        errorStack: error.stack
      });

      return null;
    }
  }

  // Smart button type selection based on business category
  smartSelectButtonType(category, phoneNumber, websiteUrl) {
    const lowerCategory = (category || '').toLowerCase();

    // Hospitality & Accommodation - prefer BOOK if website, else CALL
    if (lowerCategory.includes('hotel') || lowerCategory.includes('resort') ||
        lowerCategory.includes('accommodation') || lowerCategory.includes('inn') ||
        lowerCategory.includes('motel') || lowerCategory.includes('guest house')) {
      return websiteUrl ? 'book' : (phoneNumber ? 'call_now' : 'learn_more');
    }

    // Food & Beverage - prefer ORDER for restaurants, CALL for cafes/bars
    if (lowerCategory.includes('restaurant') || lowerCategory.includes('food') ||
        lowerCategory.includes('dining') || lowerCategory.includes('pizza') ||
        lowerCategory.includes('burger')) {
      return websiteUrl ? 'order' : (phoneNumber ? 'call_now' : 'learn_more');
    }
    if (lowerCategory.includes('cafe') || lowerCategory.includes('coffee') ||
        lowerCategory.includes('bar') || lowerCategory.includes('pub')) {
      return phoneNumber ? 'call_now' : 'learn_more';
    }

    // Health & Wellness - prefer BOOK
    if (lowerCategory.includes('salon') || lowerCategory.includes('spa') ||
        lowerCategory.includes('massage') || lowerCategory.includes('wellness') ||
        lowerCategory.includes('clinic') || lowerCategory.includes('dental') ||
        lowerCategory.includes('doctor') || lowerCategory.includes('health')) {
      return websiteUrl ? 'book' : (phoneNumber ? 'call_now' : 'learn_more');
    }

    // Fitness - prefer SIGN_UP if website, else CALL
    if (lowerCategory.includes('gym') || lowerCategory.includes('fitness') ||
        lowerCategory.includes('yoga') || lowerCategory.includes('training')) {
      return websiteUrl ? 'sign_up' : (phoneNumber ? 'call_now' : 'learn_more');
    }

    // Retail & Shopping - prefer SHOP
    if (lowerCategory.includes('shop') || lowerCategory.includes('store') ||
        lowerCategory.includes('retail') || lowerCategory.includes('boutique') ||
        lowerCategory.includes('clothing') || lowerCategory.includes('fashion') ||
        lowerCategory.includes('electronics') || lowerCategory.includes('mobile')) {
      return websiteUrl ? 'buy' : (phoneNumber ? 'call_now' : 'learn_more');
    }

    // Education - prefer SIGN_UP
    if (lowerCategory.includes('school') || lowerCategory.includes('education') ||
        lowerCategory.includes('coaching') || lowerCategory.includes('training') ||
        lowerCategory.includes('course') || lowerCategory.includes('tuition')) {
      return websiteUrl ? 'sign_up' : (phoneNumber ? 'call_now' : 'learn_more');
    }

    // Services (repair, professional) - prefer CALL
    if (lowerCategory.includes('repair') || lowerCategory.includes('service') ||
        lowerCategory.includes('plumber') || lowerCategory.includes('electrician') ||
        lowerCategory.includes('mechanic') || lowerCategory.includes('lawyer') ||
        lowerCategory.includes('accountant')) {
      return phoneNumber ? 'call_now' : 'learn_more';
    }

    // Real Estate - prefer LEARN_MORE
    if (lowerCategory.includes('real estate') || lowerCategory.includes('property') ||
        lowerCategory.includes('estate agent')) {
      return 'learn_more';
    }

    // Default: Always prefer CALL - Google will use the business profile phone number
    // Changed from conditional to always 'call_now' as per user request
    return 'call_now';
  }

  // Generate call-to-action based on button configuration
  generateCallToAction(config) {
    const button = config.button;
    const phoneNumber = config.phoneNumber;
    const websiteUrl = config.websiteUrl;
    const category = config.businessCategory || config.category || '';

    console.log('[AutomationScheduler] ========================================');
    console.log('[AutomationScheduler] 🔘 CTA BUTTON GENERATION');
    console.log('[AutomationScheduler] Config received:', {
      hasButton: !!button,
      buttonEnabled: button?.enabled,
      buttonType: button?.type,
      buttonPhoneNumber: button?.phoneNumber,
      profilePhoneNumber: phoneNumber,
      customUrl: button?.customUrl,
      websiteUrl: websiteUrl,
      category: category,
      businessCategory: config.businessCategory
    });

    // If button is explicitly disabled or type is 'none', return null
    if (button?.enabled === false || button?.type === 'none') {
      console.log('[AutomationScheduler] ❌ CTA button explicitly disabled or type is "none"');
      console.log('[AutomationScheduler] ========================================');
      return null;
    }

    // Smart default button selection based on business category if no button specified
    let buttonType = button?.type;
    if (!buttonType) {
      buttonType = this.smartSelectButtonType(category, phoneNumber, websiteUrl);
      console.log(`[AutomationScheduler] 🎯 Smart-selected button type: ${buttonType} for category: ${category}`);
    } else {
      console.log(`[AutomationScheduler] ✅ Using configured button type: ${buttonType}`);
    }

    // Handle different button types
    let actionType = 'CALL'; // Default to CALL button
    let url = button?.customUrl || websiteUrl || '';

    switch (buttonType) {
      case 'call_now':
        // Google My Business API v4 uses the business profile phone number automatically
        // We don't need to pass phone number - Google gets it from the business profile
        console.log('[AutomationScheduler] 📞 Call Now button - Using business profile phone number');
        console.log('[AutomationScheduler] 📞 Config phone (optional reference):', {
          fromButton: button?.phoneNumber || 'NONE',
          fromProfile: phoneNumber || 'NONE'
        });
        // Google My Business API v4 handles CALL action by using the business profile phone
        const callCTA = {
          actionType: 'CALL'
        };
        console.log('[AutomationScheduler] ✅ Generated CALL CTA:', callCTA);
        console.log('[AutomationScheduler] 📞 Phone number will be automatically used from business profile');
        console.log('[AutomationScheduler] ========================================');
        return callCTA;

      case 'book':
        actionType = 'BOOK';
        break;

      case 'order':
        actionType = 'ORDER';
        break;

      case 'buy':
        actionType = 'SHOP';
        break;

      case 'learn_more':
        actionType = 'LEARN_MORE';
        break;

      case 'sign_up':
        actionType = 'SIGN_UP';
        break;

      case 'auto':
        // Smart selection based on business category
        const lowerCategory = category.toLowerCase();

        if (lowerCategory.includes('restaurant') || lowerCategory.includes('food')) {
          actionType = 'ORDER';
        } else if (lowerCategory.includes('salon') || lowerCategory.includes('spa') ||
                   lowerCategory.includes('health') || lowerCategory.includes('clinic')) {
          actionType = 'BOOK';
        } else if (lowerCategory.includes('retail') || lowerCategory.includes('shop') ||
                   lowerCategory.includes('store')) {
          actionType = 'SHOP';
        } else if (lowerCategory.includes('education') || lowerCategory.includes('school') ||
                   lowerCategory.includes('course')) {
          actionType = 'SIGN_UP';
        } else {
          actionType = 'LEARN_MORE';
        }
        console.log(`[AutomationScheduler] Auto-selected CTA type: ${actionType} for category: ${category}`);
        break;
    }

    // For non-CALL actions, we need a URL
    if (!url && actionType !== 'CALL') {
      console.error(`[AutomationScheduler] ❌ ${actionType} button selected but no URL provided`);
      console.log('[AutomationScheduler] ========================================');
      return null;
    }

    const generatedCTA = {
      actionType: actionType,
      url: url
    };
    console.log('[AutomationScheduler] ✅ Generated CTA:', generatedCTA);
    console.log('[AutomationScheduler] ========================================');
    return generatedCTA;
  }

  // Fetch location details from Google API if address is missing
  async fetchLocationAddress(locationId, userId, accountId) {
    try {
      const token = await this.getValidTokenForUser(userId);
      if (!token || !token.access_token) {
        console.log('[AutomationScheduler] ⚠️ No valid token available to fetch location address');
        return null;
      }

      // Try Google My Business API v4 first if we have accountId
      if (accountId) {
        console.log('[AutomationScheduler] 📍 Fetching location address from Google API v4...');
        const v4Url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}`;

        let response = await fetch(v4Url, {
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[AutomationScheduler] 📍 Location data received:', JSON.stringify(data, null, 2).substring(0, 500));

          // Parse address from v4 API response
          if (data.address || data.storefrontAddress) {
            const addr = data.address || data.storefrontAddress;
            const result = {
              fullAddress: addr.addressLines?.join(', ') || addr.address || '',
              city: addr.locality || addr.city || '',
              region: addr.administrativeArea || addr.region || addr.state || '',
              country: addr.regionCode || addr.country || 'India',
              postalCode: addr.postalCode || ''
            };
            console.log('[AutomationScheduler] ✅ Parsed address:', result);
            return result;
          }

          // Try alternate field names
          if (data.locationName || data.title) {
            console.log('[AutomationScheduler] 📍 Using location name as fallback:', data.locationName || data.title);
            return {
              fullAddress: data.locationName || data.title || '',
              city: '',
              region: '',
              country: 'India',
              postalCode: ''
            };
          }
        } else {
          const errorText = await response.text();
          console.log('[AutomationScheduler] ⚠️ V4 API failed:', response.status, errorText.substring(0, 200));
        }
      } else {
        console.log('[AutomationScheduler] ⚠️ No accountId provided - skipping v4 API, trying v1 fallback');
      }

      // Try Business Information API v1 as fallback (doesn't need accountId)
      console.log('[AutomationScheduler] 📍 Trying Business Information API v1...');
      const v1Url = `https://mybusinessbusinessinformation.googleapis.com/v1/locations/${locationId}?readMask=storefrontAddress,title,name`;

      const response = await fetch(v1Url, {
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[AutomationScheduler] 📍 V1 Location data:', JSON.stringify(data, null, 2).substring(0, 500));

        if (data.storefrontAddress) {
          return {
            fullAddress: data.storefrontAddress.addressLines?.join(', ') || '',
            city: data.storefrontAddress.locality || '',
            region: data.storefrontAddress.administrativeArea || '',
            country: data.storefrontAddress.regionCode || 'India',
            postalCode: data.storefrontAddress.postalCode || ''
          };
        }
      }

      console.log('[AutomationScheduler] ⚠️ Could not fetch location address from Google API');
      return null;
    } catch (error) {
      console.log('[AutomationScheduler] Error fetching location address:', error.message);
      return null;
    }
  }

  // Generate post content using AI ONLY - no templates/mocks
  async generatePostContent(config, locationId, userId) {
    console.log(`[AutomationScheduler] ========================================`);
    console.log(`[AutomationScheduler] 📝 GENERATING POST CONTENT`);
    console.log(`[AutomationScheduler] Config received:`, JSON.stringify(config, null, 2));

    // Ensure we have proper business name and details
    const businessName = config.businessName || 'Business';
    const category = config.category || 'service';
    const keywords = config.keywords || 'quality, service, professional';
    let city = config.city || config.locationName || '';
    let region = config.region || '';
    let country = config.country || '';
    let fullAddress = config.fullAddress || '';
    const websiteUrl = config.websiteUrl || '';
    let postalCode = config.postalCode || config.pinCode || '';

    console.log(`[AutomationScheduler] 📍 INITIAL ADDRESS DATA FROM CONFIG:`);
    console.log(`   - city: "${city}"`);
    console.log(`   - region: "${region}"`);
    console.log(`   - country: "${country}"`);
    console.log(`   - fullAddress: "${fullAddress}"`);
    console.log(`   - postalCode: "${postalCode}"`);

    // If address is missing, fetch it from Google API
    if ((!fullAddress || !city) && locationId && userId) {
      console.log('[AutomationScheduler] 📍 Address incomplete in config, fetching from Google API...');
      const addressData = await this.fetchLocationAddress(locationId, userId, config.accountId);
      if (addressData) {
        // Only update if we got better data
        if (!fullAddress && addressData.fullAddress) {
          fullAddress = addressData.fullAddress;
        }
        if (!city && addressData.city) {
          city = addressData.city;
        }
        if (!region && addressData.region) {
          region = addressData.region;
        }
        if (!country && addressData.country) {
          country = addressData.country;
        }
        if (!postalCode && addressData.postalCode) {
          postalCode = addressData.postalCode;
        }
        console.log('[AutomationScheduler] ✅ Address data after API fetch:', {
          fullAddress, city, region, country, postalCode
        });
      }
    }

    // Build location string prioritizing city
    let locationStr = city;
    if (region && !locationStr.includes(region)) {
      locationStr = locationStr ? `${locationStr}, ${region}` : region;
    }
    if (!locationStr && fullAddress) {
      locationStr = fullAddress;
    }

    // Build complete address for the footer - THIS IS CRITICAL FOR THE ADDRESS LINE
    let completeAddress = '';

    // Priority 1: Use fullAddress if available
    if (fullAddress) {
      completeAddress = fullAddress;
      // Add region if not already included
      if (region && !completeAddress.toLowerCase().includes(region.toLowerCase())) {
        completeAddress += `, ${region}`;
      }
    }
    // Priority 2: Build from city and region
    else if (city) {
      completeAddress = city;
      if (region && !completeAddress.toLowerCase().includes(region.toLowerCase())) {
        completeAddress += `, ${region}`;
      }
    }
    // Priority 3: Try to build from locationName in config
    else if (config.locationName) {
      completeAddress = config.locationName;
      if (region) {
        completeAddress += `, ${region}`;
      }
    }

    // Add postal code if we have it and it's not already included
    if (postalCode && completeAddress && !completeAddress.includes(postalCode)) {
      completeAddress += ` ${postalCode}`;
    }

    // Add country if we have it and it's not already included (only for India)
    if (country && completeAddress && !completeAddress.toLowerCase().includes('india') && country.toLowerCase() === 'india') {
      completeAddress += `, India`;
    }

    console.log(`[AutomationScheduler] 📍 FINAL COMPLETE ADDRESS: "${completeAddress}"`)
    
    console.log(`[AutomationScheduler] ========================================`);
    console.log(`[AutomationScheduler] 🎯 POST GENERATION PARAMETERS`);
    console.log(`[AutomationScheduler] Business Name: ${businessName}`);
    console.log(`[AutomationScheduler] Category: ${category}`);
    console.log(`[AutomationScheduler] 🔑 KEYWORDS: ${keywords}`);
    console.log(`[AutomationScheduler] Location: ${locationStr}`);
    console.log(`[AutomationScheduler] Complete Address: ${completeAddress}`);
    console.log(`[AutomationScheduler] Website: ${websiteUrl}`);
    console.log(`[AutomationScheduler] ========================================`);

    if (!this.geminiApiKey) {
      throw new Error('[AutomationScheduler] Gemini AI not configured - AI generation is required');
    }
    
    try {
      // Parse keywords if it's a string
      const keywordList = typeof keywords === 'string' 
        ? keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        : keywords;
      
      // Generate unique content every time
      const randomSeed = Math.random();
      const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

      // Get business category from config and fetch category-specific guidelines
      const businessCategory = config.businessCategory || category;
      const categoryMapping = getCategoryMapping(businessCategory);

      console.log(`[AutomationScheduler] 📋 Business Category: ${businessCategory}`);
      console.log(`[AutomationScheduler] 🎯 Category Focus Areas: ${categoryMapping.focusAreas.join(', ')}`);

      // Build category-specific context
      const categoryContext = `
BUSINESS CATEGORY: ${businessCategory}

CATEGORY-SPECIFIC WRITING GUIDELINES:
- Focus on these aspects: ${categoryMapping.focusAreas.join(', ')}
- Use natural industry language like: ${categoryMapping.commonPhrases.slice(0, 6).join(', ')}
- Mention specific details such as: ${categoryMapping.specificAspects.slice(0, 6).join(', ')}
- Frame from customer perspective: ${categoryMapping.customerExperiences.slice(0, 3).join(', ')}`;

      const prompt = `Create a natural, engaging, HUMAN-LIKE Google Business Profile post for ${businessName}, a ${businessCategory}${locationStr ? ` in ${locationStr}` : ''}.

⚠️ IMPORTANT: Your response must be 80-100 WORDS (not including the address line). This is critical - do not write less than 80 words or more than 100 words.

BUSINESS DETAILS:
- Business Name: ${businessName}
- Business Type: ${businessCategory}
- Location: ${locationStr || 'local area'}
- Complete Address: ${completeAddress}
- Keywords to include: ${Array.isArray(keywordList) ? keywordList.join(', ') : keywordList}
${websiteUrl ? `- Website: ${websiteUrl}` : ''}

${categoryContext}

CRITICAL WRITING RULES - MUST FOLLOW ALL:
1. Write MAXIMUM 100 words for the main content (not including address line) - KEEP IT SHORT AND CONCISE!
2. MUST feel like it was written by a human - warm, engaging, conversational tone
3. MUST mention the exact business name "${businessName}" naturally in the content
4. MUST incorporate AT LEAST 2 business keywords naturally: ${Array.isArray(keywordList) ? keywordList.slice(0, 2).join(', ') : keywordList}
5. MUST mention city/area name within the content naturally: ${locationStr}
6. Talk about the LOCAL AREA - nearby attractions, local landmarks, what makes this location special (BRIEFLY!)
7. Mention NATURE and WEATHER if relevant (beaches, mountains, deserts) - keep it SHORT
8. Highlight the business's SPECIAL QUALITIES that make it unique
9. Write in a storytelling style but KEEP IT BRIEF - make readers FEEL the experience in FEW words
10. Use category-specific language that sounds authentic to the industry
11. Be concise and impactful - every word counts!

FORMAT REQUIREMENTS:
12. Use bullet points (•) or emojis to break up text and improve readability
13. ❌ DO NOT use asterisks (*) or underscores (_) for emphasis - no markdown formatting allowed!
14. ⚠️ CRITICAL: ALWAYS end with the address line in EXACTLY this format:

[Main post content here - MAXIMUM 100 words, human-like, brief local focus]

📍 Address: ${completeAddress}

15. The address line is MANDATORY and must be on a separate line with two line breaks before it
16. DO NOT include the address anywhere else in the post - only at the very end in the specified format

EXAMPLES OF PERFECT POSTS (EXACTLY 80-100 words - COUNT THE WORDS!):

Example 1 (92 words):
"Escape to the serene beauty of Palampur at Hotel Orchid Resorts, nestled amidst lush greenery and stunning mountain views. Perfect for a peaceful retreat or romantic getaway, this charming resort hotel offers cozy accommodations, excellent service, and a relaxing atmosphere. 🌿

• Wake up to the soothing sounds of nature
• Breathtaking Himalayan vistas 🏔️
• Enjoy nearby attractions like tea gardens & waterfalls

Whether you're unwinding at the spa or exploring local gems, Hotel Orchid Resorts in Himachal Pradesh makes every moment unforgettable.

📍 Address: [complete address]"

Example 2 (87 words):
"Looking for Port Blair beach hotels? Kevin's Bed & Breakfast is your perfect seaside escape near pristine beaches with budget-friendly comfort. 🌴 Wake up to ocean breezes and explore the stunning Andaman Islands from this cozy retreat.

• Prime beach location 🏖️
• Comfortable, clean rooms
• Walking distance to major attractions
• Friendly local hospitality

Whether you're diving into crystal-clear waters or relaxing on white sand beaches, this Port Blair gem offers authentic island experiences.

📍 Address: [complete address]"

⚠️ CRITICAL: Write EXACTLY 80-100 words for the main content. Count your words before finishing!`;

      const systemPrompt = `You are a professional, creative social media content writer for Google Business Profiles who writes like a LOCAL EXPERT sharing their favorite places.

🎯 PRIMARY RULE: Every post must be EXACTLY 80-100 WORDS (not counting the address line). This is NON-NEGOTIABLE.

CRITICAL FORMATTING RULES:
1. ⚠️ WORD COUNT: Write EXACTLY 80-100 words for main content (not including address line). Count carefully!
2. ✅ STRUCTURE: Always end with "📍 Address: [complete address]" on a separate line after two line breaks
3. 👥 TONE: Write in a HUMAN, conversational tone - warm, genuine, engaging (not robotic or corporate)
4. 💫 EXPERIENCE: Make readers FEEL the experience through vivid descriptions
5. 🗺️ LOCAL FOCUS: Mention the local area, nearby attractions, nature, weather, landmarks
6. 🎨 FORMATTING: Use bullet points (•) and emojis naturally to break up text. DO NOT use asterisks (*) for emphasis!
7. 🔑 KEYWORDS: Incorporate business keywords naturally without forcing them
8. 📝 STYLE: Write like recommending a place to a friend - enthusiastic but authentic
9. ❌ NO MARKDOWN: Do not use asterisks (*), underscores (_), or any markdown formatting. Just plain text with emojis and bullet points (•).

⚠️ REMEMBER: Your response MUST be 80-100 words (excluding address line). Too short is unacceptable!`;

      const fullPrompt = `${systemPrompt}\n\n${prompt}`;

      // 🔍 DEBUG: Log the prompt being sent to Gemini
      console.log('[AutomationScheduler] 🔍 ===== PROMPT SENT TO GEMINI =====');
      console.log('[AutomationScheduler] 📤 Prompt length:', fullPrompt.length, 'characters');
      console.log('[AutomationScheduler] 📤 Full prompt:');
      console.log(fullPrompt);
      console.log('[AutomationScheduler] 🔍 ===== END PROMPT =====');

      const generationConfig = {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000  // Increased to 1000 to account for Gemini's internal "thoughts" tokens (~478) + actual content (~150-200)
      };

      console.log('[AutomationScheduler] ⚙️ Generation config:', generationConfig);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }],
            generationConfig
          })
        }
      );

      if (response.ok) {
        const data = await response.json();

        // 🔍 DEBUG: Log full Gemini API response
        console.log('[AutomationScheduler] 🔍 ===== GEMINI API RESPONSE DEBUG =====');
        console.log('[AutomationScheduler] 📦 Full response structure:', JSON.stringify(data, null, 2));

        // Check if response has expected structure
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          console.error('[AutomationScheduler] ❌ Invalid Gemini response structure!');
          console.error('[AutomationScheduler] Response data:', data);
          throw new Error('Invalid response from Gemini API - no candidates found');
        }

        let content = data.candidates[0].content.parts[0].text.trim();

        // 🔍 DEBUG: Log raw content from Gemini
        console.log('[AutomationScheduler] 📝 Raw content from Gemini (before any processing):');
        console.log(content);
        console.log('[AutomationScheduler] 📊 Raw content word count:', content.split(' ').length);
        console.log('[AutomationScheduler] 📏 Raw content character count:', content.length);

        // Ensure the address line is properly added if not already present
        const addressLine = `📍 Address: ${completeAddress}`;
        if (completeAddress && !content.includes('📍 Address:') && !content.includes(completeAddress)) {
          // Add two line breaks and then the address
          content = content + '\n\n' + addressLine;
          console.log('[AutomationScheduler] ➕ Added address line to content');
        } else {
          console.log('[AutomationScheduler] ✓ Address already present in content');
        }

        console.log(`[AutomationScheduler] AI generated unique content (${content.split(' ').length} words)`);
        console.log(`[AutomationScheduler] Final post content with address:`, content);
        console.log('[AutomationScheduler] 🔍 ===== END DEBUG =====');

        // Generate callToAction based on button configuration
        const callToAction = this.generateCallToAction(config);

        return {
          content,
          callToAction
        };
      } else {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('[AutomationScheduler] Critical error - AI generation failed:', error);
      throw new Error(`AI content generation failed: ${error.message}. Please ensure Gemini AI is properly configured.`);
    }
  }

  // Start monitoring reviews for auto-reply
  startReviewMonitoring(locationId, config) {
    if (this.reviewCheckIntervals.has(locationId)) {
      console.log(`[AutomationScheduler] Review monitoring already active for location ${locationId}`);
      return;
    }

    console.log(`[AutomationScheduler] Starting review monitoring for location ${locationId}`);
    console.log(`[AutomationScheduler] ⚡ Auto-reply is ACTIVE - will check and reply to new reviews every 2 minutes automatically`);

    // Check for new reviews every 2 minutes for faster response
    const interval = setInterval(async () => {
      console.log(`[AutomationScheduler] 🔍 Checking for new reviews to auto-reply...`);
      await this.checkAndReplyToReviews(locationId, config);
    }, 2 * 60 * 1000); // 2 minutes

    this.reviewCheckIntervals.set(locationId, interval);
    
    // Also run immediately
    console.log(`[AutomationScheduler] Running initial review check...`);
    this.checkAndReplyToReviews(locationId, config);
  }

  // Stop review monitoring
  stopReviewMonitoring(locationId) {
    const interval = this.reviewCheckIntervals.get(locationId);
    if (interval) {
      clearInterval(interval);
      this.reviewCheckIntervals.delete(locationId);
      console.log(`[AutomationScheduler] Stopped review monitoring for location ${locationId}`);
    }
  }

  // Check for new reviews and auto-reply
  // NEW SCHEMA: Uses gmail_id as primary identifier
  async checkAndReplyToReviews(locationId, config) {
    try {
      console.log(`[AutomationScheduler] 🔍 Checking for new reviews to auto-reply for location ${locationId}`);

      // Get a valid token using the new token system
      // NEW SCHEMA: Use gmailId as primary identifier
      const targetGmailId = config.gmailId || config.userId || 'default';
      console.log(`[AutomationScheduler] Getting valid token for user: ${targetGmailId}`);

      // 🔒 SUBSCRIPTION CHECK - Verify user has valid trial or active subscription before replying
      const gbpAccountId = config.gbpAccountId || config.accountId;
      console.log(`[AutomationScheduler] 🔒 Validating subscription for user ${targetGmailId}, GBP Account: ${gbpAccountId}`);

      const validationResult = await subscriptionGuard.validateBeforeAutomation(targetGmailId, gbpAccountId, 'auto_reply');

      if (!validationResult.allowed) {
        console.error(`[AutomationScheduler] ❌ SUBSCRIPTION CHECK FAILED`);
        console.error(`[AutomationScheduler] Reason: ${validationResult.reason}`);
        console.error(`[AutomationScheduler] Message: ${validationResult.message}`);
        console.error(`[AutomationScheduler] 🚫 AUTO-REPLY BLOCKED - Trial/Subscription expired!`);

        // Log this blocked attempt
        this.logAutomationActivity(locationId, 'review_check_failed', {
          gmailId: targetGmailId,
          error: validationResult.message,
          reason: validationResult.reason,
          timestamp: new Date().toISOString(),
          blockedBy: 'subscription_guard'
        });

        return null; // Stop - don't reply to reviews
      }

      console.log(`[AutomationScheduler] ✅ Subscription validated - ${validationResult.status} (${validationResult.daysRemaining} days remaining)`);

      let userToken = await this.getValidTokenForUser(targetGmailId);

      if (!userToken) {
        // Try to find any available valid token from automation users
        console.log(`[AutomationScheduler] No token for ${targetGmailId}, checking other automation users...`);
        const gmailIds = this.getAutomationUserIds();

        if (gmailIds.length > 0) {
          for (const gmailId of gmailIds) {
            if (gmailId === targetGmailId) continue;
            const validToken = await this.getValidTokenForUser(gmailId);
            if (validToken) {
              userToken = validToken;
              console.log(`[AutomationScheduler] ⚡ Using valid token from user: ${gmailId} for review checking`);
              break;
            }
          }
        }

        if (!userToken) {
          console.error(`[AutomationScheduler] ⚠️ No valid tokens available. User needs to reconnect to Google Business Profile.`);
          console.log(`[AutomationScheduler] 💡 Token will be saved when user reconnects via Settings > Connections`);
          return null;
        }
      }

      // Get reviews from Google Business Profile API - try modern endpoint first
      let response;
      let reviews = [];
      
      // Use Google Business Profile API v4 (current version) - MUST have accountId
      const accountId = config.accountId;
      if (!accountId) {
        console.error(`[AutomationScheduler] ❌ No accountId for reviews - user must reconnect GBP`);
        return null;
      }
      console.log(`[AutomationScheduler] Fetching reviews using API v4 for location ${locationId}...`);
      response = await fetch(
        `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`,
        {
          headers: {
            'Authorization': `Bearer ${userToken.access_token}`
          }
        }
      );

      if (!response.ok) {
        console.error(`[AutomationScheduler] ❌ Failed to fetch reviews:`, await response.text());
        return;
      }

      const data = await response.json();
      reviews = data.reviews || [];
      console.log(`[AutomationScheduler] ✅ Found ${reviews.length} reviews`);

      // Get list of already replied reviews
      const repliedReviews = this.getRepliedReviews(locationId);

      // Helper to extract just the review ID from full path
      const extractReviewId = (id) => {
        if (id && id.includes('/')) {
          const parts = id.split('/');
          return parts[parts.length - 1];
        }
        return id;
      };

      // Filter reviews that need replies - AUTOMATICALLY REPLY TO ALL NEW REVIEWS
      const unrepliedReviews = reviews.filter(review => {
        const reviewId = extractReviewId(review.reviewId || review.name);
        const hasReply = review.reviewReply || review.reply;
        const alreadyReplied = repliedReviews.includes(reviewId) || repliedReviews.includes(review.name);

        if (hasReply) {
          console.log(`[AutomationScheduler] ⏭️ Skipping ${reviewId} - already has reply on Google`);
        } else if (alreadyReplied) {
          console.log(`[AutomationScheduler] ⏭️ Skipping ${reviewId} - in local replied list`);
        }

        return !hasReply && !alreadyReplied;
      });

      if (unrepliedReviews.length > 0) {
        console.log(`[AutomationScheduler] 🎯 Found ${unrepliedReviews.length} NEW REVIEWS that need automatic replies!`);
        console.log(`[AutomationScheduler] ⚡ AUTO-REPLYING NOW WITHOUT ANY MANUAL INTERVENTION...`);

        for (const review of unrepliedReviews) {
          const reviewerName = review.reviewer?.displayName || 'Unknown';

          // Convert rating string to number for display
          const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
          let rating = review.starRating?.value || review.starRating || 5;
          if (typeof rating === 'string') {
            rating = ratingMap[rating.toUpperCase()] || 5;
          }

          console.log(`[AutomationScheduler] 📝 Processing review from ${reviewerName} (${rating} stars)`);
          
          await this.replyToReview(locationId, review, config, userToken);
          
          // Add delay between replies to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        console.log(`[AutomationScheduler] ✅ AUTO-REPLY COMPLETE! All new reviews have been replied to automatically.`);
      } else {
        console.log(`[AutomationScheduler] 📭 No new reviews found. All reviews already have replies.`);
      }
    } catch (error) {
      console.error(`[AutomationScheduler] ❌ Error checking reviews:`, error);
      
      // Log the error
      this.logAutomationActivity(locationId, 'review_check_failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Check if we should reply to a review based on configuration
  shouldReplyToReview(review, config) {
    // Convert rating string to number
    const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
    let rating = review.starRating?.value || review.starRating || 5;
    if (typeof rating === 'string') {
      rating = ratingMap[rating.toUpperCase()] || 5;
    }
    
    // Reply based on configuration
    if (config.replyToAll) return true;
    if (config.replyToPositive && rating >= 4) return true;
    if (config.replyToNegative && rating <= 2) return true;
    if (config.replyToNeutral && rating === 3) return true;
    
    return false;
  }

  // Reply to a single review
  async replyToReview(locationId, review, config, token) {
    try {
      // Extract just the review ID from the full path if needed
      // Google API returns review.name as "accounts/xxx/locations/xxx/reviews/yyy"
      let reviewId = review.reviewId || review.name;
      if (reviewId && reviewId.includes('/')) {
        // Extract just the last part (the actual review ID)
        const parts = reviewId.split('/');
        reviewId = parts[parts.length - 1];
      }

      // Convert rating string to number for display
      const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
      let rating = review.starRating?.value || review.starRating || 5;
      if (typeof rating === 'string') {
        rating = ratingMap[rating.toUpperCase()] || 5;
      }

      const reviewerName = review.reviewer?.displayName || 'Unknown';

      console.log(`[AutomationScheduler] 🤖 AUTO-GENERATING AI REPLY for review ${reviewId}`);
      console.log(`[AutomationScheduler] 📊 Review details: ${rating} stars from ${reviewerName}`);
      
      // Generate reply using AI - FULLY AUTOMATIC
      const replyText = await this.generateReviewReply(review, config);
      console.log(`[AutomationScheduler] 💬 Generated reply: "${replyText.substring(0, 100)}..."`);
      
      // Send reply via Google Business Profile API - try modern endpoint first
      let success = false;
      
      // Use Google Business Profile API v4 - MUST have accountId
      const accountId = config.accountId;
      if (!accountId) {
        console.error(`[AutomationScheduler] ❌ No accountId for review reply - skipping`);
        return false;
      }
      console.log(`[AutomationScheduler] Attempting to reply using API v4...`);
      const apiResponse = await fetch(
        `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            comment: replyText
          })
        }
      );

      if (apiResponse.ok) {
        console.log(`[AutomationScheduler] ✅ Successfully replied to review ${reviewId}`);
        success = true;
      } else {
        const error = await apiResponse.text();
        console.error(`[AutomationScheduler] ❌ Failed to reply to review:`, error);
      }

      if (success) {
        // Mark review as replied
        this.markReviewAsReplied(locationId, reviewId);

        // Log the activity to old system
        this.logAutomationActivity(locationId, 'review_replied', {
          userId: config.userId || 'system',
          reviewId: reviewId,
          rating: rating,
          reviewerName: reviewerName,
          replyText,
          timestamp: new Date().toISOString()
        });

        // Log to new activity history system
        await automationHistoryService.logAutoReply(
          locationId,
          config.userId || 'system',
          {
            id: reviewId,
            reviewer: { displayName: reviewerName },
            starRating: rating,
            comment: review.comment || review.reviewText || ''
          },
          {
            comment: replyText,
            updateTime: new Date().toISOString()
          },
          'success'
        );

        console.log(`[AutomationScheduler] ✅ Review reply completed successfully!`);
      } else {
        // Log the failure to old system
        this.logAutomationActivity(locationId, 'review_reply_failed', {
          userId: config.userId || 'system',
          reviewId: reviewId,
          rating: rating,
          reviewerName: reviewerName,
          error: 'API request failed',
          timestamp: new Date().toISOString()
        });

        // Log to new activity history system
        await automationHistoryService.logAutoReply(
          locationId,
          config.userId || 'system',
          {
            id: reviewId,
            reviewer: { displayName: reviewerName },
            starRating: rating,
            comment: review.comment || review.reviewText || ''
          },
          {
            comment: replyText
          },
          'failed',
          new Error('API request failed')
        );
      }
    } catch (error) {
      console.error(`[AutomationScheduler] ❌ Error replying to review:`, error);

      // Log the error to old system
      this.logAutomationActivity(locationId, 'review_reply_failed', {
        userId: config.userId || 'system',
        reviewId: review.reviewId || review.name,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      // Log to new activity history system
      const reviewId = review.reviewId || review.name;
      const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
      let rating = review.starRating?.value || review.starRating || 5;
      if (typeof rating === 'string') {
        rating = ratingMap[rating.toUpperCase()] || 5;
      }

      await automationHistoryService.logAutoReply(
        locationId,
        config.userId || 'system',
        {
          id: reviewId,
          reviewer: { displayName: review.reviewer?.displayName || 'Unknown' },
          starRating: rating,
          comment: review.comment || review.reviewText || ''
        },
        {
          comment: 'Failed to generate reply'
        },
        'failed',
        error
      );
    }
  }

  // Generate review reply using AI ONLY - no templates
  // Format: "Dear {Client Name}, [AI-generated content] Warm regards, Team {Business Name}"
  async generateReviewReply(review, config) {
    // Convert rating string to number
    const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
    let rating = review.starRating?.value || review.starRating || 5;

    // If rating is a string like "FIVE", convert to number
    if (typeof rating === 'string') {
      rating = ratingMap[rating.toUpperCase()] || 5;
    }

    const reviewText = review.comment || '';
    const businessName = config.businessName || 'our business';
    const reviewerName = review.reviewer?.displayName || 'valued customer';
    const keywords = config.keywords || '';
    const category = config.category || 'business';

    // If no Gemini API key, use fallback smart templates
    if (!this.geminiApiKey) {
      console.log('[AutomationScheduler] ⚠️ Gemini AI not configured - using smart fallback templates');
      return this.generateFallbackReply(review, config, rating, reviewerName, businessName);
    }

    try {
      // Parse keywords if string
      const keywordList = typeof keywords === 'string'
        ? keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        : Array.isArray(keywords) ? keywords : [];

      // Determine tone based on rating
      const tone = rating >= 4 ? 'grateful, warm, and enthusiastic' :
                   rating <= 2 ? 'empathetic, apologetic, and solution-focused' :
                   'appreciative, professional, and encouraging';

      // Add variety with random elements to ensure different content every time
      const randomSeed = Math.random();
      const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
      const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

      const prompt = `Generate ONLY the middle content for a Google Business review reply for "${businessName}" (${category}).

Reviewer Name: ${reviewerName}
Rating: ${rating}/5 stars
Review Text: "${reviewText}"
Business Keywords: ${keywordList.length > 0 ? keywordList.join(', ') : 'quality service, customer satisfaction'}
Random Seed: ${randomSeed}
Time Context: ${timeOfDay}

CRITICAL FORMATTING REQUIREMENTS:
1. Generate ONLY the middle content paragraph - DO NOT include "Dear..." or "Warm regards..." or any greeting/closing
2. The content will be wrapped with:
   - Opening: "Dear ${reviewerName},"
   - Closing: "Warm regards, Team ${businessName}"
3. So you must write ONLY the middle content between these two parts

CONTENT Requirements:
1. Write EXACTLY 40-60 words for the middle content
2. Use a ${tone} tone
3. Reference something specific from their review
4. If positive (${rating >= 4}): thank them and highlight what we do well
5. If negative (${rating <= 2}): acknowledge concern, apologize sincerely, and offer solution
6. Make content DIFFERENT every time - vary vocabulary, sentence structure, focus points
7. Naturally incorporate business strengths/keywords if relevant
8. Be authentic and personalized to THIS specific review
9. DO NOT use generic phrases - make it specific to their experience

Return ONLY the middle content paragraph with no greeting or closing.`;

      // Combine system instruction with user prompt for Gemini
      const fullPrompt = `You are a professional content writer for ${businessName}. Generate ONLY the middle content of a review reply. DO NOT include greetings like "Dear..." or closings like "Warm regards" - those will be added automatically. Write authentic, varied content that is different every time. Focus on making each response unique and personalized to the specific review.

${prompt}`;

      const generationConfig = {
        temperature: 0.9, // Higher for more variation
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }],
            generationConfig
          })
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Check if response has expected Gemini structure
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          console.error('[AutomationScheduler] ❌ Invalid Gemini response structure for review reply!');
          throw new Error('Invalid response from Gemini API - no candidates found');
        }

        let middleContent = data.candidates[0].content.parts[0].text.trim();

        // Clean up any greeting/closing that AI might have added despite instructions
        middleContent = middleContent
          .replace(/^Dear\s+[^,]+,?\s*/i, '') // Remove "Dear..." if present
          .replace(/\s*(Warm regards|Best regards|Sincerely|Thank you|Thanks),?\s*Team\s+.*/i, '') // Remove closings
          .replace(/\s*(Warm regards|Best regards|Sincerely|Thank you|Thanks),?\s*$/i, '') // Remove standalone closings
          .trim();

        // Format the complete reply with proper structure
        const completeReply = `Dear ${reviewerName},

${middleContent}

Warm regards,
Team ${businessName}`;

        console.log(`[AutomationScheduler] ✅ AI generated personalized reply for ${reviewerName}`);
        console.log(`[AutomationScheduler] Reply format: "Dear ${reviewerName}, [${middleContent.split(' ').length} words] Warm regards, Team ${businessName}"`);

        return completeReply;
      } else {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('[AutomationScheduler] ⚠️ Gemini AI failed, using fallback template:', error.message);
      // Fall back to smart template instead of throwing
      return this.generateFallbackReply(review, config, rating, reviewerName, businessName);
    }
  }

  // Generate a smart fallback reply when AI is unavailable
  // This ensures reviews still get replies even without Gemini
  generateFallbackReply(review, config, rating, reviewerName, businessName) {
    const reviewText = review.comment || '';

    // Create varied responses based on rating and review content
    let middleContent = '';

    if (rating >= 4) {
      // Positive review responses - varied based on review content
      const positiveResponses = [
        `Thank you so much for your wonderful feedback! We're thrilled to hear about your positive experience with us. Your kind words mean the world to our team, and we're committed to maintaining the high standards you've come to expect.`,
        `We greatly appreciate you taking the time to share your experience! It's feedback like yours that motivates our team to continue delivering excellent service. We look forward to welcoming you back soon.`,
        `Your positive review made our day! We're delighted that you had such a great experience with us. Our team works hard to ensure every customer leaves satisfied, and it's wonderful to know we succeeded.`,
        `Thank you for this fantastic review! We're so glad we could exceed your expectations. Customer satisfaction is our top priority, and your feedback confirms we're on the right track.`
      ];
      middleContent = positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    } else if (rating <= 2) {
      // Negative review responses
      const negativeResponses = [
        `We sincerely apologize that your experience didn't meet your expectations. This is not the standard we strive for, and we take your feedback very seriously. Please reach out to us directly so we can make things right.`,
        `Thank you for bringing this to our attention. We're truly sorry to hear about your experience, and we understand your frustration. We'd love the opportunity to address your concerns personally.`,
        `We're deeply sorry that we fell short of providing the experience you deserved. Your feedback is invaluable in helping us improve. Please contact us so we can resolve this matter.`,
        `We apologize for any inconvenience you experienced. This feedback is important to us, and we're committed to doing better. We'd appreciate the chance to discuss this with you directly.`
      ];
      middleContent = negativeResponses[Math.floor(Math.random() * negativeResponses.length)];
    } else {
      // Neutral (3-star) review responses
      const neutralResponses = [
        `Thank you for sharing your feedback with us. We appreciate you taking the time to review your experience. We're always looking for ways to improve, and your insights help us do just that.`,
        `We value your honest feedback and appreciate you sharing your thoughts. We're committed to continuous improvement and hope to exceed your expectations on your next visit.`,
        `Thank you for your review. We appreciate hearing about your experience and are always working to enhance our service. We hope to have the opportunity to impress you in the future.`
      ];
      middleContent = neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
    }

    // Format the complete reply
    const completeReply = `Dear ${reviewerName},

${middleContent}

Warm regards,
Team ${businessName}`;

    console.log(`[AutomationScheduler] ✅ Generated fallback reply for ${reviewerName} (${rating} stars)`);
    return completeReply;
  }

  // Track replied reviews
  getRepliedReviews(locationId) {
    const repliedFile = path.join(__dirname, '..', 'data', `replied_reviews_${locationId}.json`);
    try {
      if (fs.existsSync(repliedFile)) {
        const data = JSON.parse(fs.readFileSync(repliedFile, 'utf8'));
        return data.repliedReviews || [];
      }
    } catch (error) {
      console.error('[AutomationScheduler] Error loading replied reviews:', error);
    }
    return [];
  }

  markReviewAsReplied(locationId, reviewId) {
    const repliedFile = path.join(__dirname, '..', 'data', `replied_reviews_${locationId}.json`);
    let data = { repliedReviews: [] };
    
    try {
      if (fs.existsSync(repliedFile)) {
        data = JSON.parse(fs.readFileSync(repliedFile, 'utf8'));
      }
      
      if (!data.repliedReviews.includes(reviewId)) {
        data.repliedReviews.push(reviewId);
        fs.writeFileSync(repliedFile, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('[AutomationScheduler] Error marking review as replied:', error);
    }
  }

  // Log automation activities to Supabase
  // NEW SCHEMA: Uses gmail_id as primary identifier
  async logAutomationActivity(locationId, type, details) {
    try {
      // NEW SCHEMA: Use gmailId as primary, userId is alias for backward compatibility
      const gmailId = details.gmailId || details.userId || 'system';
      const reviewId = details.reviewId || null;

      // Determine status based on type
      let status = 'success';
      let errorMessage = null;

      if (type.includes('failed')) {
        status = 'failed';
        errorMessage = details.error || 'Unknown error';
      }

      // Map old type names to action_type for database
      let actionType = type;
      if (type === 'post_created') actionType = 'post_created';
      if (type === 'post_failed') actionType = 'post_failed';
      if (type === 'review_replied') actionType = 'review_replied';
      if (type === 'reply_failed') actionType = 'reply_failed';

      // Log to Supabase instead of JSON file
      await supabaseAutomationService.logActivity(
        gmailId,
        locationId,
        actionType,
        reviewId,
        status,
        details,
        errorMessage
      );

      console.log(`[AutomationScheduler] ✅ Logged activity: ${actionType} for location ${locationId} (gmailId: ${gmailId})`);
    } catch (error) {
      console.error('[AutomationScheduler] Error logging activity to Supabase:', error);
      // Don't throw error - logging failure shouldn't stop automation
    }
  }

  // Get unique gmail IDs from all automation settings
  // NEW SCHEMA: Returns gmail_id values (userId is alias for gmailId)
  getAutomationUserIds() {
    const gmailIds = new Set();
    const automations = this.settings.automations || {};

    for (const [locationId, config] of Object.entries(automations)) {
      // Check gmailId first (new schema), then userId (backward compatibility)
      if (config.gmailId) {
        gmailIds.add(config.gmailId);
      }
      if (config.userId) {
        gmailIds.add(config.userId);
      }
      if (config.autoPosting?.userId) {
        gmailIds.add(config.autoPosting.userId);
      }
      if (config.autoReply?.userId) {
        gmailIds.add(config.autoReply.userId);
      }
    }

    // Remove 'default' as it's not a real user
    gmailIds.delete('default');

    return Array.from(gmailIds);
  }

  // Get automation status for a location
  getAutomationStatus(locationId) {
    const settings = this.settings.automations?.[locationId] || {};
    return {
      autoPosting: {
        enabled: settings.autoPosting?.enabled || false,
        schedule: settings.autoPosting?.schedule || null,
        frequency: settings.autoPosting?.frequency || null,
        lastRun: settings.autoPosting?.lastRun || null,
        isRunning: this.scheduledJobs.has(locationId)
      },
      autoReply: {
        enabled: settings.autoReply?.enabled || false,
        lastCheck: settings.autoReply?.lastCheck || null,
        isRunning: this.reviewCheckIntervals.has(locationId)
      }
    };
  }

  // Stop all automations
  stopAllAutomations() {
    console.log('[AutomationScheduler] Stopping all automations...');

    // Stop all scheduled posts
    for (const [locationId, job] of this.scheduledJobs) {
      job.stop();
    }
    this.scheduledJobs.clear();

    // Stop all review monitors
    for (const [locationId, interval] of this.reviewCheckIntervals) {
      clearInterval(interval);
    }
    this.reviewCheckIntervals.clear();

    // Stop the missed post checker
    if (this.missedPostCheckerInterval) {
      clearInterval(this.missedPostCheckerInterval);
      this.missedPostCheckerInterval = null;
      console.log('[AutomationScheduler] Stopped missed post checker');
    }

    console.log('[AutomationScheduler] All automations stopped');
  }
}

// Create singleton instance
const automationScheduler = new AutomationScheduler();

// NO automatic initialization here - server.js will call initializeAutomations() after startup
// This allows proper async loading from Supabase

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[AutomationScheduler] Shutting down gracefully...');
  automationScheduler.stopAllAutomations();
  process.exit(0);
});

export default automationScheduler;