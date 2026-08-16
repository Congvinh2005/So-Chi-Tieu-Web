const fs = require('fs');
const path = require('path');

const url = (process.env.SUPABASE_URL || '').trim();
const anonKey = (process.env.SUPABASE_ANON_KEY || '').trim();
const outputPath = path.join(__dirname, 'supabase-config.js');

const content = `window.SUPABASE_CONFIG = {
  url: ${JSON.stringify(url)},
  anonKey: ${JSON.stringify(anonKey)}
};
`;

fs.writeFileSync(outputPath, content, 'utf8');
console.log('Generated supabase-config.js from Vercel environment variables.');
