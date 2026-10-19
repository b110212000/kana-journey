import assert from 'node:assert/strict';
import {splitLyrics, searchLyrics, translateJapanese, MAX_LINES} from '../src/songApi.js';

const lines=splitLyrics('[ar:demo]\n[00:12.30]明日も君と歩きたい\n\n[00:18.00]君の声が聞こえる\n');
assert.deepEqual(lines,['明日も君と歩きたい','君の声が聞こえる']);
assert.equal(splitLyrics('　\n\n').length,0);
assert.equal(splitLyrics('一\n'.repeat(MAX_LINES + 10)).length,MAX_LINES);

const originalFetch=globalThis.fetch;
try {
  globalThis.fetch=async (url,options)=>{
    assert.match(url,/lrclib\.net\/api\/search\?q=/);
    assert.ok(url.includes('%E5%A4%9C'));
    assert.ok(options.headers['Lrclib-Client']);
    return {ok:true,json:async()=>[{id:4,trackName:'夜の歌',plainLyrics:'明日'}]};
  };
  const songs=await searchLyrics('夜の歌');
  assert.equal(songs[0].id,4);
  globalThis.fetch=async url=>{
    assert.ok(url.includes('langpair=ja%7Czh-TW'));
    return {ok:true,json:async()=>({responseStatus:200,quotaFinished:false,responseData:{translatedText:'明天'}})};
  };
  assert.equal(await translateJapanese('明日'),'明天');
  await assert.rejects(translateJapanese('私'.repeat(170)),/500 bytes/);
  globalThis.fetch=async()=>({ok:true,json:async()=>({responseStatus:200,quotaFinished:true,responseData:{translatedText:''}})});
  await assert.rejects(translateJapanese('明日'),/免費翻譯額度/);
  globalThis.fetch=async()=>({status:429,ok:false,headers:{get:()=> '30'}});
  await assert.rejects(searchLyrics('歌'),/30 秒/);
} finally {
  globalThis.fetch=originalFetch;
}
console.log('Song study API contract tests passed.');
