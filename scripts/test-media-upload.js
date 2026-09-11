const https = require('https');
const fs = require('fs');

async function testUpload() {
  function req(ep, opt = {}, body = null) {
    return new Promise((res, rej) => {
      const url = new URL('https://ghurabo-final-backend.vercel.app' + ep);
      const r = https.request({
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: opt.method || 'GET',
        headers: opt.headers || {},
      }, resp => {
        let d = '';
        resp.on('data', c => d += c);
        resp.on('end', () => res({ status: resp.statusCode, body: d }));
      });
      r.on('error', rej);
      if (body) r.write(body);
      r.end();
    });
  }

  console.log('Logging in as admin...');
  const login = await req('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, JSON.stringify({ email: 'admin@ghurabo.com', password: 'Admin@12345!' }));

  const loginData = JSON.parse(login.body);
  const token = loginData.data.tokens.accessToken;
  console.log('Token obtained.');

  // Create a minimal 1x1 JPEG buffer
  const jpegBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
    0x00, 0x60, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
    0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
    0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x00, 0xff, 0xd9
  ]);

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="folder"\r\n\r\nghurabo/trips\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  const payload = Buffer.concat([head, jpegBuffer, tail]);

  console.log('Sending upload request to /api/v1/media/upload...');
  const upload = await req('/api/v1/media/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': payload.length,
    },
  }, payload);

  console.log('Upload response status:', upload.status);
  console.log('Upload response body:', upload.body);
}

testUpload().catch(console.error);
