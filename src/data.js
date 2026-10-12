export const rows = [
['あいうえお','aiueo'],['かきくけこ','kakikukeko'],['さしすせそ','sashisuseso'],['たちつてと','tachitsuteto'],['なにぬねの','naninuneno'],['はひふへほ','hahifuheho'],['まみむめも','mamimumemo'],['やゆよ','yayuyo'],['らりるれろ','rarirurero'],['わをん','wawon']];
export const hira = 'あ い う え お か き く け こ さ し す せ そ た ち つ て と な に ぬ ね の は ひ ふ へ ほ ま み む め も や ゆ よ ら り る れ ろ わ を ん'.split(' ');
export const kata = 'ア イ ウ エ オ カ キ ク ケ コ サ シ ス セ ソ タ チ ツ テ ト ナ ニ ヌ ネ ノ ハ ヒ フ ヘ ホ マ ミ ム メ モ ヤ ユ ヨ ラ リ ル レ ロ ワ ヲ ン'.split(' ');
export const romaji = 'a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n'.split(' ');
export const words = [
['あめ','ame','雨','天氣'],['いぬ','inu','狗','動物'],['うみ','umi','海','自然'],['えき','eki','車站','旅遊'],['おちゃ','ocha','茶','飲食'],
['ねこ','neko','貓','動物'],['みず','mizu','水','飲食'],['ごはん','gohan','飯／餐點','飲食'],['すし','sushi','壽司','飲食'],['りんご','ringo','蘋果','飲食'],
['ともだち','tomodachi','朋友','生活'],['がっこう','gakkou','學校','生活'],['せんせい','sensei','老師','生活'],['ほん','hon','書','生活'],['くるま','kuruma','汽車','旅遊'],
['でんしゃ','densha','電車','旅遊'],['ひこうき','hikouki','飛機','旅遊'],['いえ','ie','家','生活'],['へや','heya','房間','生活'],['かさ','kasa','雨傘','生活'],
['はな','hana','花','自然'],['やま','yama','山','自然'],['そら','sora','天空','自然'],['かわ','kawa','河流','自然'],['ゆき','yuki','雪','自然'],
['おはよう','ohayou','早安','招呼'],['こんにちは','konnichiwa','你好／午安','招呼'],['こんばんは','konbanwa','晚上好','招呼'],['ありがとう','arigatou','謝謝','招呼'],['さようなら','sayounara','再見','招呼']
].map(([jp,reading,zh,category])=>({jp,reading,zh,category}));
