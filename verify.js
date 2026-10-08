// コミット前検証: node verify.js
const fs = require('fs');
const pages = ['index.html','price.html','access.html','faq.html','recruit.html','reserve.html'];
let ok = true;

const allHtml = {};
for (const f of pages) allHtml[f] = fs.readFileSync(f, 'utf8');
const siteText = pages.map(f => allHtml[f]).join('\n');

for (const pf of ['robots.txt', 'sitemap.xml', 'og-image.jpg']) {
  if (!fs.existsSync(pf)) { console.error(`NG 公開必須ファイルが存在しない: ${pf}`); ok = false; }
}

// ▼▼ v30確定版(2026-10料金改定):必須文字列(全ページ横断で存在すればOK) ▼▼
const REQUIRED_STRINGS = [
  '初回体験プラン','通常レッスンプラン','女子会プラン','経験者向け・卓のみの利用',
  '1,000','4,500','2,000','6,000','3,000','1,200','600','300','550','500',
  'お友だち割','紹介割','SNS・口コミ割','割引の併用はできません',
  '卓単位','ドリンク付き','デビュー','レベルアップ','マスター',
  'ノーレート','賭け事なし','公式LINE','10:00','23:30',
  '賭け事・タバコ・深夜営業は、jouerにはありません','麻雀教室',
  'どのプランにするか迷ったら','タップでスキップ','楽しみ方は、みっつ。',
  'og-image.jpg','rel="canonical"','summary_large_image',
];
// ▼▼ v22.2確定版:禁止文字列(全6ページで0件) ▼▼
// ▼▼ v24.1で追加:旧STORESドメイン・旧ページID ▼▼
const FORBIDDEN_STRINGS = [
  '3,960','10,560','13,200','3,300円','4,400円','6,600円',
  '前日17:00','前日24:00','会をつくる','講習パック','tel:','電話','翌8:00','23:00(毎日5枠','登録料',
  'jouermahjongsalonshi','4476109','4858901','2841471',
  'ペナルティ','不成立','となっております',
  'いちばん人気','楽しみ方は、ふたつ','TAP TO SKIP','CHARTER',
  '風営法','徹マン','オールナイト','COMING SOON','フリー対局','深夜合宿','賞金','優勝賞品',
  'inline-block">まずは',
  '内訳:卓1,320',
  'noindex',
  // ▼▼ v30追加:2026-10料金改定で撤去した旧体系 ▼▼
  'マンツーマン','指名','4名割','4名そろうと','合計2,000円おトク',
  '2,640','1,320','3,130','2,630','3,790','6,790','8,000','5,000円','¥5,000',
  '貸切','PRIVATE','stores.jp','STORES','仮申込み','開催決定',
  '2日前17:00','5日前17:00','内訳:卓','660×2時間','660円/人/1時間','毎日5枠',
];
// 禁止語の例外(ページ限定)。貸切は提供終了としたが、FAQで「貸切可能・公式LINEへお問い合わせ」と案内するためfaq.htmlのみ許可(なみ回答 2026-10-08)
const FORBIDDEN_EXEMPT = { '貸切': ['faq.html'] };

for (const s of REQUIRED_STRINGS) {
  if (!siteText.includes(s)) { console.error(`NG 必須文字列が見つからない: ${s}`); ok = false; }
}
for (const s of FORBIDDEN_STRINGS) {
  for (const f of pages) {
    if ((FORBIDDEN_EXEMPT[s] || []).includes(f)) continue;
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
    [!/noindex/.test(html), '公開済みサイトにnoindexが残存(v28で全ページ削除済み)'],
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
    // v30: 予約は公式LINEのみ。診断UI・GAS送信・STORES導線は廃止
    checks.push([/href="https:\/\/lin\.ee\/qetP6h9"/.test(html), '公式LINEへの予約ボタン(lin.ee/qetP6h9)が見つからない(v30)']);
    checks.push([/公式LINEで予約する/.test(html), '「公式LINEで予約する」ボタンが見つからない(v30)']);
    checks.push([!/GAS_URL|QDATA|RDATA|rsvBody|rsvStage/.test(html), '廃止済みの予約診断UI/GAS送信コードが残存(v30)']);
    checks.push([!/PHONE_TEL/.test(html), 'PHONE_TEL機構が残存(v21で撤去済み)']);
  }
  if (f === 'faq.html') {
    checks.push([/持ち物や服装/.test(html), 'FAQ「持ち物や服装」が見つからない']);
    checks.push([/女子会プランとレッスンの違いは何ですか/.test(html), 'FAQ「女子会プランとレッスンの違い」が見つからない(v30)']);
    checks.push([/初回体験プランのあとは、どうすればいいですか/.test(html), 'FAQ「初回体験プランのあと」が見つからない(v30)']);
    checks.push([!/キャンセルはできますか/.test(html), '撤去済みのFAQ「キャンセルはできますか」が残存(v30)']);
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

// 料金整合(2026-10体系・固定値検算)
const PH = allHtml['price.html'];
const fixed = [
  [6000/2===3000,'女子会トレーナーあり30分は1時間の半額(3,000)'],
  [1200/2===600,'女子会トレーナーなし30分は1時間の半額(600)'],
  [1200/4===300,'セット・女子会なし4名の1人目安(300)'],
  [6000/4===1500,'女子会あり4名の1人目安(1,500)'],
  [6000/3===2000,'女子会あり3名の1人目安(2,000)'],
];
for (const [cond,msg] of fixed) if(!cond){console.error('NG 料金整合: '+msg);ok=false;}
for (const s of ['6,000円/卓','3,000円/卓','1,200円/卓','600円/卓','4名で1,500円','3名で2,000円','4名で300円']) {
  if (!PH.includes(s)) { console.error('NG price.html: 女子会/セット表記欠落: '+s); ok=false; }
}

console.log(ok ? '✓ 全チェック通過' : '✗ 修正が必要です');
process.exit(ok ? 0 : 1);
