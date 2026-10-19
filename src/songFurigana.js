// All conversion runs locally. Only static dictionary files are downloaded.
//
// kuroshiro-browser expects CDN/Cloudflare Pages to send Content-Encoding: br
// when serving *.dat.br. GitHub Pages cannot set that header, so its bundled
// loader needs one compatibility shim during initialization. We decode these
// *exactly 12 dictionary file fetches* ourselves and keep all other fetches
// (including translations) unchanged.
let enginePromise;

function isDictionaryRequest(input) {
  const url = typeof input === 'string' ? input : input?.url;
  return typeof url === 'string' && /(?:^|\/)dict\/(?:base|check|cc|tid|tid_pos|tid_map|unk|unk_pos|unk_map|unk_char|unk_compat|unk_invoke)\.dat\.br(?:[?#].*)?$/.test(url);
}

async function initializeBrowserEngine() {
  const [{Kuroshiro}, decoderModule] = await Promise.all([
    import('kuroshiro-browser'),
    import('brotli-dec-wasm')
  ]);
  if (!Kuroshiro?.buildAndInitWithKuromoji) {
    throw new Error('找不到日文分析模組。');
  }
  const decoder = await decoderModule.default;
  if (!decoder || typeof decoder.decompress !== 'function') {
    throw new Error('無法初始化字典解壓縮程式。');
  }
  const originalFetch = globalThis.fetch;
  // Temporarily intercept only the exact bundled static dictionary URLs.
  globalThis.fetch = async (input, options) => {
    if (!isDictionaryRequest(input)) return originalFetch(input, options);
    const response = await originalFetch(input, options);
    if (!response.ok) throw new Error('字典下載失敗：HTTP '+response.status);
    if (response.headers.get('Content-Encoding')?.includes('br')) return response;
    const contentType = response.headers.get('Content-Type') || '';
    if (/text\/html/i.test(contentType)) throw new Error('字典網址指向網頁而不是檔案。');
    const compressed = new Uint8Array(await response.arrayBuffer());
    // Brotli WASM works on all recent mobile browsers, unlike DecompressionStream("brotli").
    const raw = decoder.decompress(compressed);
    return new Response(raw, {status:200, headers:{'Content-Type':'application/octet-stream'}});
  };
  try {
    // true: production-style ./dict URLs also work in Vite dev (public/dict).
    return await Kuroshiro.buildAndInitWithKuromoji(true);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

export async function getFuriganaEngine() {
  if (!enginePromise) {
    enginePromise = initializeBrowserEngine()
      .catch(error => {enginePromise = undefined; throw error;});
  }
  return enginePromise;
}
export async function annotateLine(engine, line) {
  return engine.convert(line, {to:'hiragana', mode:'furigana'});
}
