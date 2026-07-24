// コミット前検証: node verify.js
const fs = require('fs');
const pages = ['index.html','price.html','access.html','faq.html','recruit.html'];
let ok = true;
for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8');
  const checks = [
    [(html.match(/<div/g)||[]).length === (html.match(/<\/div>/g)||[]).length, 'divタグの開閉が不一致'],
    [(html.match(/<section/g)||[]).length === (html.match(/<\/section>/g)||[]).length, 'sectionタグの開閉が不一致'],
    [!/プロ雀士のコーチ/.test(html), '旧人称「プロ雀士のコーチ」が残存(→トレーナー)'],
    [!/id="snd"/.test(html), '削除済みの効果音ボタンが復活している'],
    [!/%%(CSS|JS|LOGO|PHOTO)%%/.test(html), '未解決のテンプレートトークン'],
  ];
  for (const [pass, msg] of checks) {
    if (!pass) { console.error(`NG ${f}: ${msg}`); ok = false; }
  }
  try {
    [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach(m => new Function(m[1]));
  } catch (e) { console.error(`NG ${f}: インラインJS構文エラー: ${e.message}`); ok = false; }
}
try { new Function(fs.readFileSync('app.js','utf8')); }
catch (e) { console.error(`NG app.js: 構文エラー: ${e.message}`); ok = false; }
// 先祖返りチェック(重要コンテンツの残存)
const pr = fs.readFileSync('price.html','utf8');
const idx = fs.readFileSync('index.html','utf8');
for (const [h, key, name] of [
  [pr, 'STORES={', 'STORES予約URL設定表'],
  [pr, 'data-v="8"', 'レベル診断(8段階)'],
  [idx, '徹マン CAMP', '徹マンCAMPセクション'],
  [idx, 'id="camp"', 'FAQからのアンカー'],
]) {
  if (!h.includes(key)) { console.error(`NG 先祖返りの疑い: ${name} が見つからない`); ok = false; }
}
console.log(ok ? '✓ 全チェック通過' : '✗ 修正が必要です');
process.exit(ok ? 0 : 1);
