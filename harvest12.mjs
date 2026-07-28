import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root,'covers.json'),'utf8'));

// 한자 분야 신설 + 8~9세 전체 분야 골고루 보강
const Q = [
 {q:'마법천자문', c:'한자', age:'8~11세', cap:10, why:'만화로 한자를 익히는 국민 학습만화 시리즈.', e:'한자·어휘'},
 {q:'한자마루', c:'한자', age:'8~11세', cap:8, why:'게임처럼 한자를 익히는 학습만화.', e:'한자·어휘'},
 {q:'그램그램 한자', c:'한자', age:'8~11세', cap:8, why:'만화로 한자의 원리를 익히는 그램그램 한자.', e:'한자·원리'},
 {q:'한자 동화', c:'한자', age:'8~10세', cap:8, why:'이야기로 한자를 배우는 동화.', e:'한자·어휘'},
 {q:'한자 그림책', c:'한자', age:'6~9세', cap:8, why:'그림으로 한자를 처음 만나는 그림책.', e:'한자·문자 감각'},
 {q:'저학년 사회 동화', c:'사회', age:'8~10세', cap:8, why:'더불어 살기를 배우는 저학년 사회 동화.', e:'사회성·시민의식'},
 {q:'저학년 전래동화 그림책', c:'전래·전통', age:'7~9세', cap:8, why:'저학년 눈높이의 우리 옛이야기.', e:'전래·전통'},
 {q:'어린이 경제 그림책', c:'경제·금융', age:'8~11세', cap:8, why:'용돈·돈을 그림으로 배우는 경제 책.', e:'경제·자기관리'},
 {q:'저학년 인물전', c:'위인·인물', age:'8~11세', cap:8, why:'저학년이 읽기 좋은 인물 이야기.', e:'위인·롤모델'},
 {q:'초등 영어 그림책', c:'영어', age:'8~10세', cap:8, why:'초등 저학년 영어 그림책.', e:'영어 노출·읽기'},
 {q:'저학년 수학 동화', c:'수학', age:'8~10세', cap:8, why:'이야기로 수 개념을 익히는 저학년 수학 동화.', e:'수 개념·기초'}
];

const BAD = /(스티커|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|가이드북|지도서|문제집|사운드북|퍼즐|엽서|드릴|기출|평가|익힘|전과|단어장|사전|스케치북|받아쓰기|급수|쓰기 노트|따라쓰기)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const coverRe = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;
let total=0; const summary=[];
for (const cfg of Q) {
  const g='초등', s='store';
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

// 기존 마법천자문/한자 관련 도서를 '한자' 분야로 재분류
let recat=0;
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) {
  if (b[4] !== '한자' && (b[0].includes('마법천자문') || b[0].includes('한자'))) { b[4]='한자'; recat++; }
}

fs.writeFileSync(path.join(root,'books.json'),JSON.stringify(books,null,1),'utf8');
fs.writeFileSync(path.join(root,'covers.json'),JSON.stringify(covers,null,1),'utf8');
console.log(summary.join('\n')); console.log('총 추가:',total,'· 한자 재분류:',recat);
const catN={}; let tot=0; for(const s of['store','lib'])for(const g of['유아','초등'])for(const b of books[s][g]){tot++;catN[b[4]]=(catN[b[4]]||0)+1;}
console.log('한자',catN['한자'],'· 사회',catN['사회'],'· 경제·금융',catN['경제·금융'],'· 영어',catN['영어'],'· 전체',tot);
