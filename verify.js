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
    [!/マンツーマン/.test(html), '「マンツーマン」表記が残存'],
    [!/13:00\s*–\s*翌1:00/.test(html), '旧営業時間表記(13:00 – 翌1:00)が残存'],
    [/noindex/.test(html), '公開前ガード: noindexが見つからない(公開直前に意図して削除した場合はOK)'],
    [!/定休/.test(html), '「定休」表記が残存(定休日はなしになったため削除対象)'],
    [/予約枠をさがす/.test(html), 'ヘッダーCTAのラベル「予約枠をさがす」が見つからない'],
  ];
  if (f === 'price.html') {
    checks.push([!/¥3,850\s*\/\s*卓/.test(html), '旧コーチング料表記(¥3,850/卓)が残存']);
    checks.push([!/set_beg|set_mid|set_adv/.test(html), '旧STORESキー(set_beg等)が残存']);
    checks.push([/GAS_URL/.test(html), 'GAS_URL設定が見つからない']);
    checks.push([/お友だちと(\(2名〜4名\)|2名〜4名)/.test(html), 'Q1.5の選択肢「お友だちと(2名〜4名)」が見つからない']);
  }
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
  [idx, '徹マン CAMP', '徹マンCAMPセクション'],
  [idx, 'id="camp"', 'FAQからのアンカー'],
]) {
  if (!h.includes(key)) { console.error(`NG 先祖返りの疑い: ${name} が見つからない`); ok = false; }
}
console.log(ok ? '✓ 全チェック通過' : '✗ 修正が必要です');
process.exit(ok ? 0 : 1);
