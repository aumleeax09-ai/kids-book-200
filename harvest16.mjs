import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));
const A = '8~10세';
// 8~9세 도서관(lib) 보강 — 대출 많은 저학년 스테디셀러·수상작·교과수록·추천도서
const Q = [
 {q:'일수의 탄생', c:'창작동화'},
 {q:'칠판 앞에 나가기 싫어', c:'창작동화'},
 {q:'교과서 수록 동화 저학년', c:'창작동화'},
 {q:'온작품읽기 저학년', c:'창작동화'},
 {q:'슬로리딩 동화', c:'창작동화'},
 {q:'저학년 수상 동화', c:'창작동화'},
 {q:'저학년 추천 동화', c:'창작동화'},
 {q:'학교도서관 저학년', c:'창작동화'},
 {q:'어린이 문학상 저학년', c:'창작동화'},
 {q:'사계절 저학년문고', c:'창작동화'},
 {q:'이현주 동화', c:'창작동화'},
 {q:'정란희 동화', c:'창작동화'},
 {q:'서석영 동화', c:'창작동화'},
 {q:'김일광 동화', c:'창작동화'},
 {q:'박정선 동화', c:'인성'},
 {q:'정연숙 동화', c:'창작동화'},
 {q:'김개미 동화', c:'창작동화'},
 {q:'임태희 동화', c:'창작동화'},
 {q:'문영숙 동화', c:'역사'},
 {q:'김해등 동화', c:'창작동화'},
 {q:'선안나 저학년', c:'창작동화'},
 {q:'고재현 동화', c:'창작동화'}
];
const TARGET = 120, CAP = 12;
const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|퍼즐|엽서|드릴|기출|평가|익힘|전과|단어장|사전|받아쓰기|급수|따라쓰기)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const coverRe = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;
let total=0; const summary=[];
for (const cfg of Q) {
  if (total >= TARGET) break;
  let added=0;
  try{
    const url='https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord='+encodeURIComponent(cfg.q);
    const html=await (await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}})).text();
    const covPos=[]; let cm; coverRe.lastIndex=0; while((cm=coverRe.exec(html))!==null) covPos.push([cm.index,cm[0]]);
    const bo3=/class="bo3">([^<]+)<\/a>/g; let m;
    while((m=bo3.exec(html))!==null){
      if(added>=CAP || total>=TARGET) break;
      const title=m[1].trim().replace(/\s+/g,' ');
      if(title.length<2||BAD.test(title)||existing.has(title)) continue;
      const chunk=html.slice(m.index,m.index+700);
      const am=chunk.match(/AuthorSearch=[^>]*>\s*([^<]+?)\s*<\/a>\s*\(지은이\)/)||chunk.match(/AuthorSearch=[^>]*>\s*([^<]+?)\s*<\/a>/);
      const pm=chunk.match(/PublisherSearch=[^>]*>\s*([^<]+?)\s*<\/[Aa]>/);
      if(!am||!pm) continue;
      let cv=''; for(const [p,u] of covPos){ if(p<m.index) cv=u; else break; }
      const fn=(cv.match(/\/cover\d+\/([^\/]+?)\.(?:jpg|gif|png)/)||[])[1]||'';
      const im=fn.match(/^([0-9]{9}[0-9Xx])/);
      if(cv) covers[title]={img:cv,isbn:im?im[1]:''};
      books.lib['초등'].push([title, am[1].trim(), pm[1].trim(), A, cfg.c, 4, '도서관에서 꾸준히 사랑받는 저학년 '+cfg.c+' 추천도서.', '읽기·'+cfg.c]);
      existing.add(title); added++; total++;
    }
  }catch(e){ summary.push(`${cfg.q} 오류`); }
  summary.push(`${cfg.q} → +${added} (누적 ${total})`); await sleep(220);
}
fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
console.log(summary.join('\n')); console.log('추가:',total,'· lib.초등',books.lib['초등'].length);
