const https = require('https');

console.log('Testing HTTPS connection to Supabase...');
const req = https.get('https://egcjpejbrckygoysopbc.supabase.co/rest/v1/', { timeout: 8000 }, (res) => {
  console.log('Response status code:', res.statusCode);
  process.exit(0);
});

req.on('error', (e) => {
  console.error('Connection error:', e.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Connection timed out after 8s');
  req.destroy();
  process.exit(1);
});
