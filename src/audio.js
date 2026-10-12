import { hira, kata, romaji } from './data';

// Wikimedia Commons / Hakatanoshio117117：公有領域日文假名發音。
// 多數為 Japanese_*.ogg，少數實際檔名為 Ja-*.oga；以下採用其 MP3 轉碼以支援 iPhone Safari。
// 檔名、路徑與音檔著作權說明見 README；錄音需連線才能播放。
const sources = [
  'e/ed/Ja-A.oga',
  'a/ac/Japanese_I.ogg',
  'c/c9/Japanese_U.ogg',
  '8/86/Ja-E.oga',
  '3/3b/Japanese_O.ogg',
  'e/ec/Ja-Ka.oga',
  '6/65/Japanese_ki.ogg',
  '7/72/Japanese_ku.ogg',
  '2/2f/Japanese_ke.ogg',
  '4/48/Japanese_ko.ogg',
  '4/46/Japanese_sa.ogg',
  '8/89/Japanese_shi.ogg',
  '3/35/Japanese_su.ogg',
  '4/4d/Japanese_se.ogg',
  '7/73/Ja-So.oga',
  '4/41/Japanese_ta.ogg',
  'e/ec/Japanese_ti.ogg',
  '5/59/Japanese_tsu.ogg',
  'b/b4/Japanese_te.ogg',
  '5/5b/Japanese_to.ogg',
  '1/11/Japanese_na.ogg',
  'd/db/Japanese_ni.ogg',
  '6/6c/Japanese_nu.ogg',
  '9/93/Japanese_ne.ogg',
  '9/9b/Japanese_no.ogg',
  '5/55/Japanese_ha.ogg',
  '2/22/Japanese_hi.ogg',
  'c/c3/Japanese_hu.ogg',
  '6/64/Japanese_he.ogg',
  '7/75/Japanese_ho.ogg',
  '5/5c/Japanese_ma.ogg',
  '5/58/Japanese_mi.ogg',
  'e/e6/Japanese_mu.ogg',
  '3/36/Japanese_me.ogg',
  '4/41/Japanese_mo.ogg',
  'f/f9/Japanese_ya.ogg',
  'd/d0/Japanese_yu.ogg',
  '9/9c/Japanese_yo.ogg',
  '3/34/Japanese_ra.ogg',
  '3/36/Japanese_ri.ogg',
  '3/33/Japanese_ru.ogg',
  'e/e3/Japanese_re.ogg',
  'b/bd/Japanese_ro.ogg',
  '3/3c/Japanese_wa.ogg',
  '4/41/Japanese_wo.ogg',
  'f/fd/Japanese_N.ogg'
];

if (sources.length !== romaji.length) {
  throw new Error('假名發音檔數量必須與 46 個基本假名一致');
}

const kanaAudio = new Map();
sources.forEach((source, index) => {
  const filename = source.substring(source.lastIndexOf('/') + 1);
  const url = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/' +
    source + '/' + filename + '.mp3';
  kanaAudio.set(hira[index], { url, romaji: romaji[index] });
  kanaAudio.set(kata[index], { url, romaji: romaji[index] });
});


const decodedClips = new Map();
const mediaFallbacks = new Map();
let context = null;
let currentSource = null;
let currentMedia = null;
let currentTimer = null;
let sequence = 0;

function getContext() {
  if (!context) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error('此裝置不支援 Web Audio');
    context = new Context();
  }
  return context;
}

// 錄音約 2～4 秒，兩端可能含空白；只裁切低音量部分，保留輔音的氣音。
function detectSpeechRange(buffer) {
  const samples = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const step = Math.max(1, Math.floor(sampleRate * 0.02));
  const energies = [];
  for (let i = 0; i < samples.length; i += step) {
    let sum = 0;
    const end = Math.min(samples.length, i + step);
    for (let j = i; j < end; j++) sum += samples[j] * samples[j];
    energies.push(Math.sqrt(sum / (end - i)));
  }
  const peak = Math.max(...energies);
  if (!Number.isFinite(peak) || peak < 0.005) return { start: 0, duration: buffer.duration };
  const threshold = Math.max(0.005, peak * 0.08);
  const first = energies.findIndex((n) => n >= threshold);
  const last = energies.findLastIndex((n) => n >= threshold);
  if (first < 0 || last < first) return { start: 0, duration: buffer.duration };
  const start = Math.max(0, first * step / sampleRate - 0.18);
  const end = Math.min(buffer.duration, (last + 1) * step / sampleRate + 0.18);
  return { start, duration: Math.max(0.1, end - start) };
}

