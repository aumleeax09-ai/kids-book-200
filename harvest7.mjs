import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));

// 수학 분야 확대 — 수학 그림책·학습만화·수학 동화
const Q = [
 {q:'코믹 메이플스토리 수학도둑', g:'초등', s:'store', c:'수학', age:'8~12세', cap:14, why:'게임 캐릭터와 수학 개념을 익히는 인기 학습만화.', e:'수학 개념·흥미'},
 {q:'쿠키런 수학런', g:'초등', s:'store', c:'수학', age:'8~12세', cap:12, why:'쿠키런 캐릭터와 함께 배우는 수학 학습만화.', e:'수학·흥미'},
 {q:'매스 스타트', g:'유아', s:'lib', c:'수학', age:'5~8세', cap:14, why:'생활 속 상황으로 수 개념을 익히는 수학 그림책 시리즈.', e:'수 개념·기초 수학'},
 {q:'안노 미쓰마사 수학', g:'유아', s:'lib', c:'수학', age:'5~8세', cap:8, why:'수와 논리의 아름다움을 그린 안노 미쓰마사의 수학 그림책.', e:'수 개념·논리·상상'},
 {q:'그레그 탱 수학', g:'초등', s:'lib', c:'수학', age:'7~10세', cap:6, why:'게임처럼 즐기는 그레그 탱의 수학 그림책.', e:'연산·수 감각'},
 {q:'수학 유령', g:'초등', s:'store', c:'수학', age:'9~12세', cap:8, why:'이야기로 즐기는 수학 판타지 시리즈.', e:'수학·흥미'},
 {q:'마법천자문 수학원정대', g:'초등', s:'store', c:'수학', age:'8~11세', cap:8, why:'마법천자문 세계관의 수학 학습만화.', e:'수학·흥미'},
 {q:'수학동화', g:'유아', s:'store', c:'수학', age:'5~8세', cap:10, why:'이야기로 수 개념을 익히는 수학 동화.', e:'수 개념·기초'},
 {q:'재미있는 수학', g:'초등', s:'lib', c:'수학', age:'9~12세', cap:8, why:'수학을 넓은 눈으로 보게 하는 교양 수학책.', e:'수학적 사고'},
 {q:'초등 수학 이야기', g:'초등', s:'lib', c:'수학', age:'8~12세', cap:8, why:'개념을 이야기로 풀어낸 초등 수학책.', e:'수학 개념·이해'}
];

const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|퍼즐|엽서|드릴|연산 문제|기출|평가|단원평가|익힘)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const coverRe = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;
let total=0; const summary=[];
for (const cfg of Q) {
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
      books[cfg.s][cfg.g].push([title,am[1].trim(),pm[1].trim(),cfg.age,cfg.c,4,cfg.why,cfg.e]);
      existing.add(title); added++; total++;
    }
  }catch(e){ summary.push(`${cfg.q} 오류`); }
  summary.push(`${cfg.q} → +${added}`); await sleep(250);
}
fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
console.log(summary.join('\n')); console.log('총 추가:',total);
let mathN=0,tot=0; for(const s of['store','lib'])for(const g of['유아','초등'])for(const b of books[s][g]){tot++;if(b[4]==='수학')mathN++;}
console.log('수학 분야 총',mathN,'권 · 전체',tot);
