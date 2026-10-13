import assert from 'node:assert/strict';
import {gradedWords} from '../src/vocabulary.js';
import {questionBank} from '../src/questions.js';
import {pickQuiz,recordQuizSeen} from '../src/quizRotation.js';

const levels=['N5','N4','N3','N2','N1'];
let total=0;
for(const level of levels){
 const words=gradedWords.filter(word=>word.level===level);
 const questions=questionBank[level]||[];
 assert.equal(words.length,40,level+': expected exactly 40 vocabulary cards');
 assert.ok(questions.length>=100,level+': expected at least 100 questions');
 assert.equal(new Set(words.map(w=>w.jp)).size,words.length,level+': repeated Japanese word');
 assert.equal(new Set(words.map(w=>w.zh)).size,words.length,level+': duplicate Chinese meaning');
 const ids=new Set(),prompts=new Set();
 for(const question of questions){
   assert.ok(question.id&&question.prompt&&question.answer&&question.explain,level+' incomplete question');
   assert.ok(!ids.has(question.id),level+' duplicate ID '+question.id);
   ids.add(question.id);
   assert.ok(!prompts.has(question.prompt),level+' duplicate exact prompt '+question.prompt);
   prompts.add(question.prompt);
   assert.equal(question.options.length,4,question.id+' requires 4 choices');
   assert.equal(new Set(question.options).size,4,question.id+' duplicate choice');
   assert.ok(question.options.includes(question.answer),question.id+' does not contain correct answer');
   assert.ok(['單字','文法','讀解'].includes(question.type),question.id+' unknown type');
 }
 for(const type of ['單字','文法','讀解']){
   assert.ok(questions.filter(q=>q.type===type).length>=5,level+' not enough '+type);
 }
 const first=pickQuiz(questions,[],10),idsFirst=first.map(q=>q.id);
 assert.equal(new Set(idsFirst).size,10,level+' repeated question within round');
 const history=recordQuizSeen([],questions.map(q=>q.id),idsFirst);
 const second=pickQuiz(questions,history,10);
 assert.ok(second.every(q=>!history.includes(q.id)),level+' repeats old question before unseen exhausted');
 total+=questions.length;
 console.log(level+': '+words.length+' vocabulary cards / '+questions.length+' questions; types: '+
   ['單字','文法','讀解'].map(t=>t+' '+questions.filter(q=>q.type===t).length).join(', '));
}
console.log('Valid: '+total+' questions across N5–N1.');
