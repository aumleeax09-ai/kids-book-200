import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));

// 8~9세(초등 저학년) 보강 — 저학년 창작·과학·역사·명작 (age가 8~9 포함)
const Q = [
 {q:'홍민정 동화', c:'창작동화', age:'8~10세', cap:8, why:'고양이 해결사 깜냥 등 인기 저학년 동화.', e:'추리·재미'},
 {q:'박효미 동화', c:'창작동화', age:'8~10세', cap:6, why:'일기 도서관 등 따뜻한 저학년 동화.', e:'글쓰기·공감'},
 {q:'임정자 동화', c:'창작동화', age:'8~10세', cap:6, why:'재치와 상상이 담긴 임정자의 저학년 동화.', e:'상상력·재미'},
 {q:'채화영 동화', c:'인성', age:'8~11세', cap:6, why:'생활 속 고민을 다룬 채화영의 어린이 책.', e:'생활·인성'},
 {q:'받침 없는 동화', c:'창작동화', age:'7~9세', cap:8, why:'읽기 시작하는 아이를 위한 받침 없는 동화.', e:'읽기·자립'},
 {q:'저학년 창작동화', c:'창작동화', age:'8~10세', cap:10, why:'초등 저학년이 즐기는 창작동화.', e:'상상력·공감'},
 {q:'처음 과학동화', c:'과학', age:'8~10세', cap:8, why:'저학년이 처음 만나는 과학 동화.', e:'과학·호기심'},
 {q:'저학년 한국사', c:'역사', age:'8~11세', cap:8, why:'저학년 눈높이의 한국사 이야기.', e:'역사·기초'},
 {q:'저학년 세계명작', c:'창작동화', age:'8~11세', cap:8, why:'저학년이 읽기 좋은 세계 명작.', e:'문학·상상'},
 {q:'강정연 동화', c:'창작동화', age:'8~11세', cap:6, why:'건방진 도도군 등으로 사랑받는 강정연의 동화.', e:'성장·유머'}
];

const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|퍼즐|엽서|드릴|기출|평가|익힘|전과|단어장|사전|스케치북|받아쓰기)/;
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
      books.store['초등'].push([title,am[1].trim(),pm[1].trim(),cfg.age,cfg.c,4,cfg.why,cfg.e]);
      existing.add(title); added++; total++;
    }
  }catch(e){ summary.push(`${cfg.q} 오류`); }
  summary.push(`${cfg.q}(${cfg.c}) → +${added}`); await sleep(250);
}
fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
console.log(summary.join('\n')); console.log('총 추가:',total);
let c8=0,c9=0; for(const b of books.store['초등'].concat(books.lib['초등'])){const [mn,mx]=(b[3].match(/\d+/g)||[]).map(Number);const hi=mx||mn;if(mn<=8&&8<=hi)c8++;if(mn<=9&&9<=hi)c9++;}
console.log('8세 포함',c8,'· 9세 포함',c9,'· 전체',books.store['초등'].length+books.lib['초등'].length+books.store['유아'].length+books.lib['유아'].length);
