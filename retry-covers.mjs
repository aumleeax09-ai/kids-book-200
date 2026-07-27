import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root, 'books.json'), 'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root, 'covers.json'), 'utf8'));

const missing = [];
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const x of books[s][g]) {
  const cv = covers[x[0]]; if (!cv || !cv.img) missing.push([x[0], x[1]]);
}
const badAuthor = /편집부|co\.|a\.|원작|그림|외$|·/;
function cleanTitle(t){ return t.replace(/\s*\(.*?\)\s*/g,' ').replace(/^.*?시리즈:\s*/,'').replace(/위인 이야기$/,'').replace(/위인전$/,'').replace(/[:：].*$/,'').trim(); }
const RE = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/([^\s"'\/]+?)\.(?:jpg|gif|png)/;
const sleep = (ms) => new Promise(r=>setTimeout(r,ms));
async function fetchCover(q){
  const url = 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord=' + encodeURIComponent(q);
  const res = await fetch(url, { headers:{ 'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }});
  const html = await res.text();
  const m = html.match(RE);
  if(!m) return null;
  const im = m[1].match(/^([0-9]{9}[0-9Xx])/);
  return { img: m[0], isbn: im ? im[1] : '' };
}

let ok=0, fail=[];
for (const [title, author] of missing) {
  const ct = cleanTitle(title);
  const attempts = [ct];
  if (!badAuthor.test(author)) attempts.push(ct + ' ' + author);
  let got = null;
  for (const q of attempts) { try { got = await fetchCover(q); } catch(e){ got=null; } if (got) break; await sleep(200); }
  if (got) { covers[title] = got; ok++; } else { fail.push(title); }
  await sleep(200);
}
fs.writeFileSync(path.join(root, 'covers.json'), JSON.stringify(covers, null, 1), 'utf8');
console.log('재시도 성공', ok, '/', missing.length);
console.log('여전히 실패:', fail.length ? fail.join(', ') : '없음');
