// 每個程度的練習用例句均為專案編寫，不使用官方試題內容。
import {expandedWords} from './vocabularyExpansion';

const baseWords = [
  {
    "level": "N5",
    "jp": "学生",
    "kana": "がくせい",
    "zh": "學生",
    "example": "私は学生です。",
    "meaning": "我是學生。"
  },
  {
    "level": "N5",
    "jp": "先生",
    "kana": "せんせい",
    "zh": "老師",
    "example": "先生に聞きます。",
    "meaning": "我問老師。"
  },
  {
    "level": "N5",
    "jp": "今日",
    "kana": "きょう",
    "zh": "今天",
    "example": "今日は暑いです。",
    "meaning": "今天很熱。"
  },
  {
    "level": "N5",
    "jp": "明日",
    "kana": "あした",
    "zh": "明天",
    "example": "明日、会いましょう。",
    "meaning": "明天見吧。"
  },
  {
    "level": "N5",
    "jp": "昨日",
    "kana": "きのう",
    "zh": "昨天",
    "example": "昨日は休みでした。",
    "meaning": "昨天休息。"
  },
  {
    "level": "N5",
    "jp": "水",
    "kana": "みず",
    "zh": "水",
    "example": "水をください。",
    "meaning": "請給我水。"
  },
  {
    "level": "N5",
    "jp": "友達",
    "kana": "ともだち",
    "zh": "朋友",
    "example": "友達と話します。",
    "meaning": "和朋友聊天。"
  },
  {
    "level": "N5",
    "jp": "食べる",
    "kana": "たべる",
    "zh": "吃",
    "example": "朝ご飯を食べます。",
    "meaning": "吃早餐。"
  },
  {
    "level": "N4",
    "jp": "約束",
    "kana": "やくそく",
    "zh": "約定",
    "example": "友達と約束しました。",
    "meaning": "和朋友約好了。"
  },
  {
    "level": "N4",
    "jp": "準備",
    "kana": "じゅんび",
    "zh": "準備",
    "example": "旅行の準備をします。",
    "meaning": "準備旅行。"
  },
  {
    "level": "N4",
    "jp": "遅れる",
    "kana": "おくれる",
    "zh": "遲到／延誤",
    "example": "電車が遅れました。",
    "meaning": "電車誤點了。"
  },
  {
    "level": "N4",
    "jp": "間に合う",
    "kana": "まにあう",
    "zh": "趕得上",
    "example": "会議に間に合いました。",
    "meaning": "趕上會議了。"
  },
  {
    "level": "N4",
    "jp": "別々",
    "kana": "べつべつ",
    "zh": "各自／分開",
    "example": "別々に払います。",
    "meaning": "各自付錢。"
  },
  {
    "level": "N4",
    "jp": "必要",
    "kana": "ひつよう",
    "zh": "必要",
    "example": "予約が必要です。",
    "meaning": "需要預約。"
  },
  {
    "level": "N4",
    "jp": "経験",
    "kana": "けいけん",
    "zh": "經驗",
    "example": "経験があります。",
    "meaning": "有經驗。"
  },
  {
    "level": "N4",
    "jp": "探す",
    "kana": "さがす",
    "zh": "尋找",
    "example": "鍵を探しています。",
    "meaning": "正在找鑰匙。"
  },
  {
    "level": "N3",
    "jp": "解決",
    "kana": "かいけつ",
    "zh": "解決",
    "example": "問題を解決します。",
    "meaning": "解決問題。"
  },
  {
    "level": "N3",
    "jp": "当然",
    "kana": "とうぜん",
    "zh": "理所當然",
    "example": "当然の結果です。",
    "meaning": "這是理所當然的結果。"
  },
  {
    "level": "N3",
    "jp": "影響",
    "kana": "えいきょう",
    "zh": "影響",
    "example": "天候の影響を受けます。",
    "meaning": "受到天氣影響。"
  },
  {
    "level": "N3",
    "jp": "確認",
    "kana": "かくにん",
    "zh": "確認",
    "example": "予定を確認します。",
    "meaning": "確認行程。"
  },
  {
    "level": "N3",
    "jp": "以来",
    "kana": "いらい",
    "zh": "自從……以來",
    "example": "卒業以来、会っていません。",
    "meaning": "畢業以來沒見過。"
  },
  {
    "level": "N3",
    "jp": "比較",
    "kana": "ひかく",
    "zh": "比較",
    "example": "二つを比較します。",
    "meaning": "比較兩者。"
  },
  {
    "level": "N3",
    "jp": "努力",
    "kana": "どりょく",
    "zh": "努力",
    "example": "毎日努力しています。",
    "meaning": "每天努力。"
  },
  {
    "level": "N3",
    "jp": "環境",
    "kana": "かんきょう",
    "zh": "環境",
    "example": "環境を守ります。",
    "meaning": "保護環境。"
  },
  {
    "level": "N2",
    "jp": "改善",
    "kana": "かいぜん",
    "zh": "改善",
    "example": "状況を改善します。",
    "meaning": "改善情況。"
  },
  {
    "level": "N2",
    "jp": "妥当",
    "kana": "だとう",
    "zh": "妥當合理",
    "example": "妥当な判断です。",
    "meaning": "是合理的判斷。"
  },
  {
    "level": "N2",
    "jp": "促進",
    "kana": "そくしん",
    "zh": "促進",
    "example": "交流を促進します。",
    "meaning": "促進交流。"
  },
  {
    "level": "N2",
    "jp": "検討",
    "kana": "けんとう",
    "zh": "評估／研討",
    "example": "案を検討します。",
    "meaning": "評估方案。"
  },
  {
    "level": "N2",
    "jp": "著しい",
    "kana": "いちじるしい",
    "zh": "顯著的",
    "example": "著しい変化です。",
    "meaning": "是顯著的變化。"
  },
  {
    "level": "N2",
    "jp": "及ぼす",
    "kana": "およぼす",
    "zh": "造成／帶來（影響）",
    "example": "影響を及ぼします。",
    "meaning": "造成影響。"
  },
  {
    "level": "N2",
    "jp": "可能性",
    "kana": "かのうせい",
    "zh": "可能性",
    "example": "可能性があります。",
    "meaning": "有可能性。"
  },
  {
    "level": "N2",
    "jp": "考慮",
    "kana": "こうりょ",
    "zh": "考慮",
    "example": "費用を考慮します。",
    "meaning": "考慮費用。"
  },
  {
    "level": "N1",
    "jp": "看過",
    "kana": "かんか",
    "zh": "忽視／坐視",
    "example": "問題を看過できません。",
    "meaning": "不能忽視問題。"
  },
  {
    "level": "N1",
    "jp": "杞憂",
    "kana": "きゆう",
    "zh": "多餘的擔心",
    "example": "それは杞憂でした。",
    "meaning": "那是多慮了。"
  },
  {
    "level": "N1",
    "jp": "踏襲",
    "kana": "とうしゅう",
    "zh": "沿襲",
    "example": "従来の方法を踏襲します。",
    "meaning": "沿用既有方式。"
  },
  {
    "level": "N1",
    "jp": "如実",
    "kana": "にょじつ",
    "zh": "如實顯現",
    "example": "変化が如実に表れました。",
    "meaning": "變化清楚地顯現。"
  },
  {
    "level": "N1",
    "jp": "乖離",
    "kana": "かいり",
    "zh": "背離／落差",
    "example": "理想と現実に乖離があります。",
    "meaning": "理想和現實有落差。"
  },
  {
    "level": "N1",
    "jp": "懸念",
    "kana": "けねん",
    "zh": "擔憂／疑慮",
    "example": "安全性への懸念があります。",
    "meaning": "對安全性有所疑慮。"
  },
  {
    "level": "N1",
    "jp": "醸成",
    "kana": "じょうせい",
    "zh": "醞釀／培養",
    "example": "信頼関係を醸成します。",
    "meaning": "培養信賴關係。"
  },
  {
    "level": "N1",
    "jp": "緻密",
    "kana": "ちみつ",
    "zh": "縝密",
    "example": "緻密な計画を立てます。",
    "meaning": "制定縝密計畫。"
  }
];


export const gradedWords = [...baseWords, ...expandedWords];
