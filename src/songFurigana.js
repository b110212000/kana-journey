let enginePromise;
export async function getFuriganaEngine() {
  if (!enginePromise) {
    enginePromise = Promise.all([
      import('kuroshiro'), import('kuroshiro-analyzer-kuromoji')
    ]).then(async ([kuroshiroMod, analyzerMod]) => {
      const Kuroshiro = kuroshiroMod.default;
      const KuromojiAnalyzer = analyzerMod.default;
      const engine = new Kuroshiro();
      await engine.init(new KuromojiAnalyzer({dictPath: import.meta.env.BASE_URL + 'dict/'}));
      return engine;
    }).catch(error => {enginePromise = undefined; throw error;});
  }
  return enginePromise;
}
export async function annotateLine(engine, line) {
  return engine.convert(line, {to: 'hiragana', mode: 'furigana'});
}
