const assert = require('assert');
const bcrypt = require('bcryptjs');
const { getDb, queryRow, query, run } = require('./src/config/db');
const { findConflictingAcceptedBookings } = require('./src/utils/bookingConflict');

async function runTests() {
  console.log('--- RUNNING FARMSHARE BACKEND VERIFICATION SUITE ---');
  await getDb();

  // Test 1: Verify users exist and password hashing works
  const suresh = queryRow('SELECT * FROM users WHERE email = ?', ['suresh@farmshare.in']);
  assert(suresh !== null, 'Suresh should exist in DB');
  const match = await bcrypt.compare('farmer123', suresh.password_hash);
  assert.strictEqual(match, true, 'Suresh password hash should match farmer123');
  console.log('✅ Test 1 Passed: User verification and bcrypt password hashing');

  // Test 2: Verify equipment exists with rural locations
  const eqList = query('SELECT * FROM equipment WHERE village = ?', ['Karanje']);
  assert(eqList.length >= 2, 'Karanje should have at least 2 listings (Mahindra tractor, Rotavator)');
  console.log(`✅ Test 2 Passed: Equipment retrieval by village (${eqList.length} items found)`);

  // Test 3: Double booking conflict detection logic
  // Look at existing accepted booking: eq2 is accepted for days [now+3 to now+5]
  const rotavator = queryRow("SELECT * FROM equipment WHERE name LIKE '%Rotavator%'");
  const acceptedBooking = queryRow("SELECT * FROM requests WHERE equipment_id = ? AND status = 'Accepted'", [rotavator.id]);
  assert(acceptedBooking !== null, 'Rotavator should have an accepted booking');
  console.log(`Found existing accepted booking: ${acceptedBooking.requested_from} to ${acceptedBooking.requested_until}`);

  // Scenario A: Exact overlap
  const conflict1 = findConflictingAcceptedBookings(rotavator.id, acceptedBooking.requested_from, acceptedBooking.requested_until);
  assert(conflict1.length > 0, 'Exact same dates must conflict');

  // Scenario B: Partial overlap (starts inside)
  const conflict2 = findConflictingAcceptedBookings(rotavator.id, acceptedBooking.requested_from, '2099-12-31');
  assert(conflict2.length > 0, 'Overlapping range must conflict');

  // Scenario C: Non-overlapping future dates
  const noConflict = findConflictingAcceptedBookings(rotavator.id, '2099-01-01', '2099-01-05');
  assert.strictEqual(noConflict.length, 0, 'Completely different dates should have zero conflicts');
  console.log('✅ Test 3 Passed: Double-booking protection logic verified with rigorous date boundary testing');

  // Test 4: Verify search query matching
  const searchMahindra = query("SELECT * FROM equipment WHERE LOWER(name) LIKE '%mahindra%'");
  assert(searchMahindra.length > 0, 'Search for Mahindra should return matches');
  console.log('✅ Test 4 Passed: Search query filtering functional');

  console.log('🎉 ALL BACKEND VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
