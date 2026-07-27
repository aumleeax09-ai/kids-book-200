import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));

// 자연·환경 확대 — 세밀화 자연관찰 · 환경 그림책 · 생태 동화
const Q = [
 {q:'세밀화로 그린 어린이 자연관찰', g:'유아', c:'자연·환경', age:'4~8세', cap:10, why:'세밀화로 자연을 관찰하는 그림책.', e:'자연 관찰·감수성'},
 {q:'보리 세밀화 도감', g:'초등', c:'자연·환경', age:'7~12세', cap:8, why:'세밀화로 그린 자연 도감 시리즈.', e:'생물 관찰·지식'},
 {q:'권혁도 세밀화', g:'유아', c:'자연·환경', age:'5~9세', cap:6, why:'곤충 세밀화로 유명한 권혁도의 자연 그림책.', e:'곤충·관찰'},
 {q:'이태수 세밀화', g:'유아', c:'자연·환경', age:'5~9세', cap:6, why:'섬세한 세밀화로 담은 자연 그림책.', e:'자연·관찰'},
 {q:'김성호 생태', g:'초등', c:'자연·환경', age:'9~12세', cap:6, why:'생태학자가 들려주는 생명 이야기.', e:'생태·과학'},
 {q:'이명애 그림책', g:'유아', c:'자연·환경', age:'6~9세', cap:5, why:'플라스틱 섬 등 환경을 그린 이명애의 그림책.', e:'환경·문제의식'},
 {q:'환경 그림책', g:'유아', c:'자연·환경', age:'5~9세', cap:10, why:'지구와 환경을 생각하게 하는 그림책.', e:'환경·감수성'},
 {q:'생태 동화', g:'초등', c:'자연·환경', age:'8~12세', cap:8, why:'생명과 자연을 이야기로 배우는 생태 동화.', e:'생태·공감'},
 {q:'지구 환경 동화', g:'초등', c:'자연·환경', age:'8~12세', cap:8, why:'기후·환경을 다룬 어린이 동화.', e:'환경·시민의식'},
 {q:'자연 관찰 그림책', g:'유아', c:'자연·환경', age:'4~8세', cap:8, why:'자연을 자세히 들여다보는 관찰 그림책.', e:'자연 관찰'}
];

const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|퍼즐|엽서|드릴|기출|평가|익힘|전과|단어장|사전|스케치북)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const coverRe = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;
let total=0; const summary=[];
for (const cfg of Q) {
  const g = cfg.g || '유아', s = cfg.s || 'lib';
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
let nat=0,tot=0; for(const s of['store','lib'])for(const g of['유아','초등'])for(const b of books[s][g]){tot++;if(b[4]==='자연·환경')nat++;}
console.log('자연·환경 총',nat,'권 · 전체',tot);
