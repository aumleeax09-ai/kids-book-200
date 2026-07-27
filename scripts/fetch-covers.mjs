// books.json 의 모든 도서에 대해 covers.json 에 표지가 없는 항목을 알라딘에서 채운다.
// 사용: node scripts/fetch-covers.mjs        (표지 없는 것만)
//       node scripts/fetch-covers.mjs --all  (전체 다시 수집)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const booksPath = path.join(root, 'books.json');
const coversPath = path.join(root, 'covers.json');
const books = JSON.parse(fs.readFileSync(booksPath, 'utf8'));
const covers = fs.existsSync(coversPath) ? JSON.parse(fs.readFileSync(coversPath, 'utf8')) : {};
const all = process.argv.includes('--all');

// 모든 도서 [title, author, ...]
const list = [];
for (const src of ['store', 'lib'])
  for (const grp of ['유아', '초등'])
    for (const b of books[src][grp]) list.push({ title: b[0], author: b[1] });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RE = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/([^\s"'\/]+?)\.(?:jpg|gif|png)/;

let done = 0, ok = 0;
for (const { title, author } of list) {
  const cur = covers[title];
  if (!all && cur && cur.img) continue;
  const q = encodeURIComponent(title + ' ' + author);
  const url = 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord=' + q;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    const html = await res.text();
    const m = html.match(RE);
    if (m) {
      const fn = m[1];
      const im = fn.match(/^([0-9]{9}[0-9Xx])/);
      covers[title] = { img: m[0], isbn: im ? im[1] : '' };
      ok++;
    } else {
      covers[title] = covers[title] || { img: '', isbn: '' };
    }
  } catch (e) {
    covers[title] = covers[title] || { img: '', isbn: '' };
  }
  done++;
  if (done % 20 === 0) console.log(`  ...${done} 처리`);
  await sleep(220);
}
fs.writeFileSync(coversPath, JSON.stringify(covers, null, 1), 'utf8');
console.log(`표지 수집 완료 · 시도 ${done}건 · 성공 ${ok}건 · 총 키 ${Object.keys(covers).length}`);
