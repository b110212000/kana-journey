# Kana Journey v1.1.0

以手機優先的日文學習網頁 App：一次學一小組五十音、一次練一張單字卡、一次回答一道測驗。透過 GitHub Pages 發佈，無後端及 AI Token。

## 功能
- **初階、N5、N4、N3、N2、N1** 六種程度選擇。
- 初階：平假名 46 個、片假名 46 個。依照傳統行別分組（5 個字為一組；や行和わ行為 3 個字），畫面只顯示目前學習的一行。
- 五十音提供獨立的公有領域錄音，另提供對應日文例詞發音比較（例：へ → へや）。外部錄音品質依來源，例詞與整句使用系統 SpeechSynthesis 語音引擎；無法保證所有裝置發音品質相同。
- 單字卡：初階 30 個生活單字；N5～N1 各 8 個示範單字，共 40 個分級單字，含例句和翻譯。
- 題庫：初階自動生成雙向假名和單字選擇題；N5～N1 各 12 題、共 60 題原創選擇題，含單字、文法、讀解及答題解析。
- 練習：每回最多 10 題，**每次重新隨機排序題目和選項**；可以選題型、重練錯題。
- 學習紀錄保存在目前瀏覽器 localStorage（沿用 `kana-journey-v1` key），不同裝置不會同步。
- 手機採底部四分頁導覽，減少不必要的長頁面。

## 本機開發

```bash
npm install
npm run dev
```

## GitHub Pages

在 **Settings → Pages → Build and deployment** 選擇 **GitHub Actions**。
推送至 `main` 後，`.github/workflows/deploy.yml` 會自動建置並發佈。

https://b110212000.github.io/kana-journey/

## JLPT 題目來源與授權

本專案的 **N5～N1 題目為原創題目，不是官方歷屆試題**。題型與程度安排參考 JLPT 官方公佈的測驗構成：
- [官方試題集（繁體中文）](https://www.jlpt.jp/tw/samples/sampleindex.html)
- [官方網站著作權與使用政策](https://www.jlpt.jp/e/policy.html)

官方試題、閱讀文章與聽力音檔可能涉及第三方著作權，因此不直接爬取後複製到公開 App。題庫是初版示範，可持續擴充，不代表 JLPT 正式考試的全部範圍或通過保證。

## 發音資料

五十音音檔來源：Wikimedia Commons 上由 Hakatanoshio117117 釋出的日文假名錄音（Public Domain），例如 [Japanese he.ogg](https://commons.wikimedia.org/wiki/File:Japanese_he.ogg)。以 Wikimedia 提供的 MP3 轉碼透過網路播放，具快取、預載及弱音量空白裁切。單字、例詞及句子使用裝置本身的日文 TTS。若來源錄音發音不理想，應進一步更換成經日語母語者確認、且授權清楚的音檔。

## 版本規則

新增功能提升次版本；介面微調及 Bug 修復提升修訂版本。
