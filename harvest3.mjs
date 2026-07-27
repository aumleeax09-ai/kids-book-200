import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root, 'books.json'), 'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root, 'covers.json'), 'utf8'));

const Q = [
 {q:'정승각', g:'유아', s:'lib', c:'그림책', age:'5~7세', cap:6, why:'우리 정서를 개성 있게 그린 정승각의 그림책.', e:'전통·정서'},
 {q:'김동성 그림', g:'유아', s:'lib', c:'그림책', age:'5~7세', cap:6, why:'서정적인 그림으로 사랑받는 김동성의 그림책.', e:'정서·감수성'},
 {q:'강경수 그림책', g:'유아', s:'store', c:'그림책', age:'4~6세', cap:6, why:'재치와 상상이 돋보이는 강경수의 그림책.', e:'상상력·유머'},
 {q:'서정오 옛이야기', g:'유아', s:'lib', c:'전래·전통', age:'5~7세', cap:8, why:'입말을 살려 들려주는 서정오의 우리 옛이야기.', e:'전래·우리말'},
 {q:'한성옥 그림책', g:'유아', s:'lib', c:'그림책', age:'5~7세', cap:5, why:'품격 있는 그림으로 이야기를 그린 한성옥의 그림책.', e:'감수성·예술'},
 {q:'류재수', g:'유아', s:'lib', c:'그림책', age:'5~7세', cap:4, why:'우리 자연과 신화를 웅장하게 그린 그림책.', e:'자연·전통'},
 {q:'김유 동화', g:'유아', s:'store', c:'창작동화', age:'6~8세', cap:6, why:'웃음과 용기를 주는 김유의 저학년 이야기.', e:'용기·재미'},
 {q:'김남중', g:'초등', s:'lib', c:'창작동화', age:'10~12세', cap:8, why:'시대와 삶을 힘 있게 그린 김남중의 동화.', e:'역사·공동체'},
 {q:'한윤섭', g:'초등', s:'lib', c:'창작동화', age:'10~12세', cap:6, why:'울림 있는 이야기로 상을 받은 한윤섭의 동화.', e:'공감·성찰'},
 {q:'이현 동화', g:'초등', s:'store', c:'창작동화', age:'9~12세', cap:6, why:'모험과 성장을 그린 이현의 인기 동화.', e:'모험·성장'},
 {q:'강무홍', g:'초등', s:'lib', c:'창작동화', age:'8~11세', cap:6, why:'따뜻한 시선으로 아이를 그린 강무홍의 동화.', e:'공감·성장'}
];

const CAP_GROUP = 500;
const BAD = /(스티커북|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|워크|가이드북|지도서|문제집|사운드북)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const coverRe = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;

let total=0; const summary=[];
for (const cfg of Q) {
  const gCount=()=>books.store[cfg.g].length+books.lib[cfg.g].length;
  if (gCount()>=CAP_GROUP) { summary.push(`${cfg.q} → skip`); continue; }
  let added=0;
  try{
    const url='https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord='+encodeURIComponent(cfg.q);
    const res=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}});
    const html=await res.text();
    const covPos=[]; let cm; coverRe.lastIndex=0; while((cm=coverRe.exec(html))!==null) covPos.push([cm.index,cm[0]]);
    const bo3=/class="bo3">([^<]+)<\/a>/g; let m;
    while((m=bo3.exec(html))!==null){
      if(added>=cfg.cap||gCount()>=CAP_GROUP) break;
      const title=m[1].trim().replace(/\s+/g,' ');
      if(BAD.test(title)||existing.has(title)) continue;
      const chunk=html.slice(m.index,m.index+700);
      const am=chunk.match(/AuthorSearch=[^>]*>\s*([^<]+?)\s*<\/a>\s*\(지은이\)/)||chunk.match(/AuthorSearch=[^>]*>\s*([^<]+?)\s*<\/a>/);
      const pm=chunk.match(/PublisherSearch=[^>]*>\s*([^<]+?)\s*<\/[Aa]>/);
      const author=am?am[1].trim():'', pub=pm?pm[1].trim():'';
      if(!author||!pub) continue;
      let cv=''; for(const [p,u] of covPos){ if(p<m.index) cv=u; else break; }
      const fn=(cv.match(/\/cover\d+\/([^\/]+?)\.(?:jpg|gif|png)/)||[])[1]||'';
      const im=fn.match(/^([0-9]{9}[0-9Xx])/);
      if(cv) covers[title]={img:cv,isbn:im?im[1]:''};
      books[cfg.s][cfg.g].push([title,author,pub,cfg.age,cfg.c,4,cfg.why,cfg.e]);
      existing.add(title); added++; total++;
    }
  }catch(e){ summary.push(`${cfg.q} 오류`); }
  summary.push(`${cfg.q} → +${added}`); await sleep(250);
}
fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
console.log(summary.join('\n')); console.log('총 추가:',total);
console.log('유치원',books.store['유아'].length+books.lib['유아'].length,'· 초등',books.store['초등'].length+books.lib['초등'].length);
