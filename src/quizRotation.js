// Shuffle a copy so stored bank data never changes.
function shuffled(list) {
  const out=[...list];
  for(let i=out.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}

// First use every unseen question in the selected level/type before reusing
// previously answered ones. In tiny pools fallback to previously seen questions.
export function pickQuiz(pool, seen=[],max=10) {
  const validIds=new Set(pool.map(q=>q.id));
  const remembered=new Set(seen.filter(id=>validIds.has(id)));
  const unseen=shuffled(pool.filter(q=>!remembered.has(q.id)));
  const used=shuffled(pool.filter(q=>remembered.has(q.id)));
  return [...unseen,...used].slice(0,Math.max(0,max));
}

export function recordQuizSeen(previous=[],poolIds=[],answeredIds=[]) {
  const eligible=new Set(poolIds);
  const seen=[...new Set(previous.filter(id=>eligible.has(id)))];
  // A completed pass means the next quiz begins a new cycle.
  const cycleComplete=eligible.size>0 && seen.length>=eligible.size;
  return [...new Set([...(cycleComplete?[]:seen),...answeredIds.filter(id=>eligible.has(id))])];
}
