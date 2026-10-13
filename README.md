# YOMIO v1.7.0

以手機優先的日文學習網頁 App：一次學一小組五十音、一次練一張單字卡、一次回答一道測驗。透過 GitHub Pages 發佈，無後端及 AI Token。

## 功能
- **初階、N5、N4、N3、N2、N1** 六種程度選擇。
- 初階：平假名 46 個、片假名 46 個。依照傳統行別分組（5 個字為一組；や行和わ行為 3 個字），畫面只顯示目前學習的一行。
- 五十音提供獨立的公有領域錄音，另提供對應日文例詞發音比較（例：へ → へや）。外部錄音品質依來源，例詞與整句使用系統 SpeechSynthesis 語音引擎；無法保證所有裝置發音品質相同。
- 單字卡：初階 30 個生活單字；N5～N1 各 **40 個分級單字，共 200 個**，均提供假名、中文釋義、例句與翻譯。
- 題庫：初階自動生成雙向假名和單字選擇題；N5～N1 各 **104 題、合計 520 題**（每級 80 題雙向單字練習 + 24 題既有與新增文法／讀解／單字題），含四選一及解析。
- 練習：每回最多 10 題，**優先抽未做過的題，已用完才進入新一輪**；每次重新隨機排序題目和選項、可選題型與重練錯題，並顯示每級題量及題型分布。
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

## v1.5.1：全域頂部 Toast 通知（Issue #2）

- 操作成功／錯誤提示改用 `ToastProvider` + `useToast`：所有頁面共用，不在按鈕下方新增通知區塊。
- Toast 固定於整個 App 上層，`top: calc(env(safe-area-inset-top, 0px) + 18px)`（行動版），避開 iPhone 動態島／瀏海，與中間內容捲動無關。
- 顯示約 **3000ms** 後自動消失；連續觸發新通知時重新計時，舊計時器會清除。
- Light / Dark Mode 都使用相同的設計變數，成功與錯誤採不同圖示及顏色；提供 `aria-live` 語意與減少動畫設定。
- 設定頁「分享 App」「複製連結」「複製安裝連結」「安裝 App」的操作結果都採 Toast；取消原生分享不會誤報成功。
- 測驗完成後儲存成績、分享／複製成績、儲存成績圖片使用相同 Toast，移除舊的 `shareStatus` 底部提示。
- 測驗答題正誤解析、目前音檔播放狀態等屬於學習內容，不會被 3 秒 Toast 取代，以免影響閱讀。
- GitHub 追蹤：[#2](https://github.com/b110212000/kana-journey/issues/2)

## v1.6.0：收合式設定與版本更新（Issue #3）

- **簡潔設定首頁**：設定項目改為「學習程度／顯示模式／分享與安裝／版本更新／關於 YOMIO」五列。平常全部收起；點擊展開需要的項目，再點一次收起或選其他列。一次最多只展開一組。
- **保留功能**：程度選擇、Light / Dark Mode、分享 App、複製網址、加入主畫面、Toast 提示與本機學習紀錄沿用原有實作。
- **版本資訊自動生成**：`npm run build` 讀取 `package.json.version` 並輸出 `dist/version.json`，由 GitHub Actions 檢查內容與 package 一致後再部署。React 本身也從同一 package 讀取目前執行版本。
- **發現更新**：App 初次開啟、重新回前景、網路恢復、以及每 10 分鐘，向 GitHub Pages 請求帶時間戳與 `cache: 'no-store'` 的 `version.json`。以三段式版本號比較，只有伺服器已發布版本大於 App 內版本才認定為新版。
- **更新紅點**：偵測到新版本時，底部分頁「設定」及非設定頁右上設定圖示顯示紅點，版本更新列也顯示「有更新」。
- **立即更新**：「設定 → 版本更新 → 立即更新」以 cache-busting URL 重新載入 GitHub Pages 最新程式，不刪除原本的 localStorage。若已是最新版則顯示「檢查更新」，失敗／離線會提示，不會宣稱更新成功。
- **無後端**：是網站 PWA 程式更新（不是 App Store 更新）。沒有 Service Worker，因此仍受 GitHub Pages 發布與 iOS 網頁快取影響；版本資訊可能需要一小段時間才會與實際發布一致。
- **首版限制**：舊版 v1.5.1 尚未具備更新偵測功能，因此**紅點從 v1.6.0 安裝後的未來版本更新才會開始生效**。打開 v1.6.0 本身不應顯示更新紅點。
- [GitHub Issue #3](https://github.com/b110212000/kana-journey/issues/3)


## v1.7.0：擴充單字與題庫（Issue #4）

- **新增 160 個分級單字**：N5～N1 各新增 32 張、每級達 40 張（總 200 張），內容包含日文、假名、繁中翻譯、短句與句子翻譯；單字卡可前後瀏覽。
- **新增 460 題原創選擇題**：現有 60 題保留原題號，新增加每級 40 詞 × 2 種練習方向（共 400 題），另加入每級 7 題文法和 5 題讀解（共 60 題），因此 N5～N1 題庫合計 **520 題／每級 104 題**。
- **減少跨回合重複**：每個程度／題型的完成題目 ID 儲存於原 `kana-journey-v1` localStorage 的 `quizSeen`，新回合優先從未練過的題目抽取，走完整套後才會重新循環；錯題複習維持獨立入口。若單一題型只剩少量未做過的題，剩餘名額可能以舊題補足。
- **抽題畫面顯示題量**：顯示此程度的題庫總數與「單字／文法／讀解」分布。
- **資料品質檢查**：新增 `npm run test:bank` 驗證分級單字數量、詞義唯一性、題號唯一性、題型、選項數量與去重、答案是否位於選項及抽題輪替；由 `npm run build` 先執行，避免錯誤題庫部署。
- **維持原資料**：既有 `quizHistory`、`wrong`、統計與設定沿用。保留舊 60 題 ID，錯題紀錄不會因本版升級而消失。
- **性質聲明**：題目與例句為本專案原創練習內容，程度分類屬教學近似安排，不是 JLPT 官方指定單字表或官方考古題，未經官方認證。
- [Issue #4](https://github.com/b110212000/kana-journey/issues/4)
