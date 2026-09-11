const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'web-admin', 'dist');
const target = path.join(__dirname, 'web-admin-dist');
fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
console.log('Copied web-admin/dist into desktop-app/web-admin-dist');
