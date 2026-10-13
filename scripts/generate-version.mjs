import {mkdir, readFile, writeFile} from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
if (!/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
  throw new Error('package.json must have a semantic x.y.z version');
}
await mkdir('public', {recursive:true});
await writeFile('public/version.json', JSON.stringify({
  version: packageJson.version,
  name: 'YOMIO',
  homepage: 'https://b110212000.github.io/kana-journey/'
}, null, 2) + '\n');
console.log('YOMIO published version manifest: ' + packageJson.version);
