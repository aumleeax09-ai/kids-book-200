import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));

// 8세(초등 저학년) — 분야별 추가 (age 범위가 8세를 포함하도록)
const Q = [
 {q:'프란치스카 비어만', c:'창작동화', age:'8~10세', cap:6, why:'책 먹는 여우로 유명한 프란치스카 비어만의 유쾌한 동화.', e:'독서·상상·유머'},
 {q:'콩닥콩닥 짝 바꾸는 날', c:'창작동화', age:'8~10세', cap:6, why:'교실 짝꿍 이야기로 공감을 주는 저학년 동화.', e:'학교·공감'},
 {q:'신기한 스쿨버스 키즈', c:'과학', age:'8~10세', cap:10, why:'프리즐 선생님과 떠나는 과학 탐험 저학년판.', e:'과학·탐구'},
 {q:'무민', c:'창작동화', age:'8~11세', cap:8, why:'무민 골짜기의 사랑스러운 이야기 시리즈.', e:'상상력·우정'},
 {q:'처음 한국사', c:'역사', age:'8~11세', cap:8, why:'저학년이 처음 만나는 한국사 이야기.', e:'역사·기초'},
 {q:'처음 세계사', c:'역사', age:'8~11세', cap:6, why:'저학년이 처음 만나는 세계사 이야기.', e:'세계사·기초'},
 {q:'어린이 경제 동화', c:'경제·금융', age:'8~11세', cap:8, why:'용돈·저축 등 경제를 이야기로 배우는 동화.', e:'경제·자기관리'},
 {q:'저학년 전래동화', c:'전래·전통', age:'8~10세', cap:8, why:'저학년 눈높이로 들려주는 우리 옛이야기.', e:'전래·전통'},
 {q:'처음 과학', c:'과학', age:'8~11세', cap:8, why:'저학년이 처음 만나는 과학 이야기.', e:'과학·호기심'},
 {q:'아홉 살 마음 박성우', c:'인성', age:'8~10세', cap:5, why:'아홉 살 마음을 다독이는 박성우의 어린이 책.', e:'감정·자기이해'},
 {q:'저학년 인물 이야기', c:'위인·인물', age:'8~11세', cap:6, why:'저학년이 읽기 좋은 인물 이야기.', e:'위인·롤모델'}
];

const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|퍼즐|엽서|드릴|기출|평가|익힘|전과)/;
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
// 8세 포함 초등 도서 수
let cnt8=0; for(const b of books.store['초등'].concat(books.lib['초등'])){const [mn,mx]=(b[3].match(/\d+/g)||[]).map(Number); if(mn<=8&&8<=(mx||mn))cnt8++;}
console.log('8세 포함 초등 도서:',cnt8,'권');
