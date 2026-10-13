import React, {useEffect, useState} from 'react';
import {Check, Copy, Download, ExternalLink, PlusSquare, Share2, Smartphone} from 'lucide-react';
import './sharing.css';

const appUrl = () => new URL(import.meta.env.BASE_URL, window.location.origin).href;

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
  const [installPrompt, setInstallPrompt] = useState(null);
  const [message, setMessage] = useState({section:'',text:'',success:false});

  useEffect(() => {
    const capturePrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', capturePrompt);
    return () => window.removeEventListener('beforeinstallprompt', capturePrompt);
  }, []);

  async function copyLink(section) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else if (!copyFallback(url)) {
        throw new Error('Copy not available');
      }
      setMessage({section,text:'連結已複製！可以貼給朋友或傳到 LINE。',success:true});
    } catch {
      try {
        if (!copyFallback(url)) throw new Error('Fallback copy failed');
        setMessage({section,text:'連結已複製！可以貼給朋友或傳到 LINE。',success:true});
      } catch {
        setMessage({section,text:'目前無法自動複製，請長按上方網址並選擇「複製」。',success:false});
      }
    }
  }

  async function shareLink() {
    if (typeof navigator.share !== 'function') {
      await copyLink('share');
      return;
    }
    try {
      await navigator.share({
        title:'YOMIO｜日文學習',
        text:'一起用 YOMIO 學日文！從五十音到 JLPT 分級練習。',
        url
      });
      setMessage({section:'share',text:'已透過系統分享功能傳送連結。',success:true});
    } catch (error) {
      if (error?.name === 'AbortError') return;
      setMessage({section:'share',text:'無法開啟系統分享，請使用「複製連結」。',success:false});
    }
  }

  async function installApp() {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setMessage({section:'install',text:'已送出安裝要求，請依裝置提示完成。',success:true});
      }
    } catch {
      setMessage({section:'install',text:'無法直接開啟安裝提示，請使用瀏覽器選單操作。',success:false});
    } finally {
      setInstallPrompt(null);
    }
  }

  const feedback = (section) => message.section === section && message.text
    ? <p className={'appConnectFeedback '+(message.success?'ok':'')} role="status" aria-live="polite">
        {message.success && <Check size={16}/>}
        {message.text}
      </p>
    : null;

  return <>
    <section className="settingsGroup appConnectGroup">
      <div className="settingsHeading"><Share2 size={19}/><span>分享 YOMIO</span></div>
      <p className="appConnectDescription">邀請朋友一起學日文！你可以開啟手機分享選單，或直接複製網址傳到 LINE。</p>
      <div className="appConnectLink">
        <input type="text" value={url} readOnly aria-label="YOMIO App 網址"
          onFocus={(event)=>event.currentTarget.select()} onClick={(event)=>event.currentTarget.select()}/>
        <ExternalLink size={18} aria-hidden="true"/>
      </div>
      <div className="appConnectActions">
        <button type="button" className="appConnectPrimary" onClick={shareLink}>
          <Share2 size={18}/> 分享 App
        </button>
        <button type="button" className="appConnectSecondary" onClick={()=>copyLink('share')}>
          <Copy size={18}/> 複製連結
        </button>
      </div>
      {feedback('share')}
    </section>

    <section className="settingsGroup appConnectGroup">
      <div className="settingsHeading"><Smartphone size={19}/><span>安裝 YOMIO App</span></div>
      {standalone ? <>
        <div className="appInstalled"><Check size={18}/><strong>目前正以主畫面 App 模式使用 YOMIO</strong></div>
        <p className="appConnectDescription">你已經可以從主畫面直接打開，不需要再次安裝。也能複製連結分享給朋友。</p>
      </> : <>
        <p className="appConnectDescription">加入手機主畫面後，就能像一般 App 一樣從圖示啟動 YOMIO，不需經過 App Store。</p>
        <div className="appInstallSteps">
          {isIOS ? <>
            <div><span>1</span><p>使用 <strong>Safari</strong> 開啟 YOMIO 網址。</p></div>
            <div><span>2</span><p>點選 Safari 的 <strong>分享</strong> 圖示。</p></div>
            <div><span>3</span><p>選擇 <strong>「加入主畫面」</strong>，再點「加入」。</p></div>
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
      <button type="button" className="appInstallCopy" onClick={()=>copyLink('install')}>
        <Copy size={17}/> 複製安裝連結
      </button>
      {feedback('install')}
      <p className="appConnectFootnote">iPhone 需透過 Safari 的「加入主畫面」完成安裝，網頁無法直接代替你按下安裝。</p>
    </section>
  </>;
}
