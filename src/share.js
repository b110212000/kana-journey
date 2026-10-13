// YOMIO score card — entirely client-side; no login, uploads or backend required.
export const scorePercent = (record) => record.total
  ? Math.round((record.correct / record.total) * 100) : 0;

export const scoreDate = (timestamp) => new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit'
}).format(new Date(timestamp));

export function shareCaption(record) {
  const score = scorePercent(record);
  return [
    '🌿 YOMIO 日文學習挑戰',
    '我完成了 ' + record.level + ' 的' + (record.mode === 'review' ? '錯題複習' : '日語測驗') + '！',
    '🎯 ' + record.correct + ' / ' + record.total + ' 題正確（' + score + '%）',
    '你也來挑戰看看吧 👇',
    'https://b110212000.github.io/kana-journey/'
  ].join('\n');
}

const rounded = (context, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.closePath();
};

function drawBrand(context, x, y, scale) {
  // Shape echoes the YOMIO open-book + sunrise logo. Everything is drawn locally.
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = '#FFC66F';
  context.beginPath();
  context.arc(55, 31, 23, 0, Math.PI * 2);
  context.fill();
  const left = context.createLinearGradient(7, 12, 105, 108);
  left.addColorStop(0, '#52DFCD'); left.addColorStop(1, '#087C79');
  context.fillStyle = left;
  context.beginPath();
  context.moveTo(52, 114);
  context.bezierCurveTo(39, 88, 12, 84, 6, 57);
  context.bezierCurveTo(2, 43, 3, 31, 5, 20);
  context.bezierCurveTo(31, 26, 49, 44, 63, 70);
  context.bezierCurveTo(73, 89, 68, 111, 56, 117);
  context.fill();
  const right = context.createLinearGradient(60, 12, 116, 114);
  right.addColorStop(0, '#FCFFEE'); right.addColorStop(1, '#8DE2C5');
  context.fillStyle = right;
  context.beginPath();
  context.moveTo(55, 115);
  context.bezierCurveTo(57, 76, 76, 44, 111, 21);
  context.bezierCurveTo(116, 61, 103, 83, 81, 95);
  context.bezierCurveTo(69, 101, 62, 110, 55, 115);
  context.fill();
  context.strokeStyle = '#0A837B';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(59, 109);
  context.bezierCurveTo(72, 72, 97, 78, 107, 50);
  context.stroke();
  context.restore();
}

export function renderScoreCard(record) {
  const canvas = document.createElement('canvas');
  // 4:5 portrait card, clear on retina phones.
  canvas.width = 960;
  canvas.height = 1200;
  const c = canvas.getContext('2d');
  const back = c.createLinearGradient(0, 0, 900, 1200);
  back.addColorStop(0, '#EAF9F1');
  back.addColorStop(1, '#DBF2EB');
  c.fillStyle = back;
  c.fillRect(0, 0, canvas.width, canvas.height);

  c.fillStyle = 'rgba(255,209,124,.36)';
  c.beginPath(); c.arc(850, 145, 210, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(26,160,146,.09)';
  c.beginPath(); c.arc(60, 1100, 320, 0, Math.PI * 2); c.fill();

  c.fillStyle = '#FFFFFF';
  rounded(c, 52, 52, 856, 1096, 58);
  c.fill();

  drawBrand(c, 114, 100, 0.9);
  c.fillStyle = '#075E5A';
  c.font = '900 67px -apple-system, system-ui, sans-serif';
  c.textAlign = 'left';
  c.fillText('YOMIO', 255, 168);
  c.fillStyle = '#6B9991';
  c.font = '500 24px -apple-system, system-ui, sans-serif';
  c.fillText('JAPANESE LEARNING', 258, 207);

  c.fillStyle = '#128778';
  c.font = '700 31px -apple-system, system-ui, sans-serif';
  c.fillText('我的日文測驗成就', 116, 334);

  c.fillStyle = '#163F3E';
  c.font = '800 55px -apple-system, system-ui, sans-serif';
  c.fillText(record.level + (record.mode === 'review' ? ' · 錯題複習' : ' · 隨機測驗'), 113, 412);

  c.fillStyle = '#0A8877';
  c.textAlign = 'center';
  c.font = '900 238px -apple-system, system-ui, sans-serif';
  c.fillText(scorePercent(record) + '%', 482, 676);
  c.fillStyle = '#5F8C86';
  c.font = '600 34px -apple-system, system-ui, sans-serif';
  c.fillText('答對 ' + record.correct + ' / ' + record.total + ' 題', 480, 750);

  c.fillStyle = '#EAF8F1';
  rounded(c, 120, 827, 720, 121, 28);
  c.fill();
  c.fillStyle = '#0E796D';
  c.font = '700 38px -apple-system, system-ui, sans-serif';
  c.fillText(scorePercent(record) === 100 ? '完美過關！' : '每天一點，持續進步！', 480, 902);

  c.fillStyle = '#788F8B';
  c.font = '500 25px -apple-system, system-ui, sans-serif';
  c.fillText(scoreDate(record.date), 480, 1030);
  c.font = '500 19px -apple-system, system-ui, sans-serif';
  c.fillText('b110212000.github.io/kana-journey/', 480, 1080);
  return canvas;
}

export async function shareScore(record) {
  const text = shareCaption(record);
  const url = 'https://b110212000.github.io/kana-journey/';
  const canvas = renderScoreCard(record);
  // Canvas conversion happens synchronously while the click is active, improving iOS support.
  const uri = canvas.toDataURL('image/png');
  const binary = atob(uri.slice(uri.indexOf(',') + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const file = new File([bytes], 'yomio-' + scorePercent(record) + 'pct.png', {type:'image/png'});

  if (navigator.share) {
    try {
      if (navigator.canShare?.({files:[file]})) {
        await navigator.share({title:'YOMIO 測驗成績',text,files:[file]});
      } else {
        await navigator.share({title:'YOMIO 測驗成績',text,url});
      }
      return 'shared';
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled';
      // Fallback for unsupported native sharing.
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    const anchor = document.createElement('a');
    anchor.href = uri;
    anchor.download = file.name;
    anchor.click();
    return 'downloaded';
  }
}

export function downloadScoreImage(record) {
  const uri = renderScoreCard(record).toDataURL('image/png');
  const link = document.createElement('a');
  link.href = uri;
  link.download = 'YOMIO-' + record.level + '-' + scorePercent(record) + '.png';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
