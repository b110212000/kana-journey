# Kana Journey

零基礎日文學習網頁 App：五十音（平假名與片假名）、30 個日常單字、瀏覽器發音、雙向測驗、錯題複習與本機學習進度。

## 本機啟動

```bash
npm install
npm run dev
```

## GitHub Pages 部署

到 Settings → Pages，將 Build and deployment 的 Source 設定為 GitHub Actions。每次 push 至 main，工作流程將自動建置與發佈。

網址：https://b110212000.github.io/kana-journey/

進度存於目前瀏覽器 localStorage，暫不支援跨裝置同步。語音使用瀏覽器 SpeechSynthesis，音質依裝置而異。
