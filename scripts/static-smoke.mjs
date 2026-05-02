import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const dashboardDir = path.resolve('Interactive_Dashboard');
const indexPath = path.join(dashboardDir, 'index.html');
const html = await readFile(indexPath, 'utf8');

const requiredFiles = ['styles.css', 'data.js', 'app.js'];
const missingFiles = requiredFiles.filter((file) => !existsSync(path.join(dashboardDir, file)));

if (missingFiles.length > 0) {
  throw new Error(`Missing dashboard assets: ${missingFiles.join(', ')}`);
}

for (const file of requiredFiles) {
  const referencePattern = new RegExp(`(?:src|href)=["']${file.replace('.', '\\.')}["']`);
  if (!referencePattern.test(html)) {
    throw new Error(`index.html does not reference ${file}`);
  }
}

const requiredDomIds = [
  'searchInput',
  'tierFilter',
  'modalityFilter',
  'verificationFilter',
  'tierChart',
  'accreditationChart',
];

const missingIds = requiredDomIds.filter((id) => !html.includes(`id="${id}"`));

if (missingIds.length > 0) {
  throw new Error(`Missing dashboard DOM anchors: ${missingIds.join(', ')}`);
}

console.log('OSU dashboard static smoke check passed.');
