import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));

const A = '8~10세';
// 초등 저학년(8~10세) 대량 보강 — 시리즈/작가/분야 (목표 500권)
const Q = [
 // 저학년 문고/시리즈 (창작동화)
 {q:'난 책읽기가 좋아', c:'창작동화', s:'store'},
 {q:'신나는 책읽기', c:'창작동화', s:'store'},
 {q:'저학년문고', c:'창작동화', s:'lib'},
 {q:'첫 읽기책', c:'창작동화', s:'lib'},
 {q:'저학년 창작동화', c:'창작동화', s:'store'},
 {q:'책읽는 가족 저학년', c:'창작동화', s:'lib'},
 {q:'1학년 동화', c:'창작동화', s:'store'},
 {q:'2학년 동화', c:'창작동화', s:'store'},
 {q:'3학년 동화', c:'창작동화', s:'store'},
 {q:'학교 동화', c:'창작동화', s:'store'},
 {q:'우정 동화', c:'창작동화', s:'lib'},
 {q:'가족 동화 저학년', c:'인성', s:'lib'},
 {q:'웃긴 동화 저학년', c:'창작동화', s:'store'},
 {q:'귀신 동화 저학년', c:'창작동화', s:'store'},
 {q:'저학년 판타지 동화', c:'창작동화', s:'store'},
 // 저학년 작가 (창작동화)
 {q:'이규희 동화', c:'창작동화', s:'lib'},
 {q:'김병규 동화', c:'창작동화', s:'lib'},
 {q:'조성자 동화', c:'창작동화', s:'store'},
 {q:'오미경 동화', c:'창작동화', s:'lib'},
 {q:'김옥 동화', c:'창작동화', s:'lib'},
 {q:'함영연 동화', c:'창작동화', s:'lib'},
 {q:'이가을 동화', c:'창작동화', s:'lib'},
 {q:'최은옥 동화', c:'창작동화', s:'store'},
 {q:'정옥 동화', c:'창작동화', s:'lib'},
 {q:'이송현 동화', c:'창작동화', s:'lib'},
 {q:'문선이 동화', c:'창작동화', s:'lib'},
 {q:'류호선 동화', c:'창작동화', s:'lib'},
 {q:'남호섭 동화', c:'창작동화', s:'lib'},
 {q:'신은영 동화', c:'창작동화', s:'store'},
 {q:'박채란 동화', c:'창작동화', s:'lib'},
 {q:'임근희 동화', c:'창작동화', s:'store'},
 {q:'이경혜 동화', c:'창작동화', s:'lib'},
 {q:'정하섭 동화', c:'창작동화', s:'lib'},
 {q:'김녹두 동화', c:'창작동화', s:'store'},
 {q:'최나미 동화', c:'창작동화', s:'lib'},
 {q:'김리리 동화', c:'창작동화', s:'store'},
 {q:'고대영 동화', c:'창작동화', s:'store'},
 {q:'채인선 동화', c:'인성', s:'lib'},
 {q:'선안나 동화', c:'창작동화', s:'lib'},
 {q:'하은경 동화', c:'창작동화', s:'store'},
 // 분야별 저학년
 {q:'저학년 과학 그림책', c:'과학', s:'lib'},
 {q:'과학 그림동화', c:'과학', s:'store'},
 {q:'공룡 동화', c:'과학', s:'store'},
 {q:'몸 과학 동화', c:'과학', s:'lib'},
 {q:'역사 인물 동화', c:'역사', s:'store'},
 {q:'저학년 역사 그림책', c:'역사', s:'lib'},
 {q:'감정 동화', c:'인성', s:'lib'},
 {q:'습관 동화', c:'인성', s:'store'},
 {q:'다문화 동화', c:'사회', s:'lib'},
 {q:'학교생활 동화', c:'사회', s:'store'},
 {q:'옛이야기 그림책', c:'전래·전통', s:'lib'},
 {q:'수학 그림책 저학년', c:'수학', s:'store'},
 {q:'동물 그림책', c:'자연·환경', s:'lib'},
 {q:'곤충 동화', c:'자연·환경', s:'lib'},
 {q:'저학년 위인 이야기', c:'위인·인물', s:'store'},
 {q:'한자 이야기', c:'한자', s:'store'},
 {q:'쉬운 영어 그림책', c:'영어', s:'store'},
 {q:'용돈 동화', c:'경제·금융', s:'store'}
];

const TARGET = 500, CAP = 12;
const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|퍼즐|엽서|드릴|기출|평가|익힘|전과|단어장|사전|받아쓰기|급수|따라쓰기|자격증|취업)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const coverRe = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;
let total=0; const summary=[];
for (const cfg of Q) {
  if (total >= TARGET) break;
  const s = cfg.s || 'store';
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
      books[s]['초등'].push([title, am[1].trim(), pm[1].trim(), A, cfg.c, 4, '초등 저학년(8~10세)이 읽기 좋은 '+cfg.c+' 책.', '읽기·'+cfg.c]);
      existing.add(title); added++; total++;
    }
  }catch(e){ summary.push(`${cfg.q} 오류`); }
  summary.push(`${cfg.q} → +${added} (누적 ${total})`); await sleep(220);
}
fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
console.log(summary.join('\n')); console.log('총 추가:',total);
let c810=0; for(const b of books.store['초등'].concat(books.lib['초등'])){const [mn,mx]=(b[3].match(/\d+/g)||[]).map(Number);const hi=mx||mn;if(mn<=10&&8<=hi)c810++;}
const tot=books.store['유아'].length+books.lib['유아'].length+books.store['초등'].length+books.lib['초등'].length;
console.log('8~10세대 초등 도서',c810,'· 초등 합계',books.store['초등'].length+books.lib['초등'].length,'· 전체',tot);
