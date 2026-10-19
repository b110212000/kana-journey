import React, {useEffect, useRef, useState} from 'react';
import {ArrowLeft, Bookmark, Check, ChevronRight, Languages, LoaderCircle, Music2, Plus, Search, Square, Trash2, X} from 'lucide-react';
import {gradedWords} from './vocabulary';
import {searchLyrics, splitLyrics, translateJapanese} from './songApi';
import {getSavedSongs, saveSong, removeSong} from './songStorage';
import {getFuriganaEngine, annotateLine} from './songFurigana';
import {useToast} from './ToastProvider';
import './songStudy.css';

const MAX_TRANSLATED_CHARS_PER_RUN = 3500;
const lookup = new Map(gradedWords.map(item => [item.jp, item]));
const RUBY_PATTERN = /<ruby>([^<]*)<rp>[^<]*<\/rp><rt>([^<]*)<\/rt><rp>[^<]*<\/rp><\/ruby>|<ruby>([^<]*)<rt>([^<]*)<\/rt><\/ruby>/g;

function LyricText({plain, rubyMarkup, enabled, onWord}) {
  if (!enabled || !rubyMarkup) return <span>{plain}</span>;
  const parts = [];
  let last = 0;
  const regex = new RegExp(RUBY_PATTERN.source, 'g');
  for (const match of rubyMarkup.matchAll(regex)) {
    const start = match.index;
    if (start > last) parts.push(<React.Fragment key={'t'+start}>{rubyMarkup.slice(last, start)}</React.Fragment>);
    const kanji = match[1] ?? match[3];
    const reading = match[2] ?? match[4];
    parts.push(<ruby key={'r'+start} className="songRuby" onClick={() => onWord(kanji, reading)} title="點擊查看單字">{kanji}<rt>{reading}</rt></ruby>);
    last = start + match[0].length;
  }
  if (last < rubyMarkup.length) parts.push(<React.Fragment key="tail">{rubyMarkup.slice(last)}</React.Fragment>);
  return <span>{parts.length ? parts : plain}</span>;
}

