const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://yhokvqhllmmssyvgwzqv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlob2t2cWhsbG1tc3N5dmd3enF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4Mzg2MTEsImV4cCI6MjEwMzQxNDYxMX0.6Mfxb8cRy_l9yy3WecDRgtQ84HLmTtDsZbtinrt0AX8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runBackup() {
  console.log(`Starting automated backup for Supabase project: ${SUPABASE_URL}...`);

  const tables = ['leads', 'customers', 'appointments', 'services', 'reviews'];
  const backupData = {
    timestamp: new Date().toISOString(),
    projectUrl: SUPABASE_URL,
    tables: {}
  };

  let sqlOutput = `-- Automated Supabase Database Dump\n-- Generated at: ${new Date().toISOString()}\n\n`;

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`Notice reading table ${table}: ${error.message}`);
        backupData.tables[table] = [];
      } else {
        backupData.tables[table] = data || [];
        console.log(`✅ Exported ${data ? data.length : 0} rows from table '${table}'`);

        if (data && data.length > 0) {
          sqlOutput += `-- Table: public.${table}\n`;
          sqlOutput += `TRUNCATE TABLE public.${table} CASCADE;\n`;
          for (const row of data) {
            const columns = Object.keys(row).join(', ');
            const values = Object.values(row).map(val => {
              if (val === null) return 'NULL';
              if (typeof val === 'number' || typeof val === 'boolean') return val;
              return `'${String(val).replace(/'/g, "''")}'`;
            }).join(', ');
            sqlOutput += `INSERT INTO public.${table} (${columns}) VALUES (${values});\n`;
          }
          sqlOutput += `\n`;
        }
      }
    } catch (err) {
      console.error(`Error backing up table ${table}:`, err.message);
    }
  }

  const backupsDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const sqlFilePath = path.join(backupsDir, `supabase-backup-${dateStr}.sql`);
  const jsonFilePath = path.join(backupsDir, `supabase-backup-${dateStr}.json`);

  fs.writeFileSync(sqlFilePath, sqlOutput, 'utf8');
  fs.writeFileSync(jsonFilePath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log(`🎉 Backup completed successfully!`);
  console.log(`📁 SQL file: ${sqlFilePath} (${(fs.statSync(sqlFilePath).size / 1024).toFixed(2)} KB)`);
  console.log(`📁 JSON file: ${jsonFilePath} (${(fs.statSync(jsonFilePath).size / 1024).toFixed(2)} KB)`);
}

runBackup();
