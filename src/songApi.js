const LYRIC_API = 'https://lrclib.net';
const TRANSLATE_API = 'https://api.mymemory.translated.net/get';
let lyricRetryAfter = 0;
const CLIENT_HEADERS = {'Lrclib-Client': 'YOMIO/1.9.0 (https://github.com/b110212000/kana-journey)'};
export const MAX_LINES = 180;

export function splitLyrics(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.replace(/^(?:\[\d{1,2}:\d{2}(?:\.\d+)?\]\s*)+/, '').trim())
    .filter(line => line && !/^\[(?:ar|ti|al|by|offset|length):/i.test(line))
    .slice(0, MAX_LINES);
}

export async function searchLyrics(query, signal) {
  const keyword = String(query || '').trim();
  if (!keyword) return [];
  if (Date.now() < lyricRetryAfter) throw new Error('歌詞服務正在限流，請在 ' + Math.ceil((lyricRetryAfter - Date.now()) / 1000) + ' 秒後再搜尋。');
  const response = await fetch(LYRIC_API + '/api/search?q=' + encodeURIComponent(keyword), {
    headers: CLIENT_HEADERS, signal
  });
  if (response.status === 429) {
    const retry = Number(response.headers.get('Retry-After'));
    lyricRetryAfter = Date.now() + Math.max(5, Number.isFinite(retry) && retry > 0 ? retry : 30) * 1000;
    throw new Error('歌詞服務目前請求過多。' + (Number.isFinite(retry) && retry > 0 ? '請在 ' + retry + ' 秒後再試。' : '請稍後再試。'));
  }
  if (!response.ok) throw new Error('無法搜尋歌詞（HTTP ' + response.status + '）。');
  const list = await response.json();
  return Array.isArray(list) ? list.slice(0, 20) : [];
}

export async function translateJapanese(text, signal) {
  const original = String(text || '').trim();
  const byteLength = new TextEncoder().encode(original).length;
  if (!original) return '';
  if (byteLength > 500) throw new Error('這句超過翻譯服務單次 500 bytes 的限制，請自行編輯。');
  const url = TRANSLATE_API + '?q=' + encodeURIComponent(original) +
    '&langpair=' + encodeURIComponent('ja|zh-TW');
  const response = await fetch(url, {signal});
  if (response.status === 429) throw new Error('翻譯服務請求過多，請稍後再試。');
  if (!response.ok) throw new Error('翻譯服務暫時不可用（HTTP ' + response.status + '）。');
  const data = await response.json();
  if (data.quotaFinished) throw new Error('免費翻譯額度已用完，明天再試或手動輸入中文。');
  if (Number(data.responseStatus) !== 200 || !data.responseData?.translatedText) {
    throw new Error('此句無法取得譯文，請稍後重試。');
  }
  return String(data.responseData.translatedText).trim();
}