export default function SongStudy({onBack}) {
  const notify = useToast();
  const [screen, setScreen] = useState('library');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [saved, setSaved] = useState([]);
  const [searching, setSearching] = useState(false);
  const [manual, setManual] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [pasted, setPasted] = useState('');
  const [active, setActive] = useState(null);
  const activeRef = useRef(null);
  const searchController = useRef(null);
  const translationController = useRef(null);
  const [showFurigana, setShowFurigana] = useState(true);
  const [furiganaStatus, setFuriganaStatus] = useState('idle');
  const [furiganaRetry, setFuriganaRetry] = useState(0);
  const [showChinese, setShowChinese] = useState(true);
  const [translationState, setTranslationState] = useState({running:false, done:0, total:0});
  const [editing, setEditing] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [wordInfo, setWordInfo] = useState(null);

  function reloadSaved() {
    getSavedSongs().then(list => setSaved(list)).catch(() => notify('本機歌曲資料庫無法讀取，請檢查瀏覽器儲存權限。', 'error'));
  }
  useEffect(() => {
    reloadSaved();
    return () => {searchController.current?.abort(); translationController.current?.abort(); translationController.current=null;};
  }, []);
  useEffect(() => {
    // Keep each nested screen at its own top, even after scrolling the history/results.
    const content = document.getElementById('app-scroll');
    if (content) content.scrollTop = 0;
  }, [screen]);

  function changeActive(next, persist = true) {
    activeRef.current = next;
    setActive(next);
    if (persist && next) saveSong(next).then(reloadSaved).catch(() => notify('歌曲無法儲存到此裝置。', 'error'));
  }
  function updateActive(change) {
    const current = activeRef.current;
    if (!current) return;
    const next = {...change(current), updatedAt:Date.now()};
    changeActive(next);
  }
  function returnLibrary() {
    searchController.current?.abort();
    searchController.current = null;
    setSearching(false);
    translationController.current?.abort();
    translationController.current = null;
    activeRef.current = null;
    setActive(null);
    setTranslationState({running:false, done:0, total:0});
    setFuriganaStatus('idle');
    setEditing(null);
    setWordInfo(null);
    setResults([]);
    setManual(false);
    setScreen('library');
    reloadSaved();
  }
  function enterSearch() {
    searchController.current?.abort();
    searchController.current = null;
    setSearching(false);
    setResults([]);
    setManual(false);
    setScreen('search');
  }
  function openSong(song) {
    searchController.current?.abort();
    searchController.current = null;
    setSearching(false);
    translationController.current?.abort();
    translationController.current = null;
    setTranslationState({running:false, done:0, total:0});
    setFuriganaStatus('idle');
    setEditing(null);
    setWordInfo(null);
    changeActive(song);
    setScreen('lyrics');
  }
  async function doSearch(event) {
    event.preventDefault();
    const keyword = query.trim();
    if (!keyword) return;
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    setSearching(true); setResults([]);
    try {
      const list = await searchLyrics(keyword, controller.signal);
      if (!controller.signal.aborted) {
        setResults(list);
        if (!list.length) notify('找不到相關歌曲，請換個關鍵字或手動貼上歌詞。', 'error');
      }
    } catch (error) {
      if (error.name !== 'AbortError') notify(error.message || '歌詞搜尋失敗，請稍後再試。', 'error');
    } finally {
      if (searchController.current === controller) setSearching(false);
    }
  }
  function chooseResult(track) {
    if (track.instrumental) return notify('這個版本標示為純音樂，沒有可分析的歌詞。', 'error');
    const lines = splitLyrics(track.plainLyrics || track.syncedLyrics);
    if (!lines.length) return notify('這個版本暫時沒有文字歌詞，請選其他版本或自行貼上。', 'error');
    const id = 'lrclib:' + track.id;
    const existing = saved.find(x => x.id === id);
    openSong(existing || {
      id, title:track.trackName || track.name || '未命名歌曲',
      artist:track.artistName || '', source:'LRCLIB', lines,
      translations:{}, readings:{}, updatedAt:Date.now()
    });
    setResults([]);
  }
  function addManual(event) {
    event.preventDefault();
    const lines = splitLyrics(pasted);
    if (!lines.length) return notify('請先貼上至少一句歌詞。', 'error');
    const entry = {
      id:'manual:'+Date.now(), title:title.trim() || '我的歌曲', artist:artist.trim(),
      source:'手動貼上', lines, translations:{}, readings:{}, updatedAt:Date.now()
    };
    openSong(entry);
    setManual(false); setPasted(''); setTitle(''); setArtist('');
    notify('已匯入歌詞，開始建立逐句對照。');
  }
  function deleteSaved(song) {
    if (!window.confirm('確定要刪除「' + song.title + '」的本機歌詞及翻譯嗎？')) return;
    removeSong(song.id).then(() => {
      if (activeRef.current?.id === song.id) returnLibrary();
      reloadSaved(); notify('已移除本機歌曲。');
    }).catch(() => notify('刪除失敗，請稍後重試。', 'error'));
  }
  function editTranslation(index) {
    setEditing(index);
    setEditedText(activeRef.current?.translations?.[index] || '');
  }
  function saveEdit(index) {
    updateActive(current => ({...current, translations:{...current.translations, [index]:editedText.trim()}}));
    setEditing(null);
    notify('已儲存這句中文翻譯。');
  }
  function pickWord(kanji, reading) {
    const known = lookup.get(kanji);
    setWordInfo({kanji, reading, known});
  }

  async function translateAll() {
    const chosen = activeRef.current;
    if (!chosen || translationController.current) return;
    const controller = new AbortController();
    translationController.current = controller;
    const pending = chosen.lines.reduce((a, line, index) => {
      if (line && !chosen.translations?.[index]) a.push(index);
      return a;
    }, []);
    if (!pending.length) {
      translationController.current = null;
      setTranslationState({running:false, done:0, total:0});
      return;
    }
    let done = 0, chars = 0, skipped = false;
    const memo = new Map();
    setTranslationState({running:true, done:0, total:pending.length});
    try {
      for (const index of pending) {
        if (controller.signal.aborted || activeRef.current?.id !== chosen.id) break;
        const line = chosen.lines[index];
        if ((chars + line.length) > MAX_TRANSLATED_CHARS_PER_RUN) {
          throw new Error('本次已接近免費額度的安全上限。剩餘句子可稍後按「翻譯未完成句子」。');
        }
        if (new TextEncoder().encode(line).length > 500) {
          done += 1;
          skipped = true;
          setTranslationState({running:true, done, total:pending.length});
          continue;
        }
        let zh = memo.get(line);
        if (!zh) {zh = await translateJapanese(line, controller.signal); memo.set(line, zh); chars += line.length;}
        if (controller.signal.aborted || activeRef.current?.id !== chosen.id) break;
        const current = activeRef.current;
        if (!current.translations?.[index]) updateActive(value => ({
          ...value, translations:{...value.translations, [index]:zh}
        }));
        done += 1;
        setTranslationState({running:true, done, total:pending.length});
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      if (!controller.signal.aborted && skipped) notify('部分歌詞太長，請手動填寫對應中文。', 'error');
      else if (!controller.signal.aborted && done === pending.length) notify('歌詞翻譯完成。');
    } catch (error) {
      if (error.name !== 'AbortError' && !controller.signal.aborted) {
        notify(error.message || '翻譯失敗，請稍後重試。', 'error');
      }
    } finally {
      if (translationController.current === controller) {
        translationController.current = null;
        setTranslationState(current => ({...current, running:false}));
      }
    }
  }
  // Load on selection, not on every change to a translation. Closing the page cancels requests.
  useEffect(() => {
    if (active?.id) translateAll();
  }, [active?.id]);

  useEffect(() => {
    if (!active?.id || !showFurigana) return;
    let cancelled = false;
    const id = active.id;
    setFuriganaStatus('loading');
    (async () => {
      try {
        const engine = await getFuriganaEngine();
        const lines = activeRef.current?.lines || [];
        for (let i = 0; i < lines.length && !cancelled; i++) {
          if (activeRef.current?.id !== id) break;
          if (activeRef.current?.readings?.[i]) continue;
          const formatted = await annotateLine(engine, lines[i]);
          if (cancelled || activeRef.current?.id !== id) break;
          updateActive(current => ({...current, readings:{...current.readings, [i]:formatted}}));
        }
        if (!cancelled) setFuriganaStatus('ready');
      } catch (error) {
        if (!cancelled) {
          console.error('Furigana initialization/conversion failed:', error);
          setFuriganaStatus('error');
          notify('假名產生失敗，請點「重試標音」。', 'error');
        }
      }
    })();
    return () => {cancelled = true;};
  }, [active?.id, showFurigana, furiganaRetry]);

  const missing = active ? active.lines.filter((line, index) => line && !active.translations?.[index]).length : 0;
  return <section className="page narrow songStudy">
    {screen==='library' && <>
      <div className="songIntro">
        <button className="songBack" type="button" onClick={onBack}><ArrowLeft size={17}/> 返回學習</button>
        <h2><Music2 size={23}/> 歌曲學日文</h2>
        <p>從喜歡的歌曲開始，把日文變成每天的練習。</p>
      </div>
      <button className="songAddButton" type="button" onClick={enterSearch}><Plus size={21}/> <span><strong>搜尋／新增歌曲</strong><small>透過歌名搜尋，或貼上自己的歌詞</small></span><ChevronRight size={18}/></button>
      <div className="songPanel songHistory">
        <div className="songHistoryHeading">
          <h3><Bookmark size={18}/> 歷史紀錄</h3>
          <span>{saved.length} 首已儲存</span>
        </div>
        {saved.length ? <div className="songLibraryList" aria-label="已儲存歌曲列表">
          {saved.map(item => <div className="songSavedRow" key={item.id}>
            <button type="button" onClick={()=>openSong(item)}>
              <span className="songSmallIcon"><Music2 size={18}/></span>
              <span className="songSavedDetail"><strong>{item.title}</strong><small>{item.artist || '我的歌曲'} · {item.lines?.length || 0} 行歌詞</small></span>
              <ChevronRight size={16}/>
            </button>
            <button className="songDelete" type="button" aria-label={'刪除 '+item.title} title="刪除這首歌的本機資料" onClick={()=>deleteSaved(item)}><Trash2 size={17}/></button>
          </div>)}
        </div> : <div className="songEmptyHistory"><Music2 size={30}/><strong>還沒有學過的歌曲</strong><p>新增一首歌後，就能從這裡繼續學習。</p></div>}
      </div>
    </>}
    {screen==='search' && <>
      <div className="songIntro">
        <button className="songBack" type="button" onClick={returnLibrary}><ArrowLeft size={17}/> 返回歌曲首頁</button>
        <h2><Search size={23}/> 搜尋歌曲</h2>
        <p>搜尋歌名或歌手，選擇歌曲後會進入歌詞學習。</p>
      </div>
      <form className="songSearch" onSubmit={doSearch}>
        <label htmlFor="song-query">歌曲名稱或歌手</label>
        <div><input id="song-query" value={query} maxLength={120} onChange={e => setQuery(e.target.value)} placeholder="例：夜に駆ける YOASOBI" autoComplete="off"/><button type="submit" disabled={searching || !query.trim()}>{searching?<LoaderCircle size={17} className="songSpin"/>:<Search size={17}/>} 搜尋</button></div>
      </form>
      {results.length > 0 && <div className="songPanel songResults"><h3>搜尋結果 · {results.length} 首</h3><div className="songResultsScroll" aria-label="搜尋結果列表">{results.map(track => <button key={track.id} type="button" onClick={() => chooseResult(track)}><Music2 size={18}/><span><strong>{track.trackName || track.name}</strong><small>{track.artistName} · {track.albumName || '未標註專輯'}{track.instrumental ? ' · 純音樂' : ''}</small></span><ChevronRight size={17}/></button>)}</div></div>}
      <button className="songManualToggle" type="button" aria-expanded={manual} onClick={() => setManual(!manual)}>{manual?<X size={16}/>:<Languages size={16}/>} {manual?'取消手動貼上':'找不到歌詞？自行貼上歌詞'}</button>
      {manual && <form className="songPanel songManual" onSubmit={addManual}><label>歌名（選填）<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={100} placeholder="歌曲名稱"/></label><label>歌手（選填）<input value={artist} onChange={e=>setArtist(e.target.value)} maxLength={100} placeholder="歌手"/></label><label>貼上日文歌詞<textarea value={pasted} onChange={e=>setPasted(e.target.value)} rows={6} maxLength={20000} placeholder="每一句一行，支援帶時間戳記的 LRC 歌詞"/></label><button className="songPrimary" type="submit" disabled={!pasted.trim()}>建立逐句學習</button></form>}
    </>}
    {screen==='lyrics' && active && <>
      <button className="songBack" type="button" onClick={returnLibrary}><ArrowLeft size={17}/> 返回歌曲首頁</button>
      <div className="songActive">
        <div className="songTrackHeader"><span className="songRecordIcon"><Music2 size={25}/></span><div><h3>{active.title}</h3><p>{active.artist || '我的歌曲'} · {active.source} · {active.lines.length} 行</p></div></div>
        <div className="songOptions">
          <label><input type="checkbox" checked={showFurigana} onChange={e=>setShowFurigana(e.target.checked)}/> 顯示漢字假名</label>
          <label><input type="checkbox" checked={showChinese} onChange={e=>setShowChinese(e.target.checked)}/> 顯示中文</label>
          {showFurigana && furiganaStatus==='loading' && <span className="songFuriganaStatus" role="status">標音字典載入中…</span>}
          {showFurigana && furiganaStatus==='error' && <button className="songRetryFurigana" type="button" onClick={()=>setFuriganaRetry(count=>count+1)}>重試標音</button>}
        </div>
        <div className="songTranslateBar">
          <span>{translationState.running ? '翻譯中 ' + translationState.done + '/' + translationState.total + '…' : missing===0 ? '逐句翻譯已完成' : '尚有 ' + missing + ' 句未翻譯'}</span>
          {translationState.running ? <button type="button" onClick={()=>{translationController.current?.abort(); notify('已停止翻譯。');}}><Square size={14}/> 停止</button> : missing > 0 && <button type="button" onClick={translateAll}>翻譯未完成句子</button>}
        </div>
        <div className="songLyrics" lang="ja">{active.lines.map((line, index) => <article className="songLine" key={index}>
          <span className="songLineNumber">{String(index+1).padStart(2, '0')}</span>
          <div className="songLineBody">
            <p className="songJapanese"><LyricText plain={line} rubyMarkup={active.readings?.[index]} enabled={showFurigana} onWord={pickWord}/></p>
            {showChinese && (editing===index ?
              <div className="songEdit"><textarea rows={2} lang="zh-Hant" value={editedText} onChange={e=>setEditedText(e.target.value)} aria-label={'第 '+(index+1)+' 句中文譯文'}/><button type="button" onClick={()=>saveEdit(index)}><Check size={15}/> 儲存</button><button type="button" onClick={()=>setEditing(null)}>取消</button></div> :
              <button type="button" className={'songChinese ' + (active.translations?.[index]?'':'songUntranslated')} lang="zh-Hant" onClick={()=>editTranslation(index)} title="點擊編輯中文翻譯">{active.translations?.[index] || (translationState.running?'翻譯中／點此手動填寫':'點此新增中文翻譯')} <span>✎</span></button>
            )}
          </div>
        </article>)}</div>
        {wordInfo && <div className="songWordInfo" role="status"><button aria-label="關閉單字" type="button" onClick={()=>setWordInfo(null)}><X size={15}/></button><strong>{wordInfo.kanji}（{wordInfo.reading}）</strong><p>{wordInfo.known ? wordInfo.known.zh+' · '+wordInfo.known.level : '目前內建單字庫未收錄此詞，可參考假名讀音。'}</p></div>}
        <p className="songFinePrint">歌詞來源：{active.source}。點擊漢字可查看單字，點擊中文可編輯譯文。標音與翻譯僅供學習參考。</p>
      </div>
    </>}
  </section>;
}
