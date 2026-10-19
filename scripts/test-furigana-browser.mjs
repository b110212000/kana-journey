// Browser smoke test: npm build passing does not prove that dictionary
// files can be decoded and rendered by a real browser.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4173'],{stdio:'inherit'});
const target='http://127.0.0.1:4173/kana-journey/';
let browser;
try {
  let ready=false;
  for (let i=0;i<35;i++){
    try{const res=await fetch(target);if(res.ok){ready=true;break}}catch{}
    await new Promise(resolve=>setTimeout(resolve,700));
  }
  assert.ok(ready,'Vite preview server failed to start');
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',message=>{if(message.type()==='error')console.log('browser log:',message.text())});
  await page.route('https://api.mymemory.translated.net/**',route=>route.fulfill({
    status:200,contentType:'application/json',
    body:JSON.stringify({responseStatus:200,quotaFinished:false,responseData:{translatedText:'明天也想和你一起走。'}})
  }));
  await page.goto(target,{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/用喜歡的歌曲學日文/}).click();
  await page.getByRole('button',{name:/搜尋／新增歌曲/}).click();
  await page.getByRole('button',{name:/自行貼上歌詞/}).click();
  await page.getByPlaceholder('歌曲名稱').fill('標音測試');
  await page.getByPlaceholder('每一句一行，支援帶時間戳記的 LRC 歌詞').fill('明日も君と歩きたい');
  await page.getByRole('button',{name:'建立逐句學習'}).click();
  const ruby=page.locator('.songJapanese ruby rt').first();
  await ruby.waitFor({state:'visible',timeout:90000});
  const kana=await ruby.textContent();
  assert.match(kana,/[\u3041-\u3096]/,'Furigana reading must contain Hiragana');
  assert.equal(errors.length,0,'Unexpected browser exceptions: '+errors.join('; '));
  console.log('Chromium rendered furigana:',kana);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
