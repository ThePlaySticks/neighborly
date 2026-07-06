const fs = require('fs');
const path = require('path');

// Parse .env.local manually to remove external dotenv package dependency
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
}
const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Tables to back up
const TABLES = [
  'super_admin_settings',
  'estates',
  'profiles',
  'tenant_branding',
  'announcements',
  'marketplace_items',
  'visitor_logs',
  'support_tickets',
  'estate_messages'
];

async function runBackup() {
  console.log('🔄 Starting database backup snapshot for Neighborly...');
  const backupData = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    tables: {}
  };

  for (const tableName of TABLES) {
    console.log(`⏳ Fetching table: ${tableName}...`);
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`⚠️ Warning: Failed to fetch table "${tableName}":`, error.message);
      backupData.tables[tableName] = { status: 'failed', error: error.message };
    } else {
      backupData.tables[tableName] = {
        status: 'success',
        count: data.length,
        rows: data
      };
      console.log(`✅ Table "${tableName}" backed up: ${data.length} rows.`);
    }
  }

  // Ensure backups directory exists
  const backupDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Write snapshot file
  const fileName = `neighborly-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filePath = path.join(backupDir, fileName);
  
  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`\n🎉 Database snapshot completed successfully!`);
  console.log(`📂 Saved to: backups/${fileName}`);
}

runBackup().catch((err) => {
  console.error('❌ Critical error executing backup:', err);
});
