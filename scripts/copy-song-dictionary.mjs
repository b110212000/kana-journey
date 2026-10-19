import fs from 'node:fs';
import path from 'node:path';

// Browser-focused tokenizer: avoid the legacy kuromoji gunzip implementation
// that can fail in Vite builds on mobile browsers.
const source = path.resolve('node_modules/kuroshiro-browser/dist/dict');
const target = path.resolve('public/dict');
if (!fs.existsSync(source)) throw new Error('kuroshiro-browser dictionary directory not installed.');
fs.mkdirSync(target, {recursive:true});
const files = fs.readdirSync(source).filter(name => name.endsWith('.dat.br'));
if (files.length !== 12) throw new Error('Expected 12 Brotli dictionary files, got '+files.length);
for (const name of files) fs.copyFileSync(path.join(source,name),path.join(target,name));
// Keep license and attribution notices for included tokenizer assets.
const notice = path.resolve('node_modules/kuroshiro-browser/dist/NOTICE.md');
if (fs.existsSync(notice)) fs.copyFileSync(notice, path.join(target,'NOTICE.md'));
console.log('Copied '+files.length+' browser dictionary files (Brotli) to '+target);
