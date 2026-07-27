import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));

// 도서관(사서·연구회) 비중 확대 — 문학·수상·명작 작가 (source=lib)
const Q = [
 {q:'존 클라센', g:'유아', c:'그림책', age:'5~7세', cap:6, why:'위트 있는 반전이 돋보이는 존 클라센의 그림책.', e:'유머·사고력'},
 {q:'맥 바넷', g:'유아', c:'그림책', age:'5~7세', cap:6, why:'기발한 이야기로 상을 받은 맥 바넷의 그림책.', e:'상상력·유머'},
 {q:'유타 바우어', g:'유아', c:'인성', age:'4~6세', cap:5, why:'감정을 섬세하게 그린 유타 바우어의 그림책.', e:'감정·공감'},
 {q:'아놀드 로벨', g:'유아', c:'창작동화', age:'6~8세', cap:6, why:'개구리와 두꺼비로 유명한 아놀드 로벨의 이야기.', e:'우정·읽기 자립'},
 {q:'토미 드 파올라', g:'유아', c:'그림책', age:'5~7세', cap:5, why:'따뜻한 가족 이야기를 그린 토미 드 파올라의 그림책.', e:'가족·정서'},
 {q:'김재홍 그림책', g:'유아', c:'그림책', age:'5~7세', cap:5, why:'우리 역사와 자연을 서정적으로 담은 그림책.', e:'역사·감수성'},
 {q:'정순희 그림책', g:'유아', c:'그림책', age:'5~7세', cap:5, why:'정갈한 그림으로 이야기를 그린 정순희의 그림책.', e:'감수성·정서'},
 {q:'이영경 그림책', g:'유아', c:'전래·전통', age:'5~7세', cap:5, why:'옛이야기의 멋을 살린 이영경의 그림책.', e:'전래·해학'},
 {q:'임정진', g:'유아', c:'창작동화', age:'5~7세', cap:5, why:'재치와 상상이 담긴 임정진의 이야기.', e:'상상력·재미'},
 {q:'볼프 에를브루흐', g:'유아', c:'그림책', age:'5~7세', cap:5, why:'삶과 죽음도 담담히 그린 볼프 에를브루흐의 그림책.', e:'성찰·정서'},
 {q:'헬메 하이네', g:'유아', c:'그림책', age:'4~6세', cap:5, why:'따뜻한 우정을 그린 헬메 하이네의 그림책.', e:'우정·정서'},
 {q:'피터 시스', g:'유아', c:'그림책', age:'6~8세', cap:5, why:'섬세한 그림으로 세계를 담은 피터 시스의 그림책.', e:'예술·상상'},
 {q:'김세현 그림책', g:'유아', c:'전래·전통', age:'5~7세', cap:5, why:'우리 그림의 멋이 살아 있는 김세현의 그림책.', e:'전통·감수성'},
 {q:'케이트 디카밀로', g:'초등', c:'창작동화', age:'9~12세', cap:8, why:'울림 있는 이야기로 사랑받는 케이트 디카밀로의 동화.', e:'공감·성장'},
 {q:'캐서린 패터슨', g:'초등', c:'창작동화', age:'10~12세', cap:6, why:'깊은 우정과 성장을 그린 캐서린 패터슨의 동화.', e:'우정·성장'},
 {q:'로이스 로리', g:'초등', c:'창작동화', age:'10~12세', cap:6, why:'생각할 거리를 주는 로이스 로리의 동화.', e:'사고력·성찰'},
 {q:'김소연 동화', g:'초등', c:'역사', age:'10~12세', cap:6, why:'시대를 살아가는 아이를 그린 김소연의 역사 동화.', e:'역사·성장'},
 {q:'배유안', g:'초등', c:'역사', age:'10~12세', cap:6, why:'역사 속 이야기를 생생히 그린 배유안의 동화.', e:'역사·문해력'},
 {q:'손연자', g:'초등', c:'역사', age:'10~12세', cap:5, why:'역사의 아픔을 담담히 전하는 손연자의 동화.', e:'역사·인권'},
 {q:'원유순', g:'초등', c:'창작동화', age:'9~12세', cap:6, why:'따뜻한 시선으로 아이를 그린 원유순의 동화.', e:'공감·성장'},
 {q:'고수산나', g:'초등', c:'역사', age:'9~12세', cap:6, why:'역사와 문화를 이야기로 풀어낸 고수산나의 동화.', e:'역사·문화'},
 {q:'최재천 어린이', g:'초등', c:'과학', age:'9~12세', cap:6, why:'생명과 자연의 소중함을 알려 주는 과학 이야기.', e:'생태·과학'},
 {q:'이지유', g:'초등', c:'과학', age:'9~12세', cap:6, why:'쉽고 재미있게 과학을 풀어낸 이지유의 책.', e:'과학·호기심'},
 {q:'엘리너 에스테스', g:'초등', c:'창작동화', age:'9~12세', cap:4, why:'따돌림과 우정을 그린 고전 《백 벌의 드레스》의 작가.', e:'공감·배려'}
];

const CAP_GROUP = 720;
const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|영어원서|퍼즐)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const coverRe = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;

let total=0; const summary=[];
for (const cfg of Q) {
  const gCount=()=>books.store[cfg.g].length+books.lib[cfg.g].length;
  if (gCount()>=CAP_GROUP){ summary.push(`${cfg.q} → skip`); continue; }
  let added=0;
  try{
    const url='https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord='+encodeURIComponent(cfg.q);
    const html=await (await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}})).text();
    const covPos=[]; let cm; coverRe.lastIndex=0; while((cm=coverRe.exec(html))!==null) covPos.push([cm.index,cm[0]]);
    const bo3=/class="bo3">([^<]+)<\/a>/g; let m;
    while((m=bo3.exec(html))!==null){
      if(added>=cfg.cap||gCount()>=CAP_GROUP) break;
      const title=m[1].trim().replace(/\s+/g,' ');
      if(BAD.test(title)||existing.has(title)) continue;
      const chunk=html.slice(m.index,m.index+700);
      const am=chunk.match(/AuthorSearch=[^>]*>\s*([^<]+?)\s*<\/a>\s*\(지은이\)/)||chunk.match(/AuthorSearch=[^>]*>\s*([^<]+?)\s*<\/a>/);
      const pm=chunk.match(/PublisherSearch=[^>]*>\s*([^<]+?)\s*<\/[Aa]>/);
      if(!am||!pm) continue;
      const author=am[1].trim(), pub=pm[1].trim();
      let cv=''; for(const [p,u] of covPos){ if(p<m.index) cv=u; else break; }
      const fn=(cv.match(/\/cover\d+\/([^\/]+?)\.(?:jpg|gif|png)/)||[])[1]||'';
      const im=fn.match(/^([0-9]{9}[0-9Xx])/);
      if(cv) covers[title]={img:cv,isbn:im?im[1]:''};
      books.lib[cfg.g].push([title,author,pub,cfg.age,cfg.c,4,cfg.why,cfg.e]);
      existing.add(title); added++; total++;
    }
  }catch(e){ summary.push(`${cfg.q} 오류`); }
  summary.push(`${cfg.q} → +${added}`); await sleep(250);
}
fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
console.log(summary.join('\n')); console.log('총 추가:',total);
for(const s of['store','lib'])for(const g of['유아','초등'])console.log(`  ${s}.${g}=${books[s][g].length}`);
console.log('서점',books.store['유아'].length+books.store['초등'].length,'· 도서관',books.lib['유아'].length+books.lib['초등'].length);
