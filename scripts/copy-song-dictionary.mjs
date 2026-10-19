import fs from 'node:fs';
import path from 'node:path';

const from = path.resolve('node_modules/kuromoji/dict');
const to = path.resolve('public/dict');
if (!fs.existsSync(from)) throw new Error('kuromoji dictionary not installed');
fs.mkdirSync(to, {recursive: true});
const files = fs.readdirSync(from).filter(name => name.endsWith('.dat.gz'));
if (files.length !== 12) throw new Error('Expected 12 compressed kuromoji dictionary files, got ' + files.length);
for (const name of files) fs.copyFileSync(path.join(from, name), path.join(to, name));
const notice = path.resolve('node_modules/kuromoji/NOTICE.md');
if (fs.existsSync(notice)) fs.copyFileSync(notice, path.join(to, 'NOTICE.md'));
console.log('Copied ' + files.length + ' Japanese dictionary files for GitHub Pages.');
