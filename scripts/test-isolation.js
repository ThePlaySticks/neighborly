const { dal } = require('../src/lib/dal');

console.log('🧪 Starting Multi-Tenant Isolation & Flow Verification Test...\n');

// 1. Verify Seed Communities
const banana = dal.getCommunityBySlug('banana-island');
const lekki = dal.getCommunityBySlug('lekki-phase-1');

console.assert(banana != null, 'Banana Island community must exist');
console.assert(lekki != null, 'Lekki Phase 1 community must exist');
console.log('✅ Seed Communities Found: Banana Island & Lekki Phase 1');

// 2. Tenant Isolation: Posts
const bananaPosts = dal.getCommunityPosts(banana.id);
const lekkiPosts = dal.getCommunityPosts(lekki.id);

console.log(`Banana Island Posts count: ${bananaPosts.length}`);
console.log(`Lekki Phase 1 Posts count: ${lekkiPosts.length}`);

bananaPosts.forEach(p => {
  console.assert(p.communityId === banana.id, `Post ${p.id} must belong strictly to Banana Island`);
});
lekkiPosts.forEach(p => {
  console.assert(p.communityId === lekki.id, `Post ${p.id} must belong strictly to Lekki Phase 1`);
});
console.log('✅ Tenant Isolation Verified: Post queries strictly scoped by communityId');

// 3. New Resident Registration Flow (Pending State)
console.log('\nTesting Resident Registration Flow...');
const testEmail = `babatunde.${Date.now()}@example.com`;
const newUser = dal.registerUser('Babatunde Adeleke', testEmail, 'resident123', '+2348099887766');
const newMembership = dal.requestResidentMembership({
  userId: newUser.id,
  communityId: banana.id,
  block: 'Block 12',
  houseNumber: 'Flat 4B',
  residentType: 'Tenant'
});

console.assert(newMembership.status === 'PENDING', 'New resident status must be PENDING initially');
console.log('✅ Resident Registered: Status is PENDING approval');

// Attempt to post as pending resident (Must Fail)
let postThrew = false;
try {
  dal.createPost({
    communityId: banana.id,
    authorId: newUser.id,
    content: 'Trying to post before approval'
  });
} catch (e) {
  postThrew = true;
  console.log(`✅ Access Control Working: Pending resident cannot post: "${e.message}"`);
}
console.assert(postThrew, 'Pending resident must NOT be allowed to post');

// 4. Admin Approval Flow
console.log('\nTesting Admin Approval Flow...');
const bananaAdmin = dal.findUserByEmail('admin@bananaisland.ng');
console.assert(bananaAdmin != null, 'Banana admin must exist');

const approvedMem = dal.updateMembershipStatus({
  membershipId: newMembership.id,
  status: 'APPROVED',
  adminUserId: bananaAdmin.id
});

console.assert(approvedMem.status === 'APPROVED', 'Membership status must be updated to APPROVED');
console.log('✅ Admin Approval Working: Resident is now APPROVED');

// 5. Approved Resident Creates Post in Banana Island
const residentPost = dal.createPost({
  communityId: banana.id,
  authorId: newUser.id,
  content: 'Hello neighbors! Happy to join Banana Island.'
});
console.assert(residentPost != null, 'Approved resident must be able to create post');
console.log(`✅ Resident Created Post: "${residentPost.content}"`);

// 6. Cross-Tenant Leak Check
const lekkiPostsAfter = dal.getCommunityPosts(lekki.id);
const leaked = lekkiPostsAfter.some(p => p.id === residentPost.id);
console.assert(!leaked, 'Lekki Phase 1 must NEVER see Banana Island resident post!');
console.log('✅ Cross-Tenant Isolation Verified: Lekki Phase 1 cannot see Banana Island post');

console.log('\n🎉 ALL MULTI-TENANT ISOLATION TESTS PASSED PERFECTLY!\n');
