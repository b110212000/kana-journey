import React, {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {hira,kata,romaji,words} from './data';
import './style.css';

const storageKey='kana-journey-v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{return {}}};
function speak(text){
  if(!('speechSynthesis' in window)) {alert('此瀏覽器不支援語音播放');return}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.8;
  const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('ja'));
  if(voice)u.voice=voice;
  speechSynthesis.speak(u);
}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
const all=[...hira.map((char,i)=>({id:'h'+i,char,read:romaji[i],type:'平假名'})),...kata.map((char,i)=>({id:'k'+i,char,read:romaji[i],type:'片假名'}))];
function App(){
 const [db,setDb]=useState(read),[tab,setTab]=useState('home'),[script,setScript]=useState('平假名'),[row,setRow]=useState(0),[flip,setFlip]=useState(false),[q,setQ]=useState(null),[picked,setPicked]=useState(null),[mode,setMode]=useState('kana'),[direction,setDirection]=useState('jp'),[category,setCategory]=useState('全部');
 useEffect(()=>localStorage.setItem(storageKey,JSON.stringify(db)),[db]);
 const stats=db.stats||{},learned=db.learned||{},wrong=db.wrong||{};
 const pool=all.filter(x=>x.type===script);
 const ranges=[[0,5],[5,10],[10,15],[15,20],[20,25],[25,30],[30,35],[35,38],[38,43],[43,46]];
 const rowNames=['あ行','か行','さ行','た行','な行','は行','ま行','や行','ら行','わ行'];
 const lesson=pool.slice(...ranges[row]);
 const mastered=all.filter(x=>(learned[x.id]||0)>=2).length;
 const completed=all.filter(x=>(learned[x.id]||0)>0).length;
 const attempt=(id,good)=>{
   setDb(d=>({...d,stats:{total:(d.stats?.total||0)+1,correct:(d.stats?.correct||0)+(good?1:0)},learned:{...d.learned,[id]:Math.max(0,(d.learned?.[id]||0)+(good?1:-1))},wrong:{...d.wrong,[id]:Math.max(0,(d.wrong?.[id]||0)+(good?-1:2))}}));
 };
 function nextQuestion(testMode=mode,dir=direction){
   const bank=testMode==='word'?words.map((w,i)=>({id:'w'+i,char:w.jp,read:w.zh,spoken:w.jp})):all.map(x=>({...x,spoken:x.char}));
   let source=bank;
   const wrongItems=bank.filter(x=>(wrong[x.id]||0)>0);
   if(wrongItems.length && Math.random()<.5) source=wrongItems;
   const target=source[Math.floor(Math.random()*source.length)];
   const answer=dir==='jp'?target.read:target.char;
   const distract=shuffle([...new Set(bank.filter(x=>x.id!==target.id).map(x=>dir==='jp'?x.read:x.char).filter(x=>x!==answer))]).slice(0,3);
   setQ({target,answer,choices:shuffle([answer,...distract]),dir});setPicked(null);
 }
 const go=t=>{setTab(t);setQ(null);setPicked(null)};
 return <div className="shell">
 <aside><div className="brand"><span className="brandIcon">あ</span><div><strong>Kana Journey</strong><small>從五十音開始，天天進步</small></div></div>
 <nav>{[['home','⌂','今日首頁'],['learn','あ','假名學習'],['words','本','生活單字'],['quiz','✓','隨堂測驗'],['review','↻','錯題複習']].map(([id,icon,name])=><button key={id} className={tab===id?'active':''} onClick={()=>go(id)}><span>{icon}</span>{name}</button>)}</nav>
 <div className="sideFoot">每日 30 分鐘 · 在本機保存進度</div></aside>
 <main><header><div><div className="eyebrow">JAPANESE LEARNING APP</div><h1>{({home:'今日的日文旅程',learn:'五十音學習',words:'生活單字',quiz:'練習測驗',review:'錯題複習'})[tab]}</h1></div><div className="avatar">日本語 <span>✦</span></div></header>
 {tab==='home'&&<div className="stack"><section className="hero"><div><div className="eyebrow light">每天練習 30 分鐘</div><h2>從「あ」開始，<br/>把日文變成日常。</h2><p>先認識五十音，再累積單字、加強記憶。今天也往前進一步！</p><button className="primary lightButton" onClick={()=>go('learn')}>開始今天的學習 →</button></div><div className="heroKana">あ<span>ア</span></div></section>
 <div className="stats"><div><span>已學習假名</span><strong>{completed}<small> / 92</small></strong></div><div><span>熟練假名</span><strong>{mastered}<small> / 92</small></strong></div><div><span>答題正確率</span><strong>{stats.total?Math.round(stats.correct/stats.total*100):0}<small>%</small></strong></div></div>
 <h2 className="sectionTitle">今天想練什麼？</h2><div className="actionGrid">{[['learn','あ','五十音學習','從字形、發音開始'],['words','本','日常單字','認識常見的生活詞彙'],['quiz','?','挑戰測驗','雙向測驗提升熟練度'],['review','↻','複習錯題','集中練習不熟悉的字']].map(([id,icon,title,sub])=><button className="action" key={id} onClick={()=>go(id)}><b>{icon}</b><strong>{title}</strong><small>{sub}</small><span>→</span></button>)}</div></div>}
 {tab==='learn'&&<div className="stack"><div className="toolbar"><div className="seg">{['平假名','片假名'].map(x=><button key={x} className={script===x?'selected':''} onClick={()=>{setScript(x);setFlip(false)}}>{x}</button>)}</div><span className="hint">先認字，點播放跟著讀</span></div>
 <div className="lessonGrid"><section className="panel"><h2>選擇學習行</h2><div className="rowButtons">{rowNames.map((x,i)=><button key={x} className={row===i?'chosen':''} onClick={()=>{setRow(i);setFlip(false)}}>{x}</button>)}</div><p className="hint">建議一天學一行，搭配舊字複習。</p><div className="miniTable">{pool.map(x=><button title={x.read} key={x.id} onClick={()=>{setRow(ranges.findIndex(([s,e])=>pool.slice(s,e).some(z=>z.id===x.id)));setFlip(false);speak(x.char)}} className={(learned[x.id]||0)>=2?'mastered':''}>{x.char}</button>)}</div></section>
 <section className="panel study"><div className="panelHeading"><h2>{script} · {rowNames[row]}</h2><span>{lesson.length} 字</span></div><div className="kanaCards">{lesson.map(x=><button key={x.id} className="kanaCard" onClick={()=>speak(x.char)}><span>{x.char}</span><strong>{x.read}</strong><small>▶ 播放</small></button>)}</div><div className="tip">小提示：先聽發音，唸出聲音，再遮住羅馬拼音回想。</div><button className="primary" onClick={()=>{setMode('kana');setDirection('jp');go('quiz')}}>前往五十音測驗 →</button></section></div></div>}
 {tab==='words'&&<div className="stack"><div className="toolbar"><div className="filters">{['全部',...new Set(words.map(x=>x.category))].map(x=><button key={x} className={category===x?'chosen':''} onClick={()=>setCategory(x)}>{x}</button>)}</div></div>
 <div className="wordGrid">{words.filter(x=>category==='全部'||x.category===category).map((w,i)=><button className="wordCard" key={i} onClick={()=>speak(w.jp)}><div><span className="pill">{w.category}</span><span className="play">▶</span></div><strong>{w.jp}</strong><span className="reading">{w.reading}</span><b>{w.zh}</b></button>)}</div><button className="primary" onClick={()=>{setMode('word');setDirection('jp');go('quiz')}}>開始單字測驗 →</button></div>}
 {tab==='quiz'&&<div className="stack"><div className="toolbar"><div className="seg">{[['kana','五十音'],['word','單字']].map(([v,n])=><button className={mode===v?'selected':''} key={v} onClick={()=>{setMode(v);setQ(null)}}>{n}</button>)}</div><div className="seg">{[['jp','日文 → 意思／發音'],['reverse','反向辨認']].map(([v,n])=><button className={direction===v?'selected':''} key={v} onClick={()=>{setDirection(v);setQ(null)}}>{n}</button>)}</div></div>
 {!q?<section className="panel quizIntro"><div className="bigIcon">✦</div><h2>準備好挑戰了嗎？</h2><p>答對會提升熟練度，答錯的題目會在複習中增加出現機率。</p><button className="primary" onClick={()=>nextQuestion()}>開始出題 →</button></section>:<section className="panel quizBox"><div className="eyebrow">選出正確答案</div><div className="question">{q.dir==='jp'?q.target.char:q.target.read}</div><button className="voiceBtn" onClick={()=>speak(q.target.spoken)}>▶ 聽日文發音</button><div className="choices">{q.choices.map((option,i)=><button key={i} disabled={picked!==null} className={picked!==null?(option===q.answer?'correct':option===picked?'incorrect':''):''} onClick={()=>{setPicked(option);attempt(q.target.id,option===q.answer)}}>{option}</button>)}</div>{picked!==null&&<div className="feedback"><strong>{picked===q.answer?'答對了！':'再練習一下！'}</strong><span>正確答案：{q.answer}</span><button className="primary" onClick={()=>nextQuestion()}>下一題 →</button></div>}</section>}
 </div>}
 {tab==='review'&&<div className="stack"><section className="panel"><h2>需要加強的五十音</h2><p className="hint">每次答錯都會提高複習權重，答對後會逐漸降低。</p><div className="reviewGrid">{all.filter(x=>(wrong[x.id]||0)>0).sort((a,b)=>(wrong[b.id]||0)-(wrong[a.id]||0)).map(x=><button onClick={()=>speak(x.char)} key={x.id}><strong>{x.char}</strong><span>{x.read}</span><small>待複習 {wrong[x.id]}</small></button>)}</div>{!all.some(x=>(wrong[x.id]||0)>0)&&<p className="empty">目前沒有五十音錯題。完成幾回測驗後，這裡會顯示需要加強的字。</p>}<button className="primary" onClick={()=>{setMode('kana');setDirection('jp');go('quiz')}}>開始複習測驗 →</button></section></div>}
 <footer>✦ Kana Journey v1.0.0 · 學習進度儲存在此裝置的瀏覽器中</footer></main></div>
}
createRoot(document.getElementById('root')).render(<App/>);
