const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envDir = path.resolve(__dirname, '../src/environments');

let backendUrl = process.env.BACKEND_URL || '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (key === 'BACKEND_URL' && !backendUrl) {
        backendUrl = val;
      }
    }
  }
}

if (!backendUrl) {
  backendUrl = 'http://localhost:8080/api';
}

if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

const envFileContent = `// Tự động tạo bởi scripts/set-env.js từ file .env
export const environment = {
  production: true,
  apiUrl: '${backendUrl}'
};
`;

const envDevFileContent = `// Tự động tạo bởi scripts/set-env.js từ file .env
export const environment = {
  production: false,
  apiUrl: '${backendUrl}'
};
`;

fs.writeFileSync(path.join(envDir, 'environment.ts'), envFileContent);
fs.writeFileSync(path.join(envDir, 'environment.development.ts'), envDevFileContent);

console.log(`[set-env] Đã cập nhật environment với Backend URL: ${backendUrl}`);
