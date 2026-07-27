import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);
const BAD=/(스티커|색칠|활동북|워크북|보드북|오디오|CD|전\s*\d+\s*권|세트|전집|합본|박스|사운드북)/;
const coverRe=/https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;
const need = 500 - (books.store['유아'].length + books.lib['유아'].length);
const queries=['이상교 그림책','임정진 그림책','조은수 옛이야기','이혜리 그림책','김재홍 그림책'];
let addedTotal=0;
for (const q of queries){
  if (addedTotal>=need) break;
  const url='https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord='+encodeURIComponent(q);
  const html=await (await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}})).text();
  const covPos=[]; let cm; coverRe.lastIndex=0; while((cm=coverRe.exec(html))!==null) covPos.push([cm.index,cm[0]]);
  const bo3=/class="bo3">([^<]+)<\/a>/g; let m;
  while((m=bo3.exec(html))!==null){
    if(addedTotal>=need) break;
    const title=m[1].trim().replace(/\s+/g,' ');
    if(BAD.test(title)||existing.has(title)) continue;
    const chunk=html.slice(m.index,m.index+700);
    const am=chunk.match(/AuthorSearch=[^>]*>\s*([^<]+?)\s*<\/a>\s*\(지은이\)/)||chunk.match(/AuthorSearch=[^>]*>\s*([^<]+?)\s*<\/a>/);
    const pm=chunk.match(/PublisherSearch=[^>]*>\s*([^<]+?)\s*<\/[Aa]>/);
    if(!am||!pm) continue;
    let cv=''; for(const [p,u] of covPos){ if(p<m.index) cv=u; else break; }
    const fn=(cv.match(/\/cover\d+\/([^\/]+?)\.(?:jpg|gif|png)/)||[])[1]||'';
    const im=fn.match(/^([0-9]{9}[0-9Xx])/);
    if(cv) covers[title]={img:cv,isbn:im?im[1]:''};
    books.lib['유아'].push([title,am[1].trim(),pm[1].trim(),'5~7세','그림책',4,'우리 정서를 담아 오래 사랑받는 그림책.','정서·감수성']);
    existing.add(title); addedTotal++;
    console.log('추가:',title,'/',am[1].trim());
  }
}
fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
let tot=0; for(const s of['store','lib'])for(const g of['유아','초등'])tot+=books[s][g].length;
console.log('유치원',books.store['유아'].length+books.lib['유아'].length,'· 초등',books.store['초등'].length+books.lib['초등'].length,'· 총',tot);
