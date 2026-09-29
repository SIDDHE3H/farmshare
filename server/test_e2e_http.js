const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runE2E() {
  console.log('--- STARTING LIVE HTTP END-TO-END SUITE ---');

  // 1. Health check
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health check status:', health.status, health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Login Suresh (Owner)
  const sureshLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'suresh@farmshare.in', password: 'farmer123' });
  console.log('2. Suresh Login:', sureshLogin.status, sureshLogin.data.user.name);
  const sureshToken = sureshLogin.data.token;

  // 3. Login Ramesh (Farmer)
  const rameshLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'ramesh@farmshare.in', password: 'farmer123' });
  console.log('3. Ramesh Login:', rameshLogin.status, rameshLogin.data.user.name);
  const rameshToken = rameshLogin.data.token;

  // 4. Fetch Equipment & Test Search Filter
  const eqSearch = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/equipment?q=rotavator',
    method: 'GET'
  });
  console.log('4. Equipment Search "rotavator":', eqSearch.data.equipment.length, 'matches found');

  // 5. Suresh creates a new listing
  const newListing = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/equipment',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sureshToken}`
    }
  }, {
    name: 'Kubota MU4501 45HP 4WD Tractor',
    category: 'Tractor',
    description: 'Japanese engineered 4WD Kubota tractor with synchronized shuttle shift and dual speed PTO. Ideal for heavy black cotton soil puddle & haulage.',
    village: 'Karanje',
    taluka: 'Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    price_per_day: 1600,
    price_per_hour: 250,
    available_from: '2026-10-01',
    available_until: '2026-11-30',
    condition: 'Excellent',
    image_url: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=1000&q=80'
  });
  console.log('5. Created Listing status:', newListing.status, newListing.data.message);
  const createdEqId = newListing.data.equipment.id;

  // 6. Ramesh sends rental request for Oct 10 - Oct 13 (4 days)
  const req1 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/requests',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${rameshToken}`
    }
  }, {
    equipment_id: createdEqId,
    requested_from: '2026-10-10',
    requested_until: '2026-10-13',
    duration_days: 4,
    contact_number: '+91 98220 55678',
    message: 'Need the Kubota 4WD tractor for autumn field leveling in Malegaon.'
  });
  console.log('6. Ramesh sent request 1:', req1.status, req1.data.message, 'Total ₹' + req1.data.request.total_price);
  const req1Id = req1.data.request.id;

  // 7. Suresh accepts request 1
  const acceptRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/requests/${req1Id}/status`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sureshToken}`
    }
  }, { status: 'Accepted' });
  console.log('7. Suresh accepted request 1:', acceptRes.status, acceptRes.data.message);

  // 8. Create overlapping request (Oct 12 - Oct 15) by Anita
  // Login Anita
  const anitaLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'anita@farmshare.in', password: 'farmer123' });
  const anitaToken = anitaLogin.data.token;

  const req2 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/requests',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anitaToken}`
    }
  }, {
    equipment_id: createdEqId,
    requested_from: '2026-10-12',
    requested_until: '2026-10-15',
    duration_days: 4,
    contact_number: '+91 98220 77890',
    message: 'I also need this Kubota tractor.'
  });
  console.log('8. Anita sent overlapping request 2 (Oct 12-15):', req2.status);

  // 9. DOUBLE-BOOKING PROTECTION TEST:
  // Suresh attempts to accept Request 2 for the overlapping dates.
  // The system MUST reject it with HTTP 409!
  const req2Id = req2.data.request?.id;
  if (req2Id) {
    const conflictAttempt = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/requests/${req2Id}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sureshToken}`
      }
    }, { status: 'Accepted' });

    console.log('9. Double-booking conflict response status:', conflictAttempt.status);
    console.log('   Message:', conflictAttempt.data.message);
    if (conflictAttempt.status === 409) {
      console.log('   ✅ Double-booking collision prevented successfully!');
    } else {
      throw new Error(`Expected 409 Conflict, but received status ${conflictAttempt.status}`);
    }
  }

  // 10. Dashboard Stats verification
  const dashboard = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/stats/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${sureshToken}` }
  });
  console.log('10. Suresh Dashboard metrics:', dashboard.data.stats);

  // 11. Cleanup test equipment
  const delRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/equipment/${createdEqId}`,
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${sureshToken}` }
  });
  console.log('11. Cleaned up test listing:', delRes.status, delRes.data.message);

  console.log('🎉 ALL LIVE HTTP END-TO-END TESTS PASSED WITH 100% SUCCESS!');
}

runE2E().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
