const http = require('http');

async function testLoginCredentials(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runAllLoginTests() {
  console.log('Testing login for admin@ghurabo.com...');
  const res1 = await testLoginCredentials('admin@ghurabo.com', 'GhuraboAdmin2026!');
  console.log('Result 1:', res1);

  console.log('\nTesting login for sahariannafis70@gmail.com...');
  const res2 = await testLoginCredentials('sahariannafis70@gmail.com', 'GhuraboAdmin2026!');
  console.log('Result 2:', res2);
}

runAllLoginTests();
