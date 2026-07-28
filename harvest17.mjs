import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));
const A = '8~10세';
// 8~9세 도서관 스테디셀러 계속 보강 — 문학상 수상작·권장도서·저학년 인기 작가 (source lib)
const Q = [
 {q:'황금도깨비상 수상작', c:'창작동화'},
 {q:'문학동네어린이문학상', c:'창작동화'},
 {q:'창비 좋은 어린이책', c:'창작동화'},
 {q:'웅진주니어 문학상', c:'창작동화'},
 {q:'사계절어린이문학상', c:'창작동화'},
 {q:'저학년 필독서', c:'창작동화'},
 {q:'초등 저학년 권장도서', c:'창작동화'},
 {q:'소중애 동화', c:'창작동화'},
 {q:'이분희 동화', c:'창작동화'},
 {q:'이병승 동화', c:'창작동화'},
 {q:'김제완 동화', c:'창작동화'},
 {q:'이수용 동화', c:'창작동화'},
 {q:'김성진 동화', c:'창작동화'},
 {q:'최도영 동화', c:'창작동화'},
 {q:'김유진 동화', c:'창작동화'},
 {q:'박현경 동화', c:'창작동화'},
 {q:'저학년 감정 동화', c:'인성'},
 {q:'똥 동화 저학년', c:'창작동화'},
 {q:'저학년 학교 동화', c:'창작동화'},
 {q:'저학년 옛이야기', c:'전래·전통'},
 {q:'김륭 동화', c:'창작동화'},
 {q:'유은실 저학년', c:'창작동화'},
 {q:'저학년 성장 동화', c:'창작동화'},
 {q:'저학년 우정 동화', c:'창작동화'}
];
const TARGET = 130, CAP = 12;
const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|퍼즐|엽서|드릴|기출|평가|익힘|전과|단어장|사전|받아쓰기|급수|따라쓰기)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const coverRe = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;
let total=0; const summary=[];
for (const cfg of Q) {
  if (total >= TARGET) break;
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
      books.lib['초등'].push([title, am[1].trim(), pm[1].trim(), A, cfg.c, 4, '도서관에서 꾸준히 사랑받는 저학년 '+cfg.c+' 스테디셀러.', '읽기·'+cfg.c]);
      existing.add(title); added++; total++;
    }
  }catch(e){ summary.push(`${cfg.q} 오류`); }
  summary.push(`${cfg.q} → +${added} (누적 ${total})`); await sleep(220);
}
fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
console.log(summary.join('\n')); console.log('추가:',total,'· lib.초등',books.lib['초등'].length,'· 도서관 합계',books.lib['유아'].length+books.lib['초등'].length);
