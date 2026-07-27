import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));

// 초등 서점(베스트셀러) 확대 — 인기 시리즈 + 베스트셀러 작가 (group=초등, source=store)
const Q = [
 {q:'쿠키런', c:'학습서', age:'8~12세', cap:14, why:'인기 게임 캐릭터와 함께 배우는 쿠키런 학습만화 시리즈.', e:'학습·흥미'},
 {q:'보물찾기 아이세움', c:'학습서', age:'9~12세', cap:14, why:'세계·한국의 역사와 문화를 보물찾기로 익히는 인기 시리즈.', e:'역사·문화·흥미'},
 {q:'그램그램 영문법', c:'영어', age:'9~12세', cap:10, why:'만화로 영문법을 익히는 그램그램 시리즈.', e:'영어·문법'},
 {q:'안녕 자두야', c:'창작동화', age:'8~11세', cap:10, why:'자두네 가족의 일상을 담은 인기 만화 시리즈.', e:'유머·일상'},
 {q:'코믹 한국사', c:'학습서', age:'8~12세', cap:10, why:'한국사를 만화로 즐기는 학습 시리즈.', e:'역사·흥미'},
 {q:'코믹 메이플스토리', c:'학습서', age:'8~12세', cap:12, why:'메이플스토리 캐릭터와 함께하는 인기 학습만화.', e:'학습·흥미'},
 {q:'송언 동화', c:'창작동화', age:'8~10세', cap:8, why:'학교 이야기를 정겹게 그린 송언의 동화.', e:'학교·공감'},
 {q:'임지형 동화', c:'창작동화', age:'9~12세', cap:8, why:'기발한 상상으로 사랑받는 임지형의 동화.', e:'상상력·재미'},
 {q:'서지원 동화', c:'창작동화', age:'8~11세', cap:8, why:'재미와 지식을 함께 담은 서지원의 동화.', e:'재미·지식'},
 {q:'박신식', c:'창작동화', age:'9~12세', cap:6, why:'감동과 재미를 주는 박신식의 어린이 책.', e:'공감·성장'},
 {q:'김영주 동화', c:'창작동화', age:'8~10세', cap:6, why:'짜장 짬뽕 탕수육 등 학교 이야기로 인기인 김영주의 동화.', e:'학교·공감'},
 {q:'강효미 동화', c:'창작동화', age:'8~10세', cap:6, why:'유쾌한 이야기로 사랑받는 강효미의 저학년 동화.', e:'유머·재미'},
 {q:'이은재 동화', c:'창작동화', age:'8~11세', cap:8, why:'잘못 뽑은 반장으로 유명한 이은재의 유쾌한 동화.', e:'유머·성장'},
 {q:'추리 천재 엉덩이 탐정', c:'창작동화', age:'8~10세', cap:8, why:'수수께끼를 풀며 즐기는 인기 추리 시리즈.', e:'추리·집중력'}
];

const STORE_CHO_CAP = 520; // 초등 서점 상한
const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|퍼즐|엽서)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const coverRe = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;
let total=0; const summary=[];
for (const cfg of Q) {
  if (books.store['초등'].length >= STORE_CHO_CAP) { summary.push(`${cfg.q} → skip(상한)`); continue; }
  let added=0;
  try{
    const url='https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord='+encodeURIComponent(cfg.q);
    const html=await (await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}})).text();
    const covPos=[]; let cm; coverRe.lastIndex=0; while((cm=coverRe.exec(html))!==null) covPos.push([cm.index,cm[0]]);
    const bo3=/class="bo3">([^<]+)<\/a>/g; let m;
    while((m=bo3.exec(html))!==null){
      if(added>=cfg.cap||books.store['초등'].length>=STORE_CHO_CAP) break;
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
  summary.push(`${cfg.q} → +${added}`); await sleep(250);
}
fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
console.log(summary.join('\n')); console.log('총 추가:',total);
console.log('초등 서점',books.store['초등'].length,'· 초등 도서관',books.lib['초등'].length,'· 초등 합계',books.store['초등'].length+books.lib['초등'].length);
const st=books.store['유아'].length+books.store['초등'].length, lb=books.lib['유아'].length+books.lib['초등'].length;
console.log('서점',st,'· 도서관',lb,'· 총',st+lb);
