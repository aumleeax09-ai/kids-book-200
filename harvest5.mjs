import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));

// 도서관(lib) 추가 확대 — 명작·수상·문학·과학 작가
const Q = [
 {q:'올리버 제퍼스', g:'유아', c:'그림책', age:'4~6세', cap:8, why:'따뜻한 상상이 가득한 올리버 제퍼스의 그림책.', e:'상상력·정서'},
 {q:'에런 베커', g:'유아', c:'그림책', age:'5~7세', cap:5, why:'글 없이 상상의 세계를 여는 에런 베커의 여행 그림책.', e:'상상력·창의'},
 {q:'브라이언 와일드스미스', g:'유아', c:'그림책', age:'4~6세', cap:5, why:'화려한 색채로 사랑받는 브라이언 와일드스미스의 그림책.', e:'색·자연·예술'},
 {q:'이와사키 치히로', g:'유아', c:'그림책', age:'4~6세', cap:5, why:'맑고 서정적인 수채 그림으로 유명한 이와사키 치히로의 그림책.', e:'감수성·정서'},
 {q:'홍성찬 그림책', g:'유아', c:'전래·전통', age:'5~7세', cap:5, why:'우리 옛 정취를 정교하게 담은 홍성찬의 그림책.', e:'전통·역사·관찰'},
 {q:'조혜란 그림책', g:'유아', c:'전래·전통', age:'5~7세', cap:5, why:'해학이 넘치는 우리 그림으로 옛이야기를 그렸다.', e:'전래·해학'},
 {q:'한병호 그림책', g:'유아', c:'그림책', age:'5~7세', cap:5, why:'상상력 넘치는 그림으로 상을 받은 한병호의 그림책.', e:'상상력·예술'},
 {q:'이형진 그림책', g:'유아', c:'전래·전통', age:'5~7세', cap:5, why:'우리 옛이야기를 개성 있게 그린 이형진의 그림책.', e:'전래·감수성'},
 {q:'김병하 그림책', g:'유아', c:'그림책', age:'5~7세', cap:5, why:'잔잔한 그림으로 마음을 그린 김병하의 그림책.', e:'정서·공감'},
 {q:'나카가와 리에코', g:'유아', c:'창작동화', age:'4~6세', cap:5, why:'구리와 구라로 사랑받는 나카가와 리에코의 그림책.', e:'상상력·협동'},
 {q:'크베타 파코브스카', g:'유아', c:'그림책', age:'5~7세', cap:4, why:'예술적인 조형으로 유명한 크베타 파코브스카의 그림책.', e:'예술·상상'},
 {q:'백남원 그림책', g:'유아', c:'그림책', age:'5~7세', cap:4, why:'따뜻한 그림으로 우리 이야기를 담은 그림책.', e:'정서·전통'},
 {q:'아스트리드 린드그렌', g:'초등', c:'창작동화', age:'9~12세', cap:8, why:'삐삐·에밀 등으로 사랑받는 린드그렌의 명작 동화.', e:'상상력·자유·용기'},
 {q:'마이클 모퍼고', g:'초등', c:'창작동화', age:'10~12세', cap:8, why:'전쟁과 우정을 감동적으로 그린 마이클 모퍼고의 동화.', e:'공감·용기·평화'},
 {q:'E.L. 코닉스버그', g:'초등', c:'창작동화', age:'10~12세', cap:5, why:'뉴베리상에 빛나는 코닉스버그의 지적인 동화.', e:'사고력·성장'},
 {q:'공지희', g:'초등', c:'창작동화', age:'9~12세', cap:5, why:'영모가 사라졌다로 유명한 공지희의 판타지 동화.', e:'상상력·공감'},
 {q:'김기정 동화', g:'초등', c:'창작동화', age:'8~11세', cap:6, why:'입담 좋은 이야기로 사랑받는 김기정의 동화.', e:'유머·상상'},
 {q:'김해원 동화', g:'초등', c:'창작동화', age:'10~12세', cap:5, why:'섬세한 시선으로 삶을 그린 김해원의 동화.', e:'공감·성장'},
 {q:'최양선', g:'초등', c:'창작동화', age:'10~12세', cap:5, why:'상상과 현실을 넘나드는 최양선의 동화.', e:'상상력·성찰'},
 {q:'남찬숙', g:'초등', c:'창작동화', age:'9~12세', cap:5, why:'외로움과 성장을 그린 남찬숙의 동화.', e:'공감·성장'},
 {q:'자클린 윌슨', g:'초등', c:'창작동화', age:'10~12세', cap:6, why:'현실 속 아이의 마음을 솔직하게 그린 자클린 윌슨의 동화.', e:'공감·자존감'},
 {q:'권수진 김성화', g:'초등', c:'과학', age:'8~11세', cap:6, why:'재미있게 과학을 풀어낸 김성화·권수진의 과학책.', e:'과학·호기심'},
 {q:'소이언', g:'초등', c:'과학', age:'9~12세', cap:5, why:'과학과 세상을 잇는 소이언의 어린이 교양서.', e:'과학·사고력'},
 {q:'딕 킹스미스', g:'초등', c:'창작동화', age:'9~12세', cap:5, why:'꼬마 돼지 베이브로 유명한 딕 킹스미스의 동물 동화.', e:'동물·용기·유머'}
];

const CAP_GROUP = 820;
const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|영어원서|퍼즐|엽서)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const coverRe = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;
let total=0; const summary=[];
for (const cfg of Q) {
  if (cfg.g !== '초등') continue; // 초등학생 도서관 비중 집중 확대
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
      let cv=''; for(const [p,u] of covPos){ if(p<m.index) cv=u; else break; }
      const fn=(cv.match(/\/cover\d+\/([^\/]+?)\.(?:jpg|gif|png)/)||[])[1]||'';
      const im=fn.match(/^([0-9]{9}[0-9Xx])/);
      if(cv) covers[title]={img:cv,isbn:im?im[1]:''};
      books.lib[cfg.g].push([title,am[1].trim(),pm[1].trim(),cfg.age,cfg.c,4,cfg.why,cfg.e]);
      existing.add(title); added++; total++;
    }
  }catch(e){ summary.push(`${cfg.q} 오류`); }
  summary.push(`${cfg.q} → +${added}`); await sleep(250);
}
fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
console.log(summary.join('\n')); console.log('총 추가:',total);
const st=books.store['유아'].length+books.store['초등'].length, lb=books.lib['유아'].length+books.lib['초등'].length;
console.log('서점',st,'· 도서관',lb,'· 총',st+lb);
