import {gradedWords} from './vocabulary.js';

// Each word generates two complementary questions: reading Japanese -> meaning,
// and interpreting Chinese -> Japanese. IDs are stable so mistake history persists.
export function generateVocabularyQuestions(level) {
  const items = gradedWords.filter(word => word.level === level);
  return items.flatMap((word,index)=>{
    const otherWords=items.filter((_,i)=>i!==index);
    const offset=index % otherWords.length;
    // Deterministic, varied and unique wrong options. Shuffle only at quiz start.
    const distractors=[0,5,13].map(delta=>otherWords[(offset+delta)%otherWords.length]);
    const name=level+'-vocab-'+(index+1);
    return [
      {id:name+'-meaning',type:'單字',
       prompt:'「'+word.jp+'」（讀作 '+word.kana+'）的中文意思最接近哪一項？',
       spoken:word.jp,answer:word.zh,options:[word.zh,...distractors.map(w=>w.zh)],
       explain:word.jp+'（'+word.kana+'）＝'+word.zh+'。'+(word.example?'例：'+word.example+'（'+word.meaning+'）':'')},
      {id:name+'-japanese',type:'單字',
       prompt:'「'+word.zh+'」對應哪個日文詞彙？',
       spoken:word.jp,answer:word.jp,options:[word.jp,...distractors.map(w=>w.jp)],
       explain:'「'+word.zh+'」＝'+word.jp+'（'+word.kana+'）。'+(word.example?'例：'+word.example:'')}
    ];
  });
}
