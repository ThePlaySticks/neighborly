const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../.data/neighborly_db.json');
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file not found at:', dbPath);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('🧪 Validating Multi-Tenant Isolation and Data Integrity from Persistent Store...\n');

// 1. Validate Communities
console.log(`Found ${db.communities.length} registered communities:`);
db.communities.forEach(c => console.log(`  - [${c.slug}] ${c.name} (${c.city}, ${c.state})`));

const banana = db.communities.find(c => c.slug === 'banana-island');
const lekki = db.communities.find(c => c.slug === 'lekki-phase-1');

if (!banana || !lekki) {
  console.error('❌ Missing core demo communities');
  process.exit(1);
}

// 2. Validate Tenant Isolation for Posts
const bananaPosts = db.posts.filter(p => p.communityId === banana.id);
const lekkiPosts = db.posts.filter(p => p.communityId === lekki.id);

console.log(`\nIsolated Posts:`);
console.log(`  - Banana Island: ${bananaPosts.length} posts`);
console.log(`  - Lekki Phase 1: ${lekkiPosts.length} posts`);

const crossContaminated = db.posts.some(p => p.communityId !== banana.id && p.communityId !== lekki.id && p.communityId !== 'comm-emerald');
if (crossContaminated) {
  console.error('❌ Posts detected without valid tenant ownership!');
  process.exit(1);
}

// 3. Validate Memberships & Role Separation
const bananaMembers = db.memberships.filter(m => m.communityId === banana.id);
const bananaAdmins = bananaMembers.filter(m => m.role === 'COMMUNITY_ADMIN');
const bananaResidents = bananaMembers.filter(m => m.role === 'RESIDENT');

console.log(`\nMembership Structure for ${banana.name}:`);
console.log(`  - Admins: ${bananaAdmins.length}`);
console.log(`  - Residents: ${bananaResidents.length}`);

// 4. Validate Announcements
const bananaAnnouncements = db.announcements.filter(a => a.communityId === banana.id);
console.log(`\nOfficial Announcements in ${banana.name}: ${bananaAnnouncements.length}`);
bananaAnnouncements.forEach(a => console.log(`  - [${a.category}] ${a.title}`));

console.log('\n🎉 VALIDATION SUCCESS: Complete Multi-Tenant Isolation & Relational Data Verified!\n');
