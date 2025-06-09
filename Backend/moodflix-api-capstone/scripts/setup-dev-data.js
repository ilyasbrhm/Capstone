const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

console.log('Setting up development data...');

// Buat direktori data jika belum ada
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory');
}

// Buat file users.json jika belum ada
const usersFile = path.join(dataDir, 'users.json');
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  console.log('Created users.json');
}

// Buat file comments.json jika belum ada
const commentsFile = path.join(dataDir, 'comments.json');
if (!fs.existsSync(commentsFile)) {
  fs.writeFileSync(commentsFile, JSON.stringify([], null, 2));
  console.log('Created comments.json');
}

console.log('Development data setup complete!');