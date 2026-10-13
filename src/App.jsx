import React, {useEffect, useMemo, useState} from 'react';
import {hira,kata,romaji,words} from './data';
import {levels,questionBank} from './questions';
import {gradedWords} from './vocabulary';
import {speak,preloadKana} from './audio';
import './app.css';

const VERSION='1.1.0';
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
const starterKana=[
 ...hira.map((char,i)=>({char,reading:romaji[i],key:'h-'+i})),
 ...kata.map((char,i)=>({char,reading:romaji[i],key:'k-'+i}))
];
function starterPool(){
 const kanaQuestions=starterKana.flatMap((k,i)=>[
  {id:'b-k-'+k.key,type:'假名',prompt:'「'+k.char+'」的讀音是哪一個？',spoken:k.char,answer:k.reading,
    options:options(k.reading,romaji),explain:k.char+' 的基本發音是 '+k.reading+'。'+(['へ','ヘ'].includes(k.char)?'作方向助詞時，へ 才讀 e。':'')},
  {id:'b-r-'+k.key,type:'假名',prompt:'哪個假名讀作「'+k.reading+'」？',spoken:k.char,answer:k.char,
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
 const [tab,setTab]=useState('home');
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
 const success=stats.total?Math.round((stats.correct||0)/stats.total*100):0;
 const studied=starterKana.filter(x=>(learned[(x.key.startsWith('h-')?'h':'k')+x.key.slice(1)]||0)>0).length;
 const filteredPool=useMemo(()=>getLevelPool(level),[level]);
 const topics=level==='初階'?['全部','假名','單字']:['全部','單字','文法','讀解'];
 const issue=paper[at];
 const progress=paper.length?Math.round(100*at/paper.length):0;
 const go=next=>{setTab(next);setAudioStatus('idle');setAudioNote(false)};
 const changeLevel=next=>{setLevel(next);setFocus('全部');setWordIndex(0);setPaper([]);setSessionDone(false);setPicked(null);setReviewMode(false)};
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
   }else if(withFocus!=='全部') all=all.filter(q=>q.type===withFocus);
   const quiz=shuffled(all).slice(0,10).map(q=>({...q,options:shuffled(q.options)}));
   setPaper(quiz);setAt(0);setPicked(null);setCorrectInRound(0);setReviewMode(wrongOnly);
   setSessionDone(false);go('quiz');
 }
 function answer(value){
   if(picked!==null)return;
   setPicked(value);
   const good=value===issue.answer;
   setCorrectInRound(n=>n+(good?1:0));record(good);
 }
 function next(){
   if(at+1>=paper.length){setSessionDone(true);setPicked(null)}
   else {setAt(x=>x+1);setPicked(null)}
 }
 function navButton(key,title,glyph){return <button key={key} aria-current={tab===key?'page':undefined} className={'navButton '+(tab===key?'current':'')} onClick={()=>go(key)}><span aria-hidden="true">{glyph}</span><span>{title}</span></button>}
 return <div className="app">
  <aside className="sidebar">
   <button className="logo" onClick={()=>go('home')}><span className="logoMark">あ</span><span><strong>Kana Journey</strong><small>我的日文學習旅程</small></span></button>
   <nav aria-label="主要選單">
    {navButton('home','首頁','⌂')}{navButton('learn','學習','あ')}{navButton('words','單字','本')}{navButton('quiz','測驗','✓')}
   </nav>
   <div className="sidebarFoot">每天 30 分鐘，持續一點點進步</div>
  </aside>
  <main className="content">
   <div className="appTop"><div><span className="smallOverline">JAPANESE LEARNING</span><h1>{({home:'今天也來學日文',learn:'五十音・課程',words:'單字練習',quiz:'隨機測驗'})[tab]}</h1></div><span className="version">v{VERSION}</span></div>
   {tab==='home'&&<section className="page">
    <div className="heroSimple"><div><span className="eyebrow">每日 30 分鐘</span><h2>一步一步，<br/>從五十音走向日常對話。</h2><p>一次學一小組、一次練一個主題。</p></div><span className="heroSymbol">あ</span></div>
    <div className="sectionHeading"><div><h2>選擇目前程度</h2><p>初學者從「初階」開始，不需要直接挑戰 N5。</p></div></div>
    <div className="levels" role="group" aria-label="學習程度">{levels.map(v=><button key={v.id} className={level===v.id?'on':''} onClick={()=>changeLevel(v.id)}>{v.id}</button>)}</div>
    <div className="levelSummary"><div><strong>{level}・{levels.find(x=>x.id===level)?.subtitle}</strong><p>{levels.find(x=>x.id===level)?.description}</p></div><span className="dotBadge">目前階段</span></div>
    <div className="actionPair"><button className="routeCard" onClick={()=>go('learn')}><span className="routeIcon">あ</span><strong>{level==='初階'?'學習五十音':'本級重點單字'}</strong><span>循序學習・每次一小組</span><b>開始學習 →</b></button><button className="routeCard" onClick={()=>beginQuizFromHome()}><span className="routeIcon warm">✓</span><strong>今天的 10 題練習</strong><span>題目和選項隨機排列</span><b>開始測驗 →</b></button></div>
    <div className="miniStats"><span>已作答 <strong>{stats.total||0}</strong> 題</span><span>正確率 <strong>{success}%</strong></span><span>待複習 <strong>{Object.values(wrong).filter(n=>n>0).length}</strong> 題</span></div>
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
     {['へ','ヘ','は','ハ','を','ヲ','ん','ン'].includes(currentKana.char)&&<div className="soundTip">
      <strong>發音提醒</strong>
      <p>{['へ','ヘ'].includes(currentKana.char)?'「へ」作假名讀 he；作方向助詞時讀 e。': ['は','ハ'].includes(currentKana.char)?'「は」作假名讀 ha；作主題助詞時讀 wa。':['を','ヲ'].includes(currentKana.char)?'「を」現代標準語通常發 o 音（羅馬字也常寫 wo）。':'「ん」是鼻音，與前後發音環境有關。'}</p>
      {['へ','ヘ'].includes(currentKana.char)&&<button className="textButton" onClick={()=>play('へや')}>▶ 聽單字「へや」（房間）來比較</button>}
     </div>}
     <div className="centerNav"><button onClick={()=>{setCard(i=>(i-1+row.length)%row.length);setAudioStatus('idle')}}>← 上一個</button><button onClick={()=>{setCard(i=>(i+1)%row.length);setAudioStatus('idle')}}>下一個 →</button></div>
    </div></>}
   </section>}
   {tab==='words'&&<section className="page narrow"><div className="lessonTitle"><span className="eyebrow">{level}・單字卡</span><h2>少量多次，比一次背完有效</h2><p>先試著認讀，點開答案再看意思和例句。</p></div><WordFlashCard word={word} position={wordIndex} total={selectedWords.length} reveal={reveal} setReveal={setReveal} onPlay={play} onNext={()=>{setWordIndex(i=>(i+1)%selectedWords.length);setReveal(false)}} onPrev={()=>{setWordIndex(i=>(i-1+selectedWords.length)%selectedWords.length);setReveal(false)}}/><button className="secondaryWide" onClick={()=>go('quiz')}>使用 {level} 題庫測驗 →</button></section>}
   {tab==='quiz'&&<section className="page narrow"><div className="quizHeader">
    <div><span className="eyebrow">PRACTICE ・ {level}</span><h2>一題一題，專心思考</h2><p>單次最多 10 題，題目與選項都會重新隨機排列。</p></div>
   </div>
   {!paper.length?<div className="testSetup"><h3>準備開始 {level} 練習</h3><div className="chipGroup">{topics.map(type=><button key={type} className={focus===type?'active':''} onClick={()=>setFocus(type)}>{type}</button>)}</div><p className="muted">選擇題型，不想限制就選「全部」。</p><button className="primary" onClick={()=>begin(false)}>開始隨機測驗 →</button>
    <div className="testDivider"/><div className="retryBox"><span>錯題再練一次</span><strong>{filteredPool.filter(q=>(wrong[q.id]||0)>0).length} 題待複習</strong><button onClick={()=>begin(true)} disabled={!filteredPool.some(q=>(wrong[q.id]||0)>0)}>重練錯題</button></div></div>
   : sessionDone?<div className="resultCard"><span className="eyebrow">{reviewMode?'錯題練習':'本回合完成'}</span><div className="resultScore">{correctInRound} <small>/ {paper.length}</small></div><h3>{correctInRound===paper.length?'太棒了，全部答對！':'完成一回合，繼續進步！'}</h3><p>錯誤題目已加入複習記錄；下次可以單獨重練。</p><button className="primary" onClick={()=>begin(false)}>再來一回合 →</button><button className="bare" onClick={()=>{setPaper([]);setSessionDone(false)}}>調整題型</button></div>
   :<div className="testCard"><div className="quizMeta"><span>{at+1} / {paper.length} 題</span><span>{issue.type}</span></div><div className="progressBar"><div style={{width:progress+'%'}}/></div>
     <div className="question">{issue.prompt}</div>
     {issue.type==='假名'&&<button className="textButton" onClick={()=>play(issue.spoken)}>▶ 聽發音</button>}
     <div className="answers">{issue.options.map((opt,i)=><button key={i} className={picked===null?'':opt===issue.answer?'right':picked===opt?'wrong':''} disabled={picked!==null} onClick={()=>answer(opt)}><span className="answerLetter">{String.fromCharCode(65+i)}</span><span>{opt}</span></button>)}</div>
     {picked!==null&&<div className="explain"><strong>{picked===issue.answer?'✓ 答對了':'正確答案：'+issue.answer}</strong><p>{issue.explain}</p><button className="primary" onClick={next}>{at+1===paper.length?'查看結果':'下一題 →'}</button></div>}
     <button className="quitTest" onClick={()=>{setPaper([]);setPicked(null)}}>結束本回合</button>
    </div>}
   </section>}
   <footer>學習資料儲存於此裝置・題目為原創練習題，非 JLPT 官方歷屆試題・<a href="https://www.jlpt.jp/tw/samples/sampleindex.html" target="_blank" rel="noreferrer">官方樣題</a></footer>
  </main>
 </div>;

 function beginQuizFromHome(){setFocus('全部');begin(false,'全部')}
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
