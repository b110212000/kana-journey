# YOMIO v1.5.0

以手機優先的日文學習網頁 App：一次學一小組五十音、一次練一張單字卡、一次回答一道測驗。透過 GitHub Pages 發佈，無後端及 AI Token。

## 功能
- **初階、N5、N4、N3、N2、N1** 六種程度選擇。
- 初階：平假名 46 個、片假名 46 個。依照傳統行別分組（5 個字為一組；や行和わ行為 3 個字），畫面只顯示目前學習的一行。
- 五十音提供獨立的公有領域錄音，另提供對應日文例詞發音比較（例：へ → へや）。外部錄音品質依來源，例詞與整句使用系統 SpeechSynthesis 語音引擎；無法保證所有裝置發音品質相同。
- 單字卡：初階 30 個生活單字；N5～N1 各 8 個示範單字，共 40 個分級單字，含例句和翻譯。
- 題庫：初階自動生成雙向假名和單字選擇題；N5～N1 各 12 題、共 60 題原創選擇題，含單字、文法、讀解及答題解析。
- 練習：每回最多 10 題，**每次重新隨機排序題目和選項**；可以選題型、重練錯題。
- 學習紀錄保存在目前瀏覽器 localStorage（沿用 `kana-journey-v1` key），不同裝置不會同步。
- 手機採底部五分頁導覽（首頁、學習、單字、測驗、設定），減少不必要的長頁面。

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

## iPhone App 介面（v1.2.0）
- 新增獨立的 YOMIO App 圖示（SVG 原始檔），透過 `sharp` 自動產生 iPhone `apple-touch-icon.png`、192 / 512px PWA 圖示及小圖示。
- `public/manifest.webmanifest` 設定 standalone PWA、名稱、啟動畫面與圖示。
- 手機標題列固定於內容區頂部，捲動僅發生在內容區，不影響底部分頁。
- 使用 `viewport-fit=cover` 和 `env(safe-area-inset-top/bottom)`，適配 iPhone 動態島、瀏海及 Home Indicator。
- 目前程度移至「設定」調整，首頁只顯示摘要；版號僅在「設定 → 關於 App」呈現。
- 深色／淺色顯示模式可在「設定」切換，偏好保存在本機瀏覽器，切換立即生效。
- iPhone 安裝：用 **Safari** 開啟正式網址 → 分享 → 加入主畫面。如已經加入舊的圖示，iOS 有時會快取，可能需要移除舊的主畫面捷徑再重新加入。

圖示來源檔：`public/icon.svg`。輸出 PNG 在 `npm run build` 期間由 `scripts/generate-icons.mjs` 產生。
目前未新增 Service Worker，iPhone 可以加入主畫面並以獨立模式開啟，但不保證離線使用。


## 品牌更新（v1.3.0）
- 品牌名稱由 Kana Journey 更新為 **YOMIO**；目前仍使用原 GitHub 專案 `b110212000/kana-journey` 和原網址，以避免 GitHub Pages 路徑變動。
- 以已確定的「書頁／葉片＋晨光」視覺概念建立可縮放 SVG：`public/icon.svg`（App 圖示）、`public/brand.svg`（品牌字標組合）。
- GitHub Actions 建置時，以 `sharp` 從 SVG 重新產生 iPhone 的 `apple-touch-icon.png`、192 / 512px PWA 圖示。
- 網頁標題、Apple standalone App 名稱、PWA manifest 與品牌文案統一為 YOMIO；保留 manifest 的 `id` / `scope` / `start_url`，避免既有安裝入口失效。
- 主題色統一為 Logo 的深綠、薄荷綠與暖黃色；兩種配色模式均適用，並沿用 iPhone 動態島及底部 Home Indicator 的安全區域。
- **學習資料相容**：沿用 `kana-journey-v1` localStorage key，保留既有進度與設定，沒有重設資料。
- iPhone 若仍看到舊主畫面圖示，請在 Safari 開啟最新網址後再次「加入主畫面」，必要時先移除舊捷徑。移除 PWA 前請注意學習紀錄只儲存在此裝置，尚未有雲端同步。
- 目前主要是 PWA / 加入主畫面版本，**不是**上架 App Store 的原生 iOS App。


## v1.4.0：固定標題列、測驗紀錄與分享

- **真正固定的頂部標題**：將 `header.appTop` 移出唯一的 `div.contentScroll` 捲動容器，避免 iPhone Safari 捲動內容時標題上下位移；維持 iOS safe-area 與底部五分頁導覽。
- **歷史紀錄**：每次測驗完成並按下「查看結果」後，記錄完成時間、程度、分數、正確率、一般測驗或錯題複習。所有紀錄存在原本的 `kana-journey-v1` localStorage 項目 `quizHistory`，最多保存最近 200 回合。同一回合透過唯一 ID 防止重複儲存。
- **紀錄入口**：「測驗 → 測驗紀錄」，首頁完成一次後也會顯示「我的測驗紀錄」捷徑，可查看歷史日期與成績。
- **分享成績**：完成頁和歷史紀錄均有「分享成績」；支援 iPhone Safari `navigator.share` 的原生分享選單、附帶原創 YOMIO 成績圖片，適合傳給 LINE 或訊息。若瀏覽器不支援圖片分享，改以文字和網站連結分享；原生分享不可用時，複製文字或下載圖片。
- **儲存成績卡**：使用 Canvas 在裝置端即時繪製 4:5 圖卡（品牌圖案、級別、答對題數、正確率、日期、網址），不需要後端、帳號或付費 API。
- **資料隱私**：歷史紀錄預設只有本機能看見；只有使用者主動點選分享後，才由裝置的分享功能將所選成績傳出。
- **限制**：沒有帳號、雲端同步或跨裝置排行榜。若清除站點資料或刪除已安裝的 PWA，仍可能失去本機紀錄。

注意：只有完整完成一回合才會新增紀錄；舊版本只存答題總數／錯題，無法反推舊回合的成績，因此 v1.4.0 上線前的回合不會自動出現在歷史列表中。

## v1.5.0：設定頁分享與安裝 YOMIO（Issue #1）

- **分享 App**：設定 → 分享 YOMIO →「分享 App」，在 iPhone Safari / 支援 Web Share API 的瀏覽器開啟原生分享選單，可直接傳到 LINE、訊息等 App；使用者取消分享時不視為錯誤。不支援原生分享則自動複製網址。
- **一鍵複製連結**：設定 →「複製連結」或「複製安裝連結」，會複製目前 GitHub Pages 公開網址。使用 Clipboard API，必要時退回選取複製，並回報操作結果。
- **iPhone 安裝說明**：Safari → 分享 → 加入主畫面 → 加入。iPhone Safari 不允許網頁直接強制安裝，必須由使用者操作。
- **Android 安裝說明**：Chrome → 選單 → 安裝應用程式或加到主畫面；若裝置提供 `beforeinstallprompt`，另顯示直接開啟安裝提示的按鈕。
- **已安裝狀態**：以 PWA standalone 模式開啟時顯示已從主畫面使用的提示，不重複引導安裝。
- **相容性**：維持原網址、`localStorage` 學習紀錄、程度設定、Light / Dark Mode、iPhone Safe Area，以及底部分頁。分享與複製均為使用者主動觸發，不使用後端或付費服務。
- GitHub 追蹤：[#1](https://github.com/b110212000/kana-journey/issues/1)
