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

## 五十音發音（v1.0.1）

- 46 個基本假名（平假名、片假名共用讀音）改為預先錄製的日語假名音檔，降低單字元 TTS 把「へ」當助詞而唸成 e 的問題。
- 錄音來源：[Wikimedia Commons：Hakatanoshio117117 的平假名發音集](https://commons.wikimedia.org/wiki/Category:Audio_files_of_hiragana_(set_by_Hakatanoshio117117))，該作者將所採用之錄音釋出至公有領域（Public Domain）。單獨部分音檔對應 Ja-*.oga，詳見 [Ja-Ka.oga](https://commons.wikimedia.org/wiki/File:Ja-Ka.oga) 等。
- 音檔使用 Wikimedia Commons 的 MP3 轉碼連結，播放需要網路連線，且受第三方服務可用性影響。普通假名錄音失敗時才用瀏覽器 TTS；對容易誤讀的「は、へ、を、ん」，失敗時提示重試，不播放可能錯誤的 TTS。
- 單字與完整句子仍使用 SpeechSynthesis 依上下文朗讀。不同裝置的語音效果可能不同，真人音檔與整句 TTS 不會完全一致。
- 讀音提醒：「へ」獨立 he / 助詞 e；「は」獨立 ha / 助詞 wa；「を」現代標準語一般讀 o（羅馬拼音常寫 wo）。
