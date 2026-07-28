import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));

// 경제·금융 확대
const Q = [
 {q:'옥효진 경제', g:'초등', c:'경제·금융', age:'8~12세', cap:8, why:'세금 내는 아이들 저자 옥효진의 어린이 경제 책.', e:'경제·자기관리'},
 {q:'존 리 어린이 경제', g:'초등', c:'경제·금융', age:'9~12세', cap:6, why:'존 리가 들려주는 어린이 경제·투자 이야기.', e:'경제·투자 개념'},
 {q:'레몬으로 돈 버는 법', g:'초등', c:'경제·금융', age:'8~11세', cap:4, why:'레모네이드 장사로 배우는 경제 원리 그림책.', e:'경제 원리·창업'},
 {q:'어린이 경제', g:'초등', c:'경제·금융', age:'8~12세', cap:12, why:'경제의 기초를 쉽게 풀어낸 어린이 경제책.', e:'경제 개념'},
 {q:'어린이 부자 수업', g:'초등', c:'경제·금융', age:'9~12세', cap:6, why:'돈 관리와 부의 원리를 알려 주는 어린이 책.', e:'경제·자기관리'},
 {q:'용돈 그림책', g:'유아', c:'경제·금융', age:'5~8세', cap:6, why:'용돈으로 배우는 첫 경제 그림책.', e:'용돈·경제 기초'},
 {q:'초등학생 경제', g:'초등', c:'경제·금융', age:'9~12세', cap:8, why:'초등학생을 위한 경제 교양서.', e:'경제·사고력'},
 {q:'돈 이야기 그림책', g:'유아', c:'경제·금융', age:'5~8세', cap:6, why:'돈이 무엇인지 알려 주는 그림책.', e:'경제 기초·개념'},
 {q:'경제 동화', g:'초등', c:'경제·금융', age:'8~12세', cap:10, why:'이야기로 배우는 어린이 경제 동화.', e:'경제·자기관리'},
 {q:'주식 어린이', g:'초등', c:'경제·금융', age:'10~12세', cap:6, why:'주식과 투자를 쉽게 설명한 어린이 책.', e:'투자·경제 개념'}
];

const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|퍼즐|엽서|드릴|기출|평가|익힘|전과|단어장|사전|받아쓰기|급수|따라쓰기|자격증|취업|재테크 노하우|부동산 투자|경제학원론)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const coverRe = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;
let total=0; const summary=[];
for (const cfg of Q) {
  const g = cfg.g || '초등', s = cfg.s || 'store';
  let added=0;
  try{
    const url='https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord='+encodeURIComponent(cfg.q);
    const html=await (await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}})).text();
    const covPos=[]; let cm; coverRe.lastIndex=0; while((cm=coverRe.exec(html))!==null) covPos.push([cm.index,cm[0]]);
    const bo3=/class="bo3">([^<]+)<\/a>/g; let m;
    while((m=bo3.exec(html))!==null){
      if(added>=cfg.cap) break;
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
      books[s][g].push([title,am[1].trim(),pm[1].trim(),cfg.age,cfg.c,4,cfg.why,cfg.e]);
      existing.add(title); added++; total++;
    }
  }catch(e){ summary.push(`${cfg.q} 오류`); }
  summary.push(`${cfg.q} → +${added}`); await sleep(250);
}
fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
console.log(summary.join('\n')); console.log('총 추가:',total);
let eco=0,tot=0; for(const s of['store','lib'])for(const g of['유아','초등'])for(const b of books[s][g]){tot++;if(b[4]==='경제·금융')eco++;}
console.log('경제·금융 총',eco,'권 · 전체',tot);
