import {mkdir, readFile, writeFile} from 'node:fs/promises';
import sharp from 'sharp';

const svg = await readFile('public/icon.svg');
await mkdir('public/icons', {recursive:true});

// Build the PNG assets as part of npm build. iOS Home Screen uses apple-touch-icon.png.
for (const [name,size] of [['icon-192.png',192],['icon-512.png',512],['apple-touch-icon.png',180],['favicon-32.png',32]]) {
  await sharp(svg,{density:384}).resize(size,size).png().toFile('public/icons/'+name);
}
console.log('App icons ready (32 / 180 / 192 / 512 px)');
