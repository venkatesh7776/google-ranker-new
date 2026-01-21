import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local explicitly
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not set!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('========================================');
console.log('📊 CHECKING DATABASE ACTIVITY');
console.log('========================================\n');

async function checkDatabase() {
  // Check automation_post_history
  console.log('📝 automation_post_history table:');
  const { data: postHistory, error: postErr } = await supabase
    .from('automation_post_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (postErr) {
    console.log(`   ❌ Error: ${postErr.message}`);
  } else if (postHistory && postHistory.length > 0) {
    console.log(`   ✅ Found ${postHistory.length} recent posts`);
    postHistory.forEach(p => {
      console.log(`   - User: ${p.user_id}, Location: ${p.location_id}, Status: ${p.status}, Date: ${p.created_at}`);
    });
  } else {
    console.log('   ⚠️ No posts found');
  }

  console.log('\n📝 automation_reply_history table:');
  const { data: replyHistory, error: replyErr } = await supabase
    .from('automation_reply_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (replyErr) {
    console.log(`   ❌ Error: ${replyErr.message}`);
  } else if (replyHistory && replyHistory.length > 0) {
    console.log(`   ✅ Found ${replyHistory.length} recent replies`);
    replyHistory.forEach(r => {
      console.log(`   - User: ${r.user_id}, Location: ${r.location_id}, Status: ${r.status}, Date: ${r.created_at}`);
    });
  } else {
    console.log('   ⚠️ No replies found');
  }

  console.log('\n📝 automation_logs table:');
  const { data: logs, error: logsErr } = await supabase
    .from('automation_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (logsErr) {
    console.log(`   ❌ Error: ${logsErr.message}`);
  } else if (logs && logs.length > 0) {
    console.log(`   ✅ Found ${logs.length} recent logs`);
    logs.forEach(l => {
      console.log(`   - User: ${l.user_id}, Type: ${l.action_type}, Status: ${l.status}, Date: ${l.created_at}`);
    });
  } else {
    console.log('   ⚠️ No logs found');
  }

  console.log('\n📝 user_locations table (with activity):');
  const { data: userLocs, error: locErr } = await supabase
    .from('user_locations')
    .select('gmail_id, location_id, business_name, total_posts_created, last_post_date, autoposting_enabled')
    .gt('total_posts_created', 0)
    .order('last_post_date', { ascending: false })
    .limit(10);

  if (locErr) {
    console.log(`   ❌ Error: ${locErr.message}`);
  } else if (userLocs && userLocs.length > 0) {
    console.log(`   ✅ Found ${userLocs.length} users with posts`);
    userLocs.forEach(u => {
      console.log(`   - Gmail: ${u.gmail_id}, Business: ${u.business_name}, Posts: ${u.total_posts_created}, Last: ${u.last_post_date}`);
    });
  } else {
    console.log('   ⚠️ No users with posts found');
  }

  console.log('\n📝 subscriptions table:');
  const { data: subs, error: subErr } = await supabase
    .from('subscriptions')
    .select('email, user_id, status')
    .limit(10);

  if (subErr) {
    console.log(`   ❌ Error: ${subErr.message}`);
  } else if (subs && subs.length > 0) {
    console.log(`   ✅ Found ${subs.length} subscriptions`);
    subs.forEach(s => {
      console.log(`   - Email: ${s.email}, User ID: ${s.user_id}, Status: ${s.status}`);
    });
  } else {
    console.log('   ⚠️ No subscriptions found');
  }

  console.log('\n========================================');
  console.log('✅ DATABASE CHECK COMPLETE');
  console.log('========================================');
}

checkDatabase().catch(console.error);
