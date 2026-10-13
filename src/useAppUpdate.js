import {useCallback, useEffect, useState} from 'react';

const VERSION_URL = new URL(import.meta.env.BASE_URL + 'version.json', window.location.origin).href;

export function compareVersions(left, right) {
  const parse = value => String(value || '').trim().split('.').map(Number);
  if (!/^\d+\.\d+\.\d+$/.test(left) || !/^\d+\.\d+\.\d+$/.test(right)) return 0;
  const a = parse(left), b = parse(right);
  for (let i=0; i<3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  }
  return 0;
}

export function useAppUpdate(currentVersion) {
  const [update, setUpdate] = useState({status:'checking', latest:currentVersion, lastChecked:null});

  const check = useCallback(async ({silent=false} = {}) => {
    if (!navigator.onLine) {
      setUpdate(old => ({...old, status:'offline'}));
      return 'offline';
    }
    if (!silent) setUpdate(old => ({...old, status:'checking'}));
    try {
      const response = await fetch(VERSION_URL + '?t=' + Date.now(), {
        cache:'no-store',
        headers:{'Accept':'application/json'}
      });
      if (!response.ok) throw new Error('HTTP '+response.status);
      const manifest = await response.json();
      if (!manifest || !/^\d+\.\d+\.\d+$/.test(manifest.version)) throw new Error('Invalid version manifest');
      const newest = compareVersions(manifest.version, currentVersion) > 0;
      setUpdate({status:newest?'available':'current',latest:manifest.version,lastChecked:Date.now()});
      return newest ? 'available' : 'current';
    } catch {
      setUpdate(old=>({...old,status:'error'}));
      return 'error';
    }
  },[currentVersion]);

  useEffect(() => {
    // Check when first opened, when returning to the PWA, and periodically.
    // No automatic reload while the user is studying or taking a quiz.
    check({silent:true});
    const onVisible=()=>{if(document.visibilityState==='visible')check({silent:true})};
    const onOnline=()=>check({silent:true});
    document.addEventListener('visibilitychange',onVisible);
    window.addEventListener('focus',onVisible);
    window.addEventListener('online',onOnline);
    const timer=setInterval(()=>check({silent:true}),10*60*1000);
    return ()=>{
      document.removeEventListener('visibilitychange',onVisible);
      window.removeEventListener('focus',onVisible);
      window.removeEventListener('online',onOnline);
      clearInterval(timer);
    };
  },[check]);

  const installLatest = useCallback(() => {
    if (update.status !== 'available') return false;
    // Force a fresh navigation (including iPhone standalone PWA) to the latest
    // deployed GitHub Pages index. Existing localStorage is left untouched.
    const url = new URL(import.meta.env.BASE_URL, window.location.origin);
    url.searchParams.set('appVersion', update.latest);
    url.searchParams.set('reload', Date.now().toString());
    window.location.replace(url.href);
    return true;
  },[update.status,update.latest]);

  return {...update, available:update.status==='available', check, installLatest};
}
