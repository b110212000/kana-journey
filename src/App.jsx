import React, {useEffect, useMemo, useRef, useState} from 'react';
import {House, BookOpen, Layers3, ClipboardCheck, Settings2, ChevronRight, Sun, Moon, Share2, Info, Trophy, History, Download, RotateCcw} from 'lucide-react';
import {scorePercent,scoreDate,shareScore,downloadScoreImage} from './share';
import {hira,kata,romaji,words} from './data';
import {levels,questionBank} from './questions';
import {pickQuiz,recordQuizSeen} from './quizRotation';
import {gradedWords} from './vocabulary';
import {speak,preloadKana} from './audio';
import './app.css';
import './ios.css';
import './yomio.css';
import './quiz.css';
import SettingsView from './SettingsView';
import {useAppUpdate} from './useAppUpdate';
import packageInfo from '../package.json';
import {useToast} from './ToastProvider';

const VERSION=packageInfo.version;
const APP_ICON=`${import.meta.env.BASE_URL}icon.svg?v=130`;
const KEY='kana-journey-v1';
const families=[
  {name:'あ行',from:0,to:5},{name:'か行',from:5,to:10},
  {name:'さ行',from:10,to:15},{name:'た行',from:15,to:20},
  {name:'な行',from:20,to:25},{name:'は行',from:25,to:30},
  {name:'ま行',from:30,to:35},{name:'や行',from:35,to:38},
  {name:'ら行',from:38,to:43},{name:'わ行',from:43,to:46}
];
const getSaved=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
function shuffled(list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function options(correct,from){return shuffled([correct,...shuffled([...new Set(from.filter(v=>v!==correct))]).slice(0,3)])}
const clean=(str)=>str.replace(/[。、！!？?]/g,'');
const kanaExamples=['あさ','いぬ','うみ','えき','おちゃ','かさ','きく','くるま','けしごむ','こえ','さかな','しお','すし','せかい','そら','たまご','ちず','つき','てがみ','とり','なつ','にく','ぬの','ねこ','のみもの','はな','ひと','ふね','へや','ほん','まど','みず','むし','め','もり','やま','ゆき','よる','らいねん','りんご','るす','れいぞうこ','ろうか','わたし','本を読む','ほん'];
const starterKana=[
 ...hira.map((char,i)=>({char,reading:romaji[i],key:'h-'+i})),
 ...kata.map((char,i)=>({char,reading:romaji[i],key:'k-'+i}))
];
function starterPool(){
 const kanaQuestions=starterKana.flatMap((k,i)=>[
  {id:'b-k-'+k.key,type:'假名',prompt:['を','ヲ'].includes(k.char)?'「'+k.char+'」的羅馬字寫法是哪個？（實際常讀 o）':'「'+k.char+'」的基本發音是哪一個？',spoken:k.char,answer:k.reading,
    options:options(k.reading,romaji),explain:['を','ヲ'].includes(k.char)?'「を」常寫作 wo，但現代標準日語通常讀 o。':k.char+' 的基本發音是 '+k.reading+'。'+(['へ','ヘ'].includes(k.char)?'作方向助詞時，へ 才讀 e。':'')},
  {id:'b-r-'+k.key,type:'假名',prompt:k.reading==='wo'?'哪個假名的羅馬字寫作「wo」？':'哪個假名的基本讀音是「'+k.reading+'」？',spoken:k.char,answer:k.char,
    options:options(k.char,(i<46?hira:kata)),explain:k.reading+' 對應的假名是 '+k.char+'。'}
 ]);
 const wordQuestions=words.flatMap((w,i)=>[
  {id:'b-w-'+i,type:'單字',prompt:'「'+w.jp+'」的意思是？',spoken:w.jp,answer:w.zh,
   options:options(w.zh,words.map(x=>x.zh)),explain:w.jp+'（'+w.reading+'）＝'+w.zh},
  {id:'b-wr-'+i,type:'單字',prompt:'哪個日文表示「'+w.zh+'」？',spoken:w.jp,answer:w.jp,
   options:options(w.jp,words.map(x=>x.jp)),explain:w.zh+' ＝ '+w.jp+'（'+w.reading+'）'}
 ]);
 return [...kanaQuestions,...wordQuestions];
}
function getLevelPool(level){
 if(level==='初階')return starterPool();
 return (questionBank[level]||[]).map(q=>({...q,spoken:q.prompt,options:shuffled(q.options)}));
}
function App(){
 const [db,setDb]=useState(getSaved);
 const [settingsOpen,setSettingsOpen]=useState(null);
 const update=useAppUpdate(VERSION);
 const [tab,setTab]=useState('home');
 const contentRef=useRef(null);
 const completedRunRef=useRef(null);
 const [quizPanel,setQuizPanel]=useState('practice');
 const [sessionId,setSessionId]=useState(null);
 const [sessionMeta,setSessionMeta]=useState(null);
 const [latestResult,setLatestResult]=useState(null);
 const notify = useToast();
 const theme=db.theme==='dark'?'dark':'light';
 useEffect(()=>{
  document.documentElement.dataset.theme=theme;
  document.documentElement.style.colorScheme=theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#101F25':'#F5F9F7');
 },[theme]);
 const [level,setLevel]=useState(db.selectedLevel||'初階');
 const [script,setScript]=useState('平假名');
 const [family,setFamily]=useState(0);
 const [card,setCard]=useState(0);
 const [wordIndex,setWordIndex]=useState(0);
 const [reveal,setReveal]=useState(false);
 const [audioStatus,setAudioStatus]=useState('idle');
 const [focus,setFocus]=useState('全部');
 const [paper,setPaper]=useState([]);
 const [at,setAt]=useState(0);
 const [picked,setPicked]=useState(null);
 const [correctInRound,setCorrectInRound]=useState(0);
 const [reviewMode,setReviewMode]=useState(false);
 const [sessionDone,setSessionDone]=useState(false);
 const [audioNote,setAudioNote]=useState(false);
 useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(db))},[db]);
 useEffect(()=>{setDb(old=>({...old,selectedLevel:level}))},[level]);
 const chosenKana=script==='平假名'?hira:kata;
 const rowInfo=families[family];
 const row=chosenKana.slice(rowInfo.from,rowInfo.to).map((char,i)=>({char,reading:romaji[rowInfo.from+i],id:(script==='平假名'?'h':'k')+'-'+(rowInfo.from+i)}));
 const currentKana=row[card]||row[0];
 const selectedWords=level==='初階'?words.map(w=>({jp:w.jp,kana:w.reading,zh:w.zh,example:'',meaning:'',level:'初階'})):gradedWords.filter(x=>x.level===level);
 const word=selectedWords[wordIndex%selectedWords.length];
 const learned=db.learned||{},wrong=db.wrong||{},stats=db.stats||{};
 const quizHistory=Array.isArray(db.quizHistory)?db.quizHistory:[];
 const currentResult=latestResult||quizHistory.find(item=>item.id===sessionId);
 const success=stats.total?Math.round((stats.correct||0)/stats.total*100):0;
 const studied=starterKana.filter(x=>(learned[(x.key.startsWith('h-')?'h':'k')+x.key.slice(1)]||0)>0).length;
 const filteredPool=useMemo(()=>getLevelPool(level),[level]);
 const topics=level==='初階'?['全部','假名','單字']:['全部','單字','文法','讀解'];
 const issue=paper[at];
 const progress=paper.length?Math.round(100*at/paper.length):0;
 const go=(next,settingsSection=null)=>{if(next==='settings')setSettingsOpen(settingsSection);setTab(next);setAudioStatus('idle');setAudioNote(false);if(contentRef.current)contentRef.current.scrollTop=0};
 const changeTheme=next=>setDb(old=>({...old,theme:next}));
 const selectQuizPanel=panel=>{setQuizPanel(panel);if(contentRef.current)contentRef.current.scrollTop=0};
 const changeLevel=next=>{setLevel(next);setFocus('全部');setWordIndex(0);setPaper([]);setSessionDone(false);setPicked(null);setReviewMode(false);setQuizPanel('practice')};
 const shareResult=async result=>{
   if(!result)return;
   try {
     const status=await shareScore(result);
     if(status==='shared')notify('已完成成績分享操作。');
     else if(status==='copied')notify('成績文字已複製，可貼到 LINE 或訊息。');
     else if(status==='downloaded')notify('成績圖片已開始下載，請依瀏覽器提示儲存。');
   }catch {
     notify('無法開啟分享功能，請改用儲存圖片。','error');
   }
 };
 const saveScoreImage=result=>{
   if(!result)return;
   try {
     downloadScoreImage(result);
     notify('已開始下載成績圖片，請依瀏覽器提示儲存。');
   }catch {
     notify('無法產生成績圖片，請稍後重試。','error');
   }
 };
 const chooseFamily=i=>{setFamily(i);setCard(0);setAudioStatus('idle')};
 useEffect(()=>{if(tab==='learn' && level==='初階')preloadKana(row.map(x=>x.char))},[tab,script,family,level]);
 const play=(text)=>speak(text,setAudioStatus);
 const record=good=>{
   setDb(old=>{
    const id=issue.id, before=old.wrong?.[id]||0;
    return {...old,stats:{total:(old.stats?.total||0)+1,correct:(old.stats?.correct||0)+(good?1:0)},
      wrong:{...old.wrong,[id]:Math.max(0,before+(good?-1:2))},
      learned:issue.type==='假名' && good ? {...old.learned,
        [((issue.id.includes('-h-'))?'h':'k') + issue.id.slice(issue.id.lastIndexOf('-'))]:1}:old.learned};
   });
 };
 function begin(wrongOnly=false,withFocus=focus){
   let all=getLevelPool(level);
   if(wrongOnly){
     const ids=new Set(Object.entries(wrong).filter(([,n])=>n>0).map(([id])=>id));
     all=all.filter(q=>ids.has(q.id));
   }else if(level==='初階' && withFocus!=='單字'){
     // 初階從目前學習的假名行出題，不會剛開始就考整張表。
     const allowed=new Set(row.map(x=>x.id));
     all=all.filter(q=>q.type==='假名' && [...allowed].some(id=>q.id.endsWith(id)));
   }else if(withFocus!=='全部') all=all.filter(q=>q.type===withFocus);
   const rotationKey=level+':'+(wrongOnly?'review':withFocus)+(level==='初階'&&withFocus!=='單字'?':'+script+':'+family:'');
   const availableIds=all.map(q=>q.id);
   const recent=Array.isArray(db.quizSeen?.[rotationKey])?db.quizSeen[rotationKey]:[];
   const quiz=pickQuiz(all,recent,10).map(q=>({...q,options:shuffled(q.options)}));
   if(!quiz.length){notify('目前沒有符合條件的題目，請換個題型。','error');return}
   setPaper(quiz);setAt(0);setPicked(null);setCorrectInRound(0);setReviewMode(wrongOnly);
   setSessionId('run-'+Date.now()+'-'+Math.random().toString(36).slice(2,7));
   setSessionMeta({level,category:wrongOnly?'錯題複習':withFocus,rotationKey,availableIds});
   setLatestResult(null);completedRunRef.current=null;
   setQuizPanel('practice');setSessionDone(false);go('quiz');
 }
 function answer(value){
   if(picked!==null)return;
   setPicked(value);
   const good=value===issue.answer;
   setCorrectInRound(n=>n+(good?1:0));record(good);
 }
 function next(){
   if(at+1>=paper.length){
     if(!paper.length||sessionDone||completedRunRef.current===sessionId)return;
     completedRunRef.current=sessionId;
     const item={
       id:sessionId||'run-'+Date.now(),
       date:Date.now(),
       level:sessionMeta?.level||level,
       correct:correctInRound,
       total:paper.length,
       mode:reviewMode?'review':'practice',
       category:sessionMeta?.category||(reviewMode?'錯題複習':focus)
     };
     setDb(old=>{
       const history=Array.isArray(old.quizHistory)?old.quizHistory:[];
       if(history.some(r=>r.id===item.id))return old;
       const key=sessionMeta?.rotationKey;
       return {
         ...old,
         quizHistory:[item,...history].slice(0,200),
         quizSeen:key?{
           ...old.quizSeen,
           [key]:recordQuizSeen(old.quizSeen?.[key]||[],sessionMeta.availableIds,paper.map(q=>q.id))
         }:old.quizSeen
       };
     });
     setLatestResult(item);setSessionDone(true);setPicked(null);
     notify('成績已存入測驗紀錄。');
   }else {setAt(x=>x+1);setPicked(null)}
 }
 function navButton(key,title,glyph){return <button key={key} type="button" aria-current={tab===key?'page':undefined} aria-label={key==='settings'&&update.available?'設定，有新版本可更新':title} className={'navButton '+(tab===key?'current':'')} onClick={()=>go(key)}><span className="navIcon" aria-hidden="true">{glyph}{key==='settings'&&update.available&&<span className="settingsUpdateDot"/>}</span><span>{title}</span></button>}
 return <div className="app">
  <aside className="sidebar">
   <button className="logo" onClick={()=>go('home')}><img className="brandIcon" src={APP_ICON} alt=""/><span><strong>YOMIO</strong><small>日本語，一點一點學</small></span></button>
   <nav aria-label="主要選單">
    {navButton('home','首頁',<House size={22}/>)}{navButton('learn','學習',<BookOpen size={22}/>)}{navButton('words','單字',<Layers3 size={22}/>)}{navButton('quiz','測驗',<ClipboardCheck size={22}/>)}{navButton('settings','設定',<Settings2 size={22}/>)}
   </nav>
   <div className="sidebarFoot">每天 30 分鐘，持續一點點進步</div>
  </aside>
  <main className="content">
   <header className="appTop">
    <div className="appTitle"><img src={APP_ICON} alt="" className="headerIcon"/><div><span className="smallOverline">YOMIO · JAPANESE LEARNING</span><h1>{({home:'今天也來學日文',learn:level==='初階'?'五十音學習':'課程學習',words:'單字練習',quiz:quizPanel==='history'?'測驗紀錄':'隨機測驗',settings:'設定'})[tab]}</h1></div></div>
    {tab!=='settings'&&<button className="headerSettings" type="button" aria-label="開啟設定" onClick={()=>go('settings')}><Settings2 size={22}/>{update.available&&<span className="settingsUpdateDot" aria-hidden="true"/>}</button>}
   </header>
   <div className="contentScroll" ref={contentRef} id="app-scroll">
   {tab==='home'&&<section className="page">
    <div className="heroSimple"><div><span className="eyebrow">YOMIO · DAILY LEARNING</span><h2>每天一點，<br/>日文更近一點。</h2><p>從五十音開始，輕鬆走向日常對話。</p></div><img className="heroBrandMark" src={APP_ICON} alt="YOMIO 標誌"/></div>
    <div className="sectionHeading"><div><h2>繼續你的學習</h2><p>今天先完成一個小目標。</p></div></div>
    <button className="levelShortcut" onClick={()=>go('settings','level')} aria-label="前往設定調整目前程度"><span className="levelSymbol">文</span><span><small>目前程度</small><strong>{level}・{levels.find(x=>x.id===level)?.subtitle}</strong></span><ChevronRight size={19}/></button>
    <div className="actionPair"><button className="routeCard" onClick={()=>go('learn')}><span className="routeIcon">あ</span><strong>{level==='初階'?'學習五十音':'本級重點單字'}</strong><span>循序學習・每次一小組</span><b>開始學習 →</b></button><button className="routeCard" onClick={()=>beginQuizFromHome()}><span className="routeIcon warm">✓</span><strong>今天的 10 題練習</strong><span>題目和選項隨機排列</span><b>開始測驗 →</b></button></div>
    <div className="miniStats"><span>已作答 <strong>{stats.total||0}</strong> 題</span><span>正確率 <strong>{success}%</strong></span><span>待複習 <strong>{Object.values(wrong).filter(n=>n>0).length}</strong> 題</span></div>
    {quizHistory.length>0&&<button className="latestScoreShortcut" onClick={()=>{setQuizPanel('history');go('quiz')}}><span className="latestScoreIcon"><Trophy size={23}/></span><span><strong>我的測驗紀錄</strong><small>已完成 {quizHistory.length} 回合，最近一次 {scorePercent(quizHistory[0])}%</small></span><ChevronRight size={18}/></button>}
   </section>}
   {tab==='learn'&&<section className="page narrow">
    {level!=='初階'?<><div className="lessonTitle"><span className="eyebrow">LEVEL {level}</span><h2>先認識這一級的常用單字</h2><p>一次一張單字卡，學會後再練習題目。</p></div><WordFlashCard word={word} position={wordIndex} total={selectedWords.length} reveal={reveal} setReveal={setReveal} onPlay={play} onNext={()=>{setWordIndex(i=>(i+1)%selectedWords.length);setReveal(false)}} onPrev={()=>{setWordIndex(i=>(i-1+selectedWords.length)%selectedWords.length);setReveal(false)}}/><button className="secondaryWide" onClick={()=>go('quiz')}>接著做 {level} 測驗 →</button></>:
    <><div className="lessonTitle"><span className="eyebrow">初階・五十音</span><h2>每天一行，慢慢記住發音</h2><p>先選平假名或片假名，再學這一行的 3～5 個字。</p></div>
    <div className="switchTabs">{['平假名','片假名'].map(s=><button key={s} className={script===s?'active':''} onClick={()=>{setScript(s);setCard(0)}}>{s}</button>)}</div>
    <div className="rowScroll" aria-label="選擇五十音行">{families.map((x,i)=><button key={x.name} className={family===i?'active':''} onClick={()=>chooseFamily(i)}>{x.name}</button>)}</div>
    <div className="studyCard"><div className="studyHead"><strong>{rowInfo.name}</strong><span>{row.length} 個假名</span></div>
     <div className={'kanaRow '+(row.length===3?'three':'')} role="group" aria-label={rowInfo.name}>
      {row.map((x,i)=><button key={x.id} aria-label={x.char+' '+x.reading} className={i===card?'chosen':''} onClick={()=>{setCard(i);play(x.char)}}><span>{x.char}</span><small>{x.reading}</small></button>)}
     </div>
     <div className="focusKana"><span className="focusChar">{currentKana.char}</span><strong>{currentKana.reading}</strong><span>點上方假名可聆聽錄音</span></div>
     <button className="playButton" onClick={()=>play(currentKana.char)}>▶ 播放「{currentKana.char}」發音</button>
     <div className="audioFeedback" aria-live="polite">{audioStatus==='loading'?'音檔載入中…':audioStatus==='error'?'音檔目前無法播放，請檢查連線後重試。':audioStatus==='playing'?'正在播放發音':'短音練習：聽一遍，再自己唸一遍。'}</div>
     <button className="exampleSound" onClick={()=>play(kanaExamples[rowInfo.from+card])}>▶ 聽例詞「{kanaExamples[rowInfo.from+card]}」作發音對照</button>
     {['へ','ヘ','は','ハ','を','ヲ','ん','ン'].includes(currentKana.char)&&<div className="soundTip">
      <strong>發音提醒</strong>
      <p>{['へ','ヘ'].includes(currentKana.char)?'「へ」作假名讀 he；作方向助詞時讀 e。': ['は','ハ'].includes(currentKana.char)?'「は」作假名讀 ha；作主題助詞時讀 wa。':['を','ヲ'].includes(currentKana.char)?'「を」現代標準語通常發 o 音（羅馬字也常寫 wo）。':'「ん」是鼻音，與前後發音環境有關。'}</p>
      
     </div>}
     <div className="centerNav"><button onClick={()=>{setCard(i=>(i-1+row.length)%row.length);setAudioStatus('idle')}}>← 上一個</button><button onClick={()=>{setCard(i=>(i+1)%row.length);setAudioStatus('idle')}}>下一個 →</button></div>
    </div></>}
   </section>}
   {tab==='words'&&<section className="page narrow"><div className="lessonTitle"><span className="eyebrow">{level}・單字卡</span><h2>少量多次，比一次背完有效</h2><p>先試著認讀，點開答案再看意思和例句。</p></div><WordFlashCard word={word} position={wordIndex} total={selectedWords.length} reveal={reveal} setReveal={setReveal} onPlay={play} onNext={()=>{setWordIndex(i=>(i+1)%selectedWords.length);setReveal(false)}} onPrev={()=>{setWordIndex(i=>(i-1+selectedWords.length)%selectedWords.length);setReveal(false)}}/><button className="secondaryWide" onClick={()=>go('quiz')}>使用 {level} 題庫測驗 →</button></section>}
   {tab==='quiz'&&<section className="page narrow"><div className="quizHeader">
    <div><span className="eyebrow">PRACTICE ・ {level}</span><h2>一題一題，專心思考</h2><p>每回合最多 10 題，優先抽還沒練過的題目。</p>
    <div className="quizBankInfo">
     {level==='初階'?<>五十音與生活單字合計 {filteredPool.length} 題；目前假名行 {row.length*2} 題</>:
     <>本級題庫 <strong>{filteredPool.length}</strong> 題 · {['單字','文法','讀解'].map(t=>t+' '+filteredPool.filter(q=>q.type===t).length).join(' · ')}</>}
    </div>
    </div>
   </div>
   <div className="quizTabs" role="group" aria-label="測驗與歷史紀錄">
    <button type="button" className={quizPanel==='practice'?'selected':''} aria-pressed={quizPanel==='practice'} onClick={()=>selectQuizPanel('practice')}><ClipboardCheck size={17}/> 開始測驗</button>
    <button type="button" className={quizPanel==='history'?'selected':''} aria-pressed={quizPanel==='history'} onClick={()=>selectQuizPanel('history')}><History size={17}/> 測驗紀錄 <span className="historyCount">{quizHistory.length}</span></button>
   </div>
   {quizPanel==='history'?<QuizHistory history={quizHistory} onShare={shareResult} onDownload={saveScoreImage} onPractice={()=>{setPaper([]);setQuizPanel('practice')}}/>:
   !paper.length?<div className="testSetup"><h3>準備開始 {level} 練習</h3><div className="chipGroup">{topics.map(type=><button key={type} className={focus===type?'active':''} onClick={()=>setFocus(type)}>{type}</button>)}</div><p className="muted">{level==='初階'?'初階預設從目前學習的 '+rowInfo.name+' 出題；選「單字」可練生活單字。':'選擇題型，不想限制就選「全部」。'}</p><button className="primary" onClick={()=>begin(false)}>開始隨機測驗 →</button>
    <div className="testDivider"/><div className="retryBox"><span>錯題再練一次</span><strong>{filteredPool.filter(q=>(wrong[q.id]||0)>0).length} 題待複習</strong><button onClick={()=>begin(true)} disabled={!filteredPool.some(q=>(wrong[q.id]||0)>0)}>重練錯題</button></div></div>
   : sessionDone?<div className="resultCard">
      {currentResult&&<ScoreSummary record={currentResult}/>}
      <h3>{correctInRound===paper.length?'太棒了，全部答對！':'完成一回合，繼續進步！'}</h3>
      <p>可分享成績卡給朋友，或查看歷史紀錄與錯題。</p>
      <div className="resultActions">
       <button className="primary shareScoreButton" onClick={()=>shareResult(currentResult)} disabled={!currentResult}><Share2 size={18}/> 分享我的成績</button>
       <button className="downloadScoreButton" onClick={()=>saveScoreImage(currentResult)} disabled={!currentResult}><Download size={17}/> 儲存圖片</button>
      </div>
      <div className="resultSecondary">
       <button onClick={()=>begin(false)}><RotateCcw size={16}/> 再做一回合</button>
       <button onClick={()=>selectQuizPanel('history')}><History size={16}/> 查看紀錄</button>
      </div>
      <button className="bare" onClick={()=>{setPaper([]);setSessionDone(false)}}>調整題型</button>
    </div>
   :<div className="testCard"><div className="quizMeta"><span>{at+1} / {paper.length} 題</span><span>{issue.type}</span></div><div className="progressBar"><div style={{width:progress+'%'}}/></div>
     <div className="question">{issue.prompt}</div>
     {issue.type==='假名'&&<button className="textButton" onClick={()=>play(issue.spoken)}>▶ 聽發音</button>}
     <div className="answers">{issue.options.map((opt,i)=><button key={i} className={picked===null?'':opt===issue.answer?'right':picked===opt?'wrong':''} disabled={picked!==null} onClick={()=>answer(opt)}><span className="answerLetter">{String.fromCharCode(65+i)}</span><span>{opt}</span></button>)}</div>
     {picked!==null&&<div className="explain"><strong>{picked===issue.answer?'✓ 答對了':'正確答案：'+issue.answer}</strong><p>{issue.explain}</p><button className="primary" onClick={next}>{at+1===paper.length?'查看結果':'下一題 →'}</button></div>}
     <button className="quitTest" onClick={()=>{setPaper([]);setPicked(null)}}>結束本回合</button>
    </div>}
   </section>}
   {tab==='settings'&&<SettingsView
    level={level} levels={levels} onLevelChange={changeLevel}
    theme={theme} onThemeChange={changeTheme} appIcon={APP_ICON}
    version={VERSION} update={update}
    open={settingsOpen} onToggle={setSettingsOpen}/>}
   <footer>YOMIO · 學習資料儲存於此裝置・題目為原創練習題，非 JLPT 官方歷屆試題・<a href="https://www.jlpt.jp/tw/samples/sampleindex.html" target="_blank" rel="noreferrer">官方樣題</a></footer>
  </div>
  </main>
 </div>;

 function beginQuizFromHome(){setFocus('全部');begin(false,'全部')}
}
function ScoreSummary({record}){
 const value=scorePercent(record);
 return <div className="scorePreview" aria-label={'本次得分 '+value+'%'}>
  <div className="scorePreviewBrand"><Trophy size={18}/><span>YOMIO · 成就解鎖</span></div>
  <div className="scorePreviewLevel">{record.level} · {record.mode==='review'?'錯題複習':'日語測驗'}</div>
  <div className="scorePreviewPercent">{value}<small>%</small></div>
  <div className="scorePreviewDetail">答對 {record.correct} / {record.total} 題</div>
  <div className="scorePreviewDate">{scoreDate(record.date)}</div>
 </div>;
}
function QuizHistory({history,onShare,onDownload,onPractice}){
 const entries=[...history].filter(r=>r&&r.total>0).sort((a,b)=>b.date-a.date);
 const all=entries.length;
 const personalBest=all?Math.max(...entries.map(x=>scorePercent(x))):0;
 return <div className="quizHistory">
  <div className="historyOverview"><div><span>完成回合</span><strong>{all}<small> 回</small></strong></div><div><span>最高正確率</span><strong>{personalBest}<small> %</small></strong></div></div>
  {!all?<div className="historyEmpty"><Trophy size={37}/><h3>第一張成績卡，等你來挑戰！</h3><p>測驗完成後會自動保存日期、分數與程度，可以隨時回來分享。</p><button className="primary" onClick={onPractice}>開始第一回合 →</button></div>:
   <><div className="historyCaption"><h3>歷史成績</h3><span>僅儲存於這台裝置</span></div>
   <div className="historyList">{entries.map(record=><div className="historyEntry" key={record.id}>
    <div className="historyEntryTop"><span className="historyLevel">{record.level}・{record.mode==='review'?'錯題複習':'隨機測驗'}</span><span className="historyTime">{scoreDate(record.date)}</span></div>
    <div className="historyEntryMiddle"><div><strong>{scorePercent(record)}%</strong><small>{record.correct} / {record.total} 題正確</small></div><div className="historyBadge">{scorePercent(record)===100?'完美過關':'繼續加油'}</div></div>
    <div className="historyProgress"><span style={{width:scorePercent(record)+'%'}}/></div>
    <div className="historyActions"><button onClick={()=>onShare(record)}><Share2 size={16}/> 分享成績</button><button onClick={()=>onDownload(record)}><Download size={16}/> 儲存圖片</button></div>
   </div>)}</div></>}
 </div>;
}
function WordFlashCard({word,position,total,reveal,setReveal,onPlay,onNext,onPrev}){
 if(!word)return null;
 return <div className="vocabFlash">
  <div className="cardCount">單字 {position+1} / {total}</div>
  <div className="wordJP">{word.jp}</div>
  {reveal?<div className="wordReveal"><div className="phonetic">{word.kana}</div><h3>{word.zh}</h3>{word.example&&<div className="example"><p>{word.example}</p><small>{word.meaning}</small></div>}</div>:<p className="wordHidden">你知道這個單字是什麼意思嗎？</p>}
  <button className="outlineButton" onClick={()=>onPlay(word.jp)}>▶ 聆聽單字</button>
  <button className="primary revealButton" onClick={()=>setReveal(x=>!x)}>{reveal?'收起答案':'顯示讀音與意思'}</button>
  <div className="centerNav"><button onClick={onPrev}>← 上一張</button><button onClick={onNext}>下一張 →</button></div>
 </div>;
}
export default App;
