import {gradedWords} from './vocabulary.js';

// 題幹以台灣讀者習慣的繁體中文撰寫；題目 ID 維持穩定，沿用既有錯題紀錄。
export function generateVocabularyQuestions(level) {
  const items = gradedWords.filter(word => word.level === level);
  return items.flatMap((word,index)=>{
    const otherWords=items.filter((_,i)=>i!==index);
    const offset=index % otherWords.length;
    const distractors=[0,5,13].map(delta=>otherWords[(offset+delta)%otherWords.length]);
    const name=level+'-vocab-'+(index+1);
    const note='「'+word.jp+'」讀作「'+word.kana+'」，中文意思是「'+word.zh+'」。';
    const example=word.example?'例句：'+word.example+'（'+word.meaning+'）':'';
    return [
      {id:name+'-meaning',type:'單字',
       prompt:'日文「'+word.jp+'」（'+word.kana+'）是什麼意思？',
       spoken:word.jp,answer:word.zh,options:[word.zh,...distractors.map(w=>w.zh)],
       explain:note+example},
      {id:name+'-japanese',type:'單字',
       prompt:'想表達「'+word.zh+'」，應該選哪個日文單字？',
       spoken:word.jp,answer:word.jp,options:[word.jp,...distractors.map(w=>w.jp)],
       explain:note+example}
    ];
  });
}
