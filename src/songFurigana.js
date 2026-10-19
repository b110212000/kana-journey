// The analyzer runs entirely on the user's device. It fetches only bundled dictionary files.
let enginePromise;
export async function getFuriganaEngine() {
  if (!enginePromise) {
    enginePromise = import('kuroshiro-browser')
      .then(async ({Kuroshiro}) => {
        if (!Kuroshiro?.buildAndInitWithKuromoji) {
          throw new Error('日文分析模組不完整。');
        }
        // The dictionary files are copied into Vite's public/dict directory at build time.
        // Passing true makes the browser bundle fetch ./dict/*.dat.br relative to
        // the deployed page, which works under GitHub Pages /kana-journey/.
        return Kuroshiro.buildAndInitWithKuromoji(true);
      })
      .catch(error => { enginePromise = undefined; throw error; });
  }
  return enginePromise;
}

export async function annotateLine(engine, line) {
  return engine.convert(line, {to:'hiragana', mode:'furigana'});
}
