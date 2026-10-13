import React, {useEffect, useState} from 'react';
import {Check, Copy, Download, ExternalLink, Share2, Smartphone, Globe, ArrowUpRight} from 'lucide-react';
import './sharing.css';
import {useToast} from './ToastProvider';

const appUrl = () => new URL(import.meta.env.BASE_URL, window.location.origin).href;

// Capture Android's optional install prompt when the app first loads,
// not only after the user navigates to Settings.
let cachedInstallPrompt = null;
const promptListeners = new Set();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    cachedInstallPrompt = event;
    promptListeners.forEach((listener) => listener(event));
  });
  window.addEventListener('appinstalled', () => {
    cachedInstallPrompt = null;
    promptListeners.forEach((listener) => listener(null));
  });
}

function copyFallback(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, area.value.length);
  let done = false;
  try { done = document.execCommand('copy'); }
  finally { area.remove(); }
  return done;
}

export default function AppSharing() {
  const url = appUrl();
  const userAgent = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(userAgent);
  const standalone = window.matchMedia('(display-mode: standalone)').matches ||
    navigator.standalone === true;
  const [installPrompt, setInstallPrompt] = useState(cachedInstallPrompt);
  const notify = useToast();

  useEffect(() => {
    promptListeners.add(setInstallPrompt);
    return () => promptListeners.delete(setInstallPrompt);
  }, []);

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else if (!copyFallback(url)) {
        throw new Error('Copy not available');
      }
      notify('連結已複製！可以貼給朋友或傳到 LINE。');
    } catch {
      try {
        if (!copyFallback(url)) throw new Error('Fallback copy failed');
        notify('連結已複製！可以貼給朋友或傳到 LINE。');
      } catch {
        notify('目前無法自動複製，請長按上方網址選擇「複製」。', 'error');
      }
    }
  }

  async function shareLink() {
    if (typeof navigator.share !== 'function') {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title:'YOMIO｜日文學習',
        text:'一起用 YOMIO 學日文！從五十音到 JLPT 分級練習。',
        url
      });
      notify('已完成系統分享操作。');
    } catch (error) {
      if (error?.name === 'AbortError') return;
      notify('無法開啟系統分享，請使用「複製連結」。', 'error');
    }
  }

  async function installApp() {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        notify('已送出安裝要求，請依裝置提示完成。');
      }
    } catch {
      notify('無法開啟安裝提示，請使用瀏覽器選單操作。', 'error');
    } finally {
      cachedInstallPrompt = null;
      setInstallPrompt(null);
    }
  }


  return <>
    <section className="appConnectGroup">
      <div className="settingsHeading"><Share2 size={19}/><span>分享 YOMIO</span></div>
      <p className="appConnectDescription">把 YOMIO 分享給朋友，可以透過 LINE、訊息等 App，或直接複製網址。</p>
      <div className="appConnectLink">
        <input type="text" value={url} readOnly aria-label="YOMIO App 網址"
          onFocus={(event)=>event.currentTarget.select()} onClick={(event)=>event.currentTarget.select()}/>
        <ExternalLink size={18} aria-hidden="true"/>
      </div>
      <div className="appConnectActions">
        <button type="button" className="appConnectPrimary" onClick={shareLink}>
          <Share2 size={18}/> 分享給朋友
        </button>
        <button type="button" className="appConnectSecondary" onClick={copyLink}>
          <Copy size={18}/> 複製連結
        </button>
      </div>
    </section>

    <section className="appConnectGroup">
      <div className="settingsHeading"><Smartphone size={19}/><span>安裝 YOMIO App</span></div>
      {standalone ? <>
        <div className="appInstalled"><Check size={18}/><strong>目前正以主畫面 App 模式使用 YOMIO</strong></div>
        <p className="appConnectDescription">你已經安裝 YOMIO。如果想用 Safari 開啟網頁版本，請使用下方的網址複製功能。</p>
      </> : <>
        <p className="appConnectDescription">加入手機主畫面後，就能像一般 App 一樣從圖示啟動 YOMIO，不需經過 App Store。</p>
        <div className="appInstallSteps">
          {isIOS ? <>
            <div><span>1</span><p>先複製下方的 YOMIO 網址，再打開 <strong>Safari</strong> 並貼上網址。</p></div>
            <div><span>2</span><p>在 Safari 打開網站後，點選 Safari 自己的 <strong>分享</strong> 按鈕。</p></div>
            <div><span>3</span><p>往下找到 <strong>「加入主畫面」</strong>，再點「加入」。</p></div>
          </> : isAndroid ? <>
            <div><span>1</span><p>使用 <strong>Chrome</strong> 開啟 YOMIO。</p></div>
            <div><span>2</span><p>點選瀏覽器的 <strong>選單（⋮）</strong>。</p></div>
            <div><span>3</span><p>選擇 <strong>「安裝應用程式」</strong>或「加到主畫面」。</p></div>
          </> : <>
            <div><span>1</span><p>將網址複製到 iPhone Safari 或 Android Chrome 開啟。</p></div>
            <div><span>2</span><p>從瀏覽器的 <strong>分享／選單</strong> 找到「加入主畫面」。</p></div>
          </>}
        </div>
      </>}
      {installPrompt && !standalone && <button type="button" className="appInstallDirect" onClick={installApp}>
        <Download size={18}/> 立即安裝到這台裝置
      </button>}
      <div className="appSafariGuide">
        {isIOS && <p className="appConnectDescription">iPhone 的「分享 App」選單不一定會列出 Safari。要在 Safari 使用「加入主畫面」，請先複製網址，再手動切換到 Safari 開啟。</p>}
        <div className="appSafariActions">
          <button type="button" className="appInstallCopy" onClick={copyLink}>
            <Copy size={17}/> {isIOS?'複製網址，貼到 Safari':'複製安裝連結'}
          </button>
          <a className="appTryBrowser" href={url} target="_blank" rel="noopener noreferrer" aria-label="嘗試在瀏覽器開啟 YOMIO（由系統決定瀏覽器）">
            <Globe size={17}/> 嘗試開啟瀏覽器 <ArrowUpRight size={15}/>
          </a>
        </div>
        {isIOS && <p className="appConnectFootnote">「嘗試開啟瀏覽器」不保證會跳到 Safari；若仍停留在 YOMIO App，請使用上方的複製網址方法。</p>}
      </div>
      <p className="appConnectFootnote">iPhone 請使用 Safari 的「加入主畫面」功能；YOMIO 無法強制讓 Safari 出現在系統分享清單，也無法代替使用者按下安裝。</p>
    </section>
  </>;
}
