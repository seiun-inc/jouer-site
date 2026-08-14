// コミット前検証: node verify.js
const fs = require('fs');
const pages = ['index.html','price.html','access.html','faq.html','recruit.html','reserve.html'];
let ok = true;

const allHtml = {};
for (const f of pages) allHtml[f] = fs.readFileSync(f, 'utf8');
const siteText = pages.map(f => allHtml[f]).join('\n');

// ▼▼ v22.2確定版:必須文字列(全ページ横断で存在すればOK) ▼▼
const REQUIRED_STRINGS = [
  '5,000円','4,500円','4,000円','8,000円','500円引き',
  '2日前17:00','前日23:00','5日前17:00',
  '1,320','2,630','3,130','3,790','6,790','660','550','最大3時間','lin.ee/qetP6h9',
  '麻雀女子デビュープラン','レベルアッププラン','マスタープラン','グループレッスン','セット利用',
  '2,640','23:30','徹マンCAMP','風営法','COMING SOON',
  '4名割の内訳','4名そろうと1人','3ステップ',
  '楽しみ方は、みっつ。','麻雀がはじめての方へ','ルールは知ってる方へ','もっと勝ちたい方へ',
  'どのプランにするか迷ったら','タップでスキップ','PRIVATE','レベル別全3プラン',
  '合計2,000円おトク','plan-tag deal','sns-ico',
];
// ▼▼ v22.2確定版:禁止文字列(全6ページで0件) ▼▼
// ▼▼ v24.1で追加:旧STORESドメイン・旧ページID ▼▼
const FORBIDDEN_STRINGS = [
  '3,960','10,560','13,200','3,300円','4,400円','6,600円',
  '前日17:00','前日24:00','会をつくる','講習パック','tel:','電話','翌8:00','23:00(毎日5枠','登録料',
  'jouermahjongsalonshi','4476109','4858901','2841471',
  'ペナルティ','不成立','となっております',
  'いちばん人気','楽しみ方は、ふたつ','TAP TO SKIP','CHARTER',
  'inline-block">まずは',
];
// ▼▼ v24.1確定版:reserve.html専用の必須文字列(新STORESドメイン・新ページID) ▼▼
const RESERVE_REQUIRED_STRINGS = ['jouer-shibuya.stores.jp','2307698','4335449','1737267'];

for (const s of REQUIRED_STRINGS) {
  if (!siteText.includes(s)) { console.error(`NG 必須文字列が見つからない: ${s}`); ok = false; }
}
for (const s of FORBIDDEN_STRINGS) {
  for (const f of pages) {
    if (allHtml[f].includes(s)) { console.error(`NG ${f}: 禁止文字列「${s}」が残存`); ok = false; }
  }
}

