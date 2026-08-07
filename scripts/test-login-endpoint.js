const http = require('http');

async function testLoginEndpoint() {
  const postData = JSON.stringify({
    email: 'sahariannafis70@gmail.com',
    password: 'WrongPasswordTest123!',
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  console.log('Sending POST request to http://localhost:3000/api/auth/login...');

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      console.log('BODY:', body);
      try {
        const parsed = JSON.parse(body);
        console.log('Parsed JSON:', parsed);
      } catch (err) {
        console.error('Failed to parse JSON body! Content is not valid JSON.');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

testLoginEndpoint();
