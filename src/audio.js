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

let currentAudio = null;

function speakWithBrowser(text) {
  if (!('speechSynthesis' in window)) {
    window.alert('此瀏覽器無法使用日文語音合成功能。');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.8;
  const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('ja'));
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

export function speak(text) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();

  const entry = kanaAudio.get(text);
  // 單字、整句交給 TTS；單獨假名必須使用已確認的獨立發音。
  if (!entry) {
    speakWithBrowser(text);
    return;
  }

  const sound = new Audio(entry.url);
  sound.preload = 'auto';
  currentAudio = sound;
  let failed = false;
  const failedToLoad = () => {
    if (failed || currentAudio !== sound) return;
    failed = true;
    currentAudio = null;
    // 這些假名可能被 TTS 當作助詞或在獨立發音時唸錯，不應再退回 TTS 誤導初學者。
    if (['ha', 'he', 'wo', 'n'].includes(entry.romaji)) {
      window.alert('標準發音音檔無法載入，請檢查網路後重試。為避免學到錯誤發音，這個假名不使用 TTS 代替。');
      return;
    }
    speakWithBrowser(text);
  };
  sound.addEventListener('error', failedToLoad, { once: true });
  sound.addEventListener('ended', () => {
    if (currentAudio === sound) currentAudio = null;
  }, { once: true });
  const playback = sound.play();
  if (playback?.catch) playback.catch(failedToLoad);
}

export const kanaAudioCount = sources.length;