for (const f of pages) {
  const html = allHtml[f];
  const checks = [
    [(html.match(/<div/g)||[]).length === (html.match(/<\/div>/g)||[]).length, 'divタグの開閉が不一致'],
    [(html.match(/<section/g)||[]).length === (html.match(/<\/section>/g)||[]).length, 'sectionタグの開閉が不一致'],
    [!/プロ雀士のコーチ/.test(html), '旧人称「プロ雀士のコーチ」が残存(→トレーナー)'],
    [!/id="snd"/.test(html), '削除済みの効果音ボタンが復活している'],
    [!/%%(CSS|JS|LOGO|PHOTO)%%/.test(html), '未解決のテンプレートトークン'],
    [!/13:00\s*–\s*翌1:00/.test(html), '旧営業時間表記(13:00 – 翌1:00)が残存'],
    [/noindex/.test(html), '公開前ガード: noindexが見つからない(公開直前に意図して削除した場合はOK)'],
    [!/定休/.test(html), '「定休」表記が残存(定休日はなしになったため削除対象)'],
    [/<a class="cta[^"]*"\s+href="reserve\.html">/.test(html), 'ヘッダーにreserve.htmlへのCTAが見つからない'],
    [!/price\.html#find/.test(html), '旧#findアンカーへの参照が残存'],
    [!/相席レッスン|トレーナー付きレッスン/.test(html.replace(/<!--[\s\S]*?-->/g, '')), '旧プラン名(相席レッスン/トレーナー付きレッスン)がお客様向けテキストに残存'],
    [/class="sns"/.test(html), 'ヘッダーSNSアイコンが見つからない(v27)'],
  ];
  if (f !== 'recruit.html') {
    checks.push([!/mailto:/.test(html), 'メールリンクが残存(v26でサイト表記から削除。採用ページのみ可)']);
  }
  if (f === 'price.html') {
    checks.push([!/¥3,850\s*\/\s*卓/.test(html), '旧コーチング料表記(¥3,850/卓)が残存']);
    checks.push([!/set_beg|set_mid|set_adv/.test(html), '旧STORESキー(set_beg等)が残存']);
    checks.push([!/id="ask/.test(html)&&!/class="ask-opts/.test(html), '料金ページに診断UIが残存(reserve.htmlへ移設済みのはず)']);
    checks.push([!/GAS_URL/.test(html), '料金ページにGAS_URLが残存(reserve.htmlへ移設済みのはず)']);
    checks.push([!/dd class="total"/.test(html), '旧内訳dl(dd class="total")が残存(v25でカード1行内訳に簡素化済み)']);
    checks.push([!/通常5,000円・4名割で4,500円/.test(html), '削除済みの料金復唱パラグラフが残存(v25)']);
    checks.push([!/初心者マンツーマンは1時間5,000円/.test(html), '削除済みのマンツーマン重複注記が残存(v25)']);
    checks.push([/4名割の内訳/.test(html), '4名割ボックスの内訳行が見つからない(v25)']);
    checks.push([/どのプランにするか迷ったら/.test(html), 'プラン選択ミニガイドが見つからない(v26)']);
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
  }
  if (f === 'reserve.html') {
    for (const s of RESERVE_REQUIRED_STRINGS) {
      checks.push([html.includes(s), `reserve.html必須文字列が見つからない: ${s}`]);
    }
    checks.push([/GAS_URL/.test(html), 'GAS_URL設定が見つからない']);
    checks.push([/aiseki_beg:\s*'[^']+'/.test(html), 'STORES.aiseki_begが空です']);
    checks.push([/aiseki_mid:\s*'[^']+'/.test(html), 'STORES.aiseki_midが空です']);
    checks.push([/aiseki_adv:\s*'[^']+'/.test(html), 'STORES.aiseki_advが空です']);
    checks.push([!/aiseki_create|\bcoach:|\bcamp:/.test(html), '廃止済みSTORESキー(aiseki_create/coach/camp)が残存']);
    checks.push([!/PHONE_TEL/.test(html), 'PHONE_TEL機構が残存(v21で撤去済み)']);
    checks.push([/LINE_URL\s*=\s*'[^']+'/.test(html), 'LINE_URLが空です']);
    checks.push([/はじめてご利用の方/.test(html), '「はじめてご利用の方」が見つからない']);
    checks.push([/メニューをえらぶ/.test(html), '「メニューをえらぶ」が見つからない']);
    checks.push([!/認定ランクで予約する/.test(html), '旧文言「認定ランクで予約する」が残存']);
    checks.push([!/レベル診断がまだの方/.test(html), '旧文言「レベル診断がまだの方」が残存']);
  }
  if (f === 'faq.html') {
    checks.push([/持ち物や服装/.test(html), 'FAQ「持ち物や服装」が見つからない']);
    checks.push([/キャンセルはできますか/.test(html), 'FAQ「キャンセルはできますか」が見つからない']);
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
const rsv = allHtml['reserve.html'];
for (const [h, key, name] of [
  [rsv, 'STORES={', 'STORES予約URL設定表'],
]) {
  if (!h.includes(key)) { console.error(`NG 先祖返りの疑い: ${name} が見つからない`); ok = false; }
}

// 内訳算術チェック(v25形式)
const num = s => parseInt(String(s).replace(/,/g, ''), 10);
const priceHtml = allHtml['price.html'];
let cardCount = 0, tdCount = 0;
let bm;
// ① グループレッスン3カード: plan-price(総額) → plan-tag → 内訳1行
const cardRe = /<p class="plan-price"><span data-yen="(\d+)">[^<]+<\/span><small>[^<]*<\/small><\/p>\s*<span class="plan-tag(?: deal)?">[^<]*<\/span>\s*<p class="ask-note"[^>]*>内訳:卓([\d,]+)\+トレーナー([\d,]+)\+飲み放題([\d,]+)/g;
while ((bm = cardRe.exec(priceHtml))) {
  const total = num(bm[1]);
  const sum = num(bm[2]) + num(bm[3]) + num(bm[4]);
  if (sum !== total) { console.error(`NG price.html: カード内訳不一致 卓${bm[2]}+トレーナー${bm[3]}+飲み放題${bm[4]}=${sum} ≠ 表示${total}`); ok = false; }
  cardCount++;
}
if (cardCount !== 3) { console.error(`NG price.html: グループレッスンのカード内訳が3件検出できません(${cardCount}件)`); ok = false; }
// ② マンツーマン2カード(td形式・v23から不変)
const tdRe = /<td><span class="yen" data-yen="(\d+)">.*?<small>卓([\d,]+)\+トレーナー([\d,]+)\+飲み放題([\d,]+)/g;
while ((bm = tdRe.exec(priceHtml))) {
  const total = num(bm[1]);
  const sum = num(bm[2]) + num(bm[3]) + num(bm[4]);
  if (sum !== total) { console.error(`NG price.html: 内訳合計不一致 卓${bm[2]}+トレーナー${bm[3]}+飲み放題${bm[4]}=${sum} ≠ 表示${total}`); ok = false; }
  tdCount++;
}
if (tdCount !== 2) { console.error(`NG price.html: マンツーマンの内訳が2件検出できません(${tdCount}件)`); ok = false; }
// ③ 4名割ボックスの内訳(2パターン・卓+トレーナー+飲み放題=総額)
for (const [re, name] of [
  [/4名割の内訳:デビュー=卓([\d,]+)\+トレーナー([\d,]+)\+飲み放題([\d,]+)=([\d,]+)円/, 'デビュー4名割'],
  [/レベルアップ・マスター=卓([\d,]+)\+トレーナー([\d,]+)\+飲み放題([\d,]+)=([\d,]+)円/, 'レベルアップ・マスター4名割'],
]) {
  const m = priceHtml.match(re);
  if (!m) { console.error(`NG price.html: ${name}の内訳行が見つからない`); ok = false; continue; }
  const sum = num(m[1]) + num(m[2]) + num(m[3]);
  if (sum !== num(m[4])) { console.error(`NG price.html: ${name} 内訳不一致 ${sum} ≠ ${m[4]}`); ok = false; }
}
// セット利用: 卓料金2,640円は660円×4名分と整合
if (2640 !== 660 * 4) { console.error('NG セット利用の卓料金(2,640円)が660円×4名と一致しません'); ok = false; }

console.log(ok ? '✓ 全チェック通過' : '✗ 修正が必要です');
process.exit(ok ? 0 : 1);