function loadClip(entry) {
  if (decodedClips.has(entry.url)) return decodedClips.get(entry.url);
  const task = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    try {
      const res = await fetch(entry.url, { mode: 'cors', signal: controller.signal });
      if (!res.ok) throw new Error('音檔回應 ' + res.status);
      const bytes = await res.arrayBuffer();
      const buffer = await getContext().decodeAudioData(bytes);
      return { buffer, ...detectSpeechRange(buffer) };
    } finally {
      clearTimeout(timeout);
    }
  })().catch((error) => {
    decodedClips.delete(entry.url); // 網路失敗後允許重試
    throw error;
  });
  decodedClips.set(entry.url, task);
  return task;
}

export function preloadKana(characters) {
  if (typeof window === 'undefined') return;
  // 只預載目前正在學的字，避免手機同時下載 46 份錄音造成卡頓。
  for (const char of [...new Set(characters)].slice(0, 8)) {
    const entry = kanaAudio.get(char);
    if (entry) loadClip(entry).catch(() => {});
  }
}

function stopCurrent() {
  sequence += 1;
  if (currentTimer) clearTimeout(currentTimer);
  currentTimer = null;
  if (currentSource) {
    try { currentSource.stop(); } catch {}
    currentSource.disconnect();
    currentSource = null;
  }
  if (currentMedia) {
    currentMedia.pause();
    currentMedia = null;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function speakWithBrowser(text) {
  if (!('speechSynthesis' in window)) {
    window.alert('此瀏覽器不支援日文語音播放。');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.9;
  const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('ja'));
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

// Web Audio 解碼失敗時，仍可透過原生 Audio 播放，不依賴跨來源 fetch。
function playAsMedia(entry, token, onStatus) {
  if (token !== sequence) return;
  let media = mediaFallbacks.get(entry.url);
  if (!media) {
    media = new Audio(entry.url);
    media.preload = 'auto';
    mediaFallbacks.set(entry.url, media);
  }
  media.pause();
  try { media.currentTime = 0; } catch {}
  currentMedia = media;
  let finished = false;
  const cleanup = () => {
    media.removeEventListener('playing', onPlaying);
    media.removeEventListener('error', onFailure);
    media.removeEventListener('ended', onEnded);
    clearTimeout(currentTimer);
    currentTimer = null;
  };
  const onPlaying = () => {
    if (token === sequence) onStatus?.('playing');
  };
  const onEnded = () => {
    cleanup();
    if (token === sequence) { currentMedia = null; onStatus?.('idle'); }
  };
  const onFailure = () => {
    if (finished) return;
    finished = true;
    cleanup();
    if (token !== sequence) return;
    currentMedia = null;
    onStatus?.('error');
  };
  media.addEventListener('playing', onPlaying);
  media.addEventListener('error', onFailure);
  media.addEventListener('ended', onEnded);
  currentTimer = setTimeout(() => {
    if (token !== sequence || !media.paused) return;
    media.pause();
    onFailure();
  }, 6000);
  media.play().catch(onFailure);
}

export function speak(text, onStatus) {
  stopCurrent();
  const token = sequence;
  const entry = kanaAudio.get(text);

  if (!entry) {
    onStatus?.('playing');
    speakWithBrowser(text);
    return;
  }

  onStatus?.('loading');
  let playbackContext;
  let resumed;
  try {
    // 一定要在使用者點擊的同步事件內 resume，避免 iPhone Safari 阻擋播放。
    playbackContext = getContext();
    resumed = playbackContext.resume();
  } catch {
    playAsMedia(entry, token, onStatus);
    return;
  }

  Promise.all([loadClip(entry), resumed]).then(([clip]) => {
    if (token !== sequence) return; // 快速點另一個字，不可再播放上一個字
    const source = playbackContext.createBufferSource();
    source.buffer = clip.buffer;
    source.connect(playbackContext.destination);
    currentSource = source;
    source.onended = () => {
      if (token !== sequence) return;
      currentSource = null;
      onStatus?.('idle');
    };
    onStatus?.('playing');
    source.start(0, clip.start, clip.duration);
  }).catch(() => {
    if (token !== sequence) return;
    // 直接讓原生播放器再試一次；不要把「へ」退回可能唸成 e 的 TTS。
    playAsMedia(entry, token, onStatus);
  });
}

export const kanaAudioCount = sources.length;
