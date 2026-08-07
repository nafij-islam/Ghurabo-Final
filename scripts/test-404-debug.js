const http = require('http');

async function test404Debug() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/trips/non_existent_trip_id_12345',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    console.log(`GET /api/trips/non_existent_trip_id_12345 -> STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => console.log('BODY:', body));
  });

  req.on('error', (e) => console.error(e));
  req.end();
}

test404Debug();
