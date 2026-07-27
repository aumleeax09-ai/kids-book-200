import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));

// 8세 분야 보강(영어·위인·사회·인성·과학) + 유아 영어/자연 보강
const Q = [
 {q:'옥스포드 리딩 트리', c:'영어', age:'7~10세', cap:12, why:'단계별로 읽는 대표 영어 리더스 ORT 시리즈.', e:'영어 읽기·다독'},
 {q:'리틀팍스 영어동화', c:'영어', age:'7~10세', cap:8, why:'영어 동화로 익히는 리틀팍스 시리즈.', e:'영어 듣기·읽기'},
 {q:'저학년 위인전', c:'위인·인물', age:'8~11세', cap:8, why:'저학년 눈높이로 만나는 인물 이야기.', e:'위인·롤모델'},
 {q:'새싹 인물전', c:'위인·인물', age:'8~11세', cap:6, why:'처음 읽는 인물 이야기 시리즈.', e:'위인·롤모델'},
 {q:'처음 인물 그림책', c:'위인·인물', age:'7~10세', cap:6, why:'그림으로 만나는 인물 이야기.', e:'위인·롤모델'},
 {q:'어린이 사회 동화', c:'사회', age:'8~11세', cap:8, why:'규칙과 더불어 살기를 배우는 사회 동화.', e:'사회성·시민의식'},
 {q:'저학년 과학동화', c:'과학', age:'8~10세', cap:8, why:'저학년이 즐기는 과학 동화.', e:'과학·호기심'},
 {q:'어린이 인성 동화', c:'인성', age:'8~11세', cap:8, why:'바른 마음과 습관을 기르는 인성 동화.', e:'인성·습관'},
 {q:'노부영', g:'유아', c:'영어', age:'4~7세', cap:12, why:'노래로 부르는 영어동화(노부영) 시리즈.', e:'영어 노출·리듬'},
 {q:'세밀화로 그린 보리 아기그림책', g:'유아', s:'lib', c:'자연·환경', age:'3~6세', cap:8, why:'세밀화로 자연을 관찰하는 보리 아기그림책.', e:'자연 관찰·감수성'}
];

const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|퍼즐|엽서|드릴|기출|평가|익힘|전과|단어장|사전)/;
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
  summary.push(`${cfg.q}(${cfg.c}) → +${added}`); await sleep(250);
}
fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
console.log(summary.join('\n')); console.log('총 추가:',total);
const catN={}; let tot=0; for(const s of['store','lib'])for(const g of['유아','초등'])for(const b of books[s][g]){tot++;catN[b[4]]=(catN[b[4]]||0)+1;}
console.log('전체',tot,'· 영어',catN['영어'],'· 위인·인물',catN['위인·인물'],'· 사회',catN['사회'],'· 자연·환경',catN['자연·환경']);
