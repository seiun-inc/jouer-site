// コミット前検証: node verify.js
const fs = require('fs');
const pages = ['index.html','price.html','access.html','faq.html','recruit.html','reserve.html'];
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
    [/<a class="cta[^"]*"\s+href="reserve\.html">/.test(html), 'ヘッダーにreserve.htmlへのCTAが見つからない'],
    [!/price\.html#find/.test(html), '旧#findアンカーへの参照が残存'],
    [!/tel:0000000000/.test(html), '仮の電話番号(tel:0000000000)が残存'],
  ];
  if (f === 'price.html') {
    checks.push([!/¥3,850\s*\/\s*卓/.test(html), '旧コーチング料表記(¥3,850/卓)が残存']);
    checks.push([!/set_beg|set_mid|set_adv/.test(html), '旧STORESキー(set_beg等)が残存']);
    checks.push([!/id="ask/.test(html)&&!/class="ask-opts/.test(html), '料金ページに診断UIが残存(reserve.htmlへ移設済みのはず)']);
    checks.push([!/GAS_URL/.test(html), '料金ページにGAS_URLが残存(reserve.htmlへ移設済みのはず)']);
  }
  if (f === 'reserve.html') {
    checks.push([/GAS_URL/.test(html), 'GAS_URL設定が見つからない']);
    checks.push([/お友だちと(\(2名〜4名\)|2名〜4名)/.test(html), 'Q2の選択肢「お友だちと(2名〜4名)」が見つからない']);
    checks.push([/開催予定の会に参加する/.test(html), '「開催予定の会に参加する」の表記が見つからない']);
    checks.push([!/Q1\.5/.test(html), '旧質問番号Q1.5が残存(整数のQ1〜Q6に統一するはず)']);
    // STORES本番URL: camp以外は空欄不可
    checks.push([/aiseki_beg:\s*'[^']+'/.test(html), 'STORES.aiseki_begが空です']);
    checks.push([/aiseki_mid:\s*'[^']+'/.test(html), 'STORES.aiseki_midが空です']);
    checks.push([/aiseki_adv:\s*'[^']+'/.test(html), 'STORES.aiseki_advが空です']);
    checks.push([/aiseki_create_beg:\s*'[^']+'/.test(html), 'STORES.aiseki_create_begが空です']);
    checks.push([/aiseki_create_mid:\s*'[^']+'/.test(html), 'STORES.aiseki_create_midが空です']);
    checks.push([/aiseki_create_adv:\s*'[^']+'/.test(html), 'STORES.aiseki_create_advが空です']);
    checks.push([/\baiseki_create:\s*'[^']+'/.test(html), 'STORES.aiseki_createが空です']);
    checks.push([/\bcoach:\s*'[^']+'/.test(html), 'STORES.coachが空です']);
    checks.push([/\bset:\s*'[^']+'/.test(html), 'STORES.setが空です']);
    checks.push([/LINE_URL\s*=\s*'[^']+'/.test(html), 'LINE_URLが空です']);
  }
  if (f === 'price.html') {
    checks.push([/おひとり参加レッスン/.test(html), '新プラン名「おひとり参加レッスン」が見つからない']);
    checks.push([/お友だちとレッスン/.test(html), '新プラン名「お友だちとレッスン」が見つからない']);
    checks.push([!/準備中・仮リンク/.test(html), '陳腐化した「準備中・仮リンク」表記が残存']);
    checks.push([/キャンセル・変更について/.test(html), '「キャンセル・変更について」ブロックが見つからない']);
  }
  if (f === 'access.html') {
    checks.push([/share\.google\/EX7jSMPCL6X9i9RC0/.test(html), 'Googleマップ共有リンクが見つからない']);
  }
  if (f === 'index.html') {
    checks.push([/table\.jpg/.test(html), 'table.jpgの参照が見つからない']);
    checks.push([/tiles\.jpg/.test(html), 'tiles.jpgの参照が見つからない']);
    checks.push([!/PHOTO COMING SOON/.test(html), 'PHOTO COMING SOONのプレースホルダーが残存']);
    checks.push([!/id="staff"/.test(html), 'STAFFセクションが復活している(v17で削除済みのはず)']);
    checks.push([!/>STAFF<span class="fl">/.test(html), 'STAFFセクション見出しが復活している(v17で削除済みのはず)']);
    checks.push([!/>PRICE<span class="fl">/.test(html), 'PRICEセクション見出しが復活している(v17で削除済みのはず)']);
    checks.push([/instagram\.com\/jouer\.mahjong/.test(html), 'Instagram本番URLが見つからない']);
    checks.push([/開催日を公式LINEで確認する/.test(html), 'CAMPボタンの新文言が見つからない']);
    checks.push([/href="https:\/\/lin\.ee\/qetP6h9"[^>]*>開催日を公式LINEで確認する/.test(html), 'CAMPボタンがlin.eeにリンクしていない']);
  }
  if (f === 'reserve.html') {
    checks.push([/お友だちとレッスン/.test(html), '新プラン名「お友だちとレッスン」が見つからない']);
    checks.push([/おひとり参加レッスン/.test(html), '新プラン名「おひとり参加レッスン」が見つからない']);
    checks.push([/はじめてご利用の方/.test(html), '「はじめてご利用の方」が見つからない']);
    checks.push([/メニューをえらぶ/.test(html), '「メニューをえらぶ」が見つからない']);
    checks.push([!/認定ランクで予約する/.test(html), '旧文言「認定ランクで予約する」が残存']);
    checks.push([!/レベル診断がまだの方/.test(html), '旧文言「レベル診断がまだの方」が残存']);
    checks.push([/¥1,650〜/.test(html), '新料金表記「¥1,650〜」が見つからない']);
  }
  if (f === 'faq.html') {
    checks.push([/持ち物や服装/.test(html), 'FAQ「持ち物や服装」が見つからない']);
    checks.push([/キャンセルはできますか/.test(html), 'FAQ「キャンセルはできますか」が見つからない']);
  }
  const noComments = html.replace(/<!--[\s\S]*?-->/g, '');
  checks.push([!/相席レッスン|トレーナー付きレッスン/.test(noComments), '旧プラン名(相席レッスン/トレーナー付きレッスン)がお客様向けテキストに残存']);
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
const rsv = fs.readFileSync('reserve.html','utf8');
const idx = fs.readFileSync('index.html','utf8');
for (const [h, key, name] of [
  [rsv, 'STORES={', 'STORES予約URL設定表'],
  [idx, '徹マン CAMP', '徹マンCAMPセクション'],
  [idx, 'id="camp"', 'FAQからのアンカー'],
]) {
  if (!h.includes(key)) { console.error(`NG 先祖返りの疑い: ${name} が見つからない`); ok = false; }
}
console.log(ok ? '✓ 全チェック通過' : '✗ 修正が必要です');
process.exit(ok ? 0 : 1);
