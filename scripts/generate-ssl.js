const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

async function main() {
  const certDir = path.join(__dirname, '..', 'certificates');
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'organizationName', value: 'Ziffy Local Dev' },
  ];

  const pems = await selfsigned.generate(attrs, {
    days: 365,
    algorithm: 'sha256',
    keySize: 2048,
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' },
        ],
      },
    ],
  });

  fs.writeFileSync(path.join(certDir, 'localhost-key.pem'), pems.private);
  fs.writeFileSync(path.join(certDir, 'localhost.pem'), pems.cert);

  console.log('SSL Certificates successfully generated in certificates/:');
  console.log(' - certificates/localhost-key.pem');
  console.log(' - certificates/localhost.pem');
}

main().catch(console.error);
