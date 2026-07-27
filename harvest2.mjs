import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root, 'books.json'), 'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root, 'covers.json'), 'utf8'));

// q=검색어(주로 작가/시리즈), g=연령, s=출처, c=분야, age=추천연령, why/e=문구, cap
const Q = [
 // ---- 유아 (그림책 작가) ----
 {q:'요시타케 신스케', g:'유아', s:'store', c:'그림책', age:'5~7세', cap:10, why:'기발한 상상과 유머가 가득한 요시타케 신스케의 그림책.', e:'상상력·사고력'},
 {q:'백희나', g:'유아', s:'store', c:'창작동화', age:'5~7세', cap:10, why:'독창적인 입체 그림으로 세계가 주목한 백희나의 작품.', e:'상상력·정서'},
 {q:'안녕달', g:'유아', s:'store', c:'창작동화', age:'5~7세', cap:10, why:'따뜻하고 뭉클한 이야기로 사랑받는 안녕달의 그림책.', e:'정서·공감'},
 {q:'이수지 그림책', g:'유아', s:'store', c:'그림책', age:'4~6세', cap:10, why:'글 없이 상상을 펼치는 이수지의 예술적 그림책.', e:'상상력·감수성'},
 {q:'데이비드 섀넌', g:'유아', s:'store', c:'그림책', age:'4~6세', cap:8, why:'개구쟁이 아이의 마음을 유쾌하게 그린 그림책.', e:'자기조절·유머'},
 {q:'모 윌렘스', g:'유아', s:'store', c:'그림책', age:'4~6세', cap:10, why:'비둘기·코끼리와 꿀꿀이로 유명한 모 윌렘스의 그림책.', e:'유머·감정'},
 {q:'줄리아 도널드슨', g:'유아', s:'store', c:'그림책', age:'4~6세', cap:8, why:'운율이 살아 있는 이야기로 사랑받는 그림책.', e:'언어 리듬·상상'},
 {q:'미야니시 다쓰야', g:'유아', s:'store', c:'창작동화', age:'5~7세', cap:10, why:'공룡 이야기로 뭉클한 감동을 주는 그림책 시리즈.', e:'가족애·감동'},
 {q:'김영진 그림책', g:'유아', s:'store', c:'인성', age:'4~6세', cap:8, why:'우리 아이 일상을 유쾌하게 담은 김영진의 그림책.', e:'생활·가족'},
 {q:'최숙희 그림책', g:'유아', s:'store', c:'인성', age:'4~6세', cap:8, why:'자존감과 사랑을 따뜻하게 전하는 최숙희의 그림책.', e:'자존감·정서'},
 {q:'채인선', g:'유아', s:'store', c:'인성', age:'5~7세', cap:8, why:'생활 속 가치를 다정하게 알려 주는 채인선의 책.', e:'인성·가치'},
 {q:'유설화', g:'유아', s:'store', c:'창작동화', age:'5~7세', cap:6, why:'슈퍼 거북·토끼로 사랑받는 유설화의 그림책.', e:'자신감·성장'},
 // ---- 유아 (도서관/명작 작가) ----
 {q:'앤서니 브라운', g:'유아', s:'lib', c:'인성', age:'5~7세', cap:12, why:'상징과 그림으로 가족·마음을 그린 앤서니 브라운의 명작.', e:'가족·정서·상상'},
 {q:'존 버닝햄', g:'유아', s:'lib', c:'그림책', age:'5~7세', cap:10, why:'상상과 유머가 어우러진 존 버닝햄의 그림책.', e:'상상력·유머'},
 {q:'에릭 칼', g:'유아', s:'lib', c:'그림책', age:'4~6세', cap:10, why:'색채가 아름다운 에릭 칼의 그림책.', e:'색·자연·관찰'},
 {q:'레오 리오니', g:'유아', s:'lib', c:'인성', age:'5~7세', cap:10, why:'우화 같은 이야기로 생각할 거리를 주는 레오 리오니의 그림책.', e:'다양성·사고력'},
 {q:'모리스 샌닥', g:'유아', s:'lib', c:'그림책', age:'5~7세', cap:6, why:'아이의 상상과 감정을 그린 모리스 샌닥의 명작.', e:'상상력·감정'},
 {q:'윌리엄 스타이그', g:'유아', s:'lib', c:'창작동화', age:'5~7세', cap:10, why:'지혜와 사랑이 담긴 윌리엄 스타이그의 이야기.', e:'지혜·가족애'},
 {q:'토미 웅게러', g:'유아', s:'lib', c:'그림책', age:'5~7세', cap:6, why:'개성 강한 그림과 반전이 있는 토미 웅게러의 그림책.', e:'상상력·공감'},
 {q:'마거릿 와이즈 브라운', g:'유아', s:'lib', c:'그림책', age:'4~5세', cap:6, why:'포근한 잠자리 그림책으로 사랑받는 명작.', e:'정서 안정·언어'},
 {q:'하야시 아키코', g:'유아', s:'lib', c:'그림책', age:'4~5세', cap:8, why:'아기의 첫 경험을 정겹게 그린 하야시 아키코의 그림책.', e:'생활·정서'},
 {q:'권정생', g:'유아', s:'lib', c:'창작동화', age:'5~7세', cap:8, why:'생명과 사랑을 그린 권정생의 따뜻한 이야기.', e:'생명 존중·정서'},
 {q:'권윤덕', g:'유아', s:'lib', c:'사회', age:'5~7세', cap:6, why:'우리 문화와 역사를 세밀하게 담은 권윤덕의 그림책.', e:'전통·역사·관찰'},
 {q:'사노 요코', g:'유아', s:'lib', c:'인성', age:'5~7세', cap:6, why:'삶과 사랑을 깊이 생각하게 하는 사노 요코의 그림책.', e:'삶·사랑·성찰'},
 {q:'오드리 우드', g:'유아', s:'lib', c:'그림책', age:'4~6세', cap:6, why:'반복과 상상이 즐거운 오드리 우드의 그림책.', e:'언어 리듬·상상'},
 {q:'팻 허친스', g:'유아', s:'lib', c:'그림책', age:'4~6세', cap:6, why:'유머와 리듬이 살아 있는 팻 허친스의 그림책.', e:'유머·수 개념'},
 {q:'고미 타로', g:'유아', s:'lib', c:'그림책', age:'4~6세', cap:8, why:'단순하고 재치 있는 고미 타로의 그림책.', e:'상상력·유머'},
 {q:'다비드 칼리', g:'유아', s:'lib', c:'그림책', age:'5~7세', cap:6, why:'짧은 문장으로 삶을 은유하는 다비드 칼리의 그림책.', e:'정서·사고력'},
 {q:'이보나 흐미엘레프스카', g:'유아', s:'lib', c:'인성', age:'6~8세', cap:6, why:'은유로 마음을 그린 이보나 흐미엘레프스카의 그림책.', e:'감정·성찰'},
 {q:'나카야 미와', g:'유아', s:'lib', c:'창작동화', age:'4~6세', cap:8, why:'소라게·완두콩 등 아기자기한 나카야 미와의 그림책.', e:'상상력·자연'},
 // ---- 초등 (작가/시리즈) ----
 {q:'로알드 달', g:'초등', s:'store', c:'창작동화', age:'9~12세', cap:10, why:'기발한 상상과 유머로 사랑받는 로알드 달의 동화.', e:'상상력·재미'},
 {q:'황선미 동화', g:'초등', s:'lib', c:'창작동화', age:'9~12세', cap:10, why:'아이의 마음을 섬세하게 그린 황선미의 창작동화.', e:'성장·공감'},
 {q:'이금이', g:'초등', s:'lib', c:'창작동화', age:'10~12세', cap:8, why:'성장기 마음을 깊이 담은 이금이의 동화.', e:'성장·치유'},
 {q:'유은실', g:'초등', s:'lib', c:'창작동화', age:'9~12세', cap:8, why:'유머와 온기가 어우러진 유은실의 동화.', e:'공감·성장'},
 {q:'진형민', g:'초등', s:'lib', c:'창작동화', age:'10~12세', cap:6, why:'공동체와 정의를 유쾌하게 그린 진형민의 동화.', e:'공동체·용기'},
 {q:'송미경 동화', g:'초등', s:'lib', c:'창작동화', age:'9~12세', cap:6, why:'기발한 상상으로 생각거리를 주는 송미경의 동화.', e:'개성·사고력'},
 {q:'박현숙 동화', g:'초등', s:'store', c:'창작동화', age:'9~12세', cap:8, why:'추리·성장 이야기로 인기 있는 박현숙의 동화.', e:'추리·공감'},
 {q:'고정욱', g:'초등', s:'lib', c:'인성', age:'9~12세', cap:8, why:'장애 이해와 배려를 담은 고정욱의 동화.', e:'장애 이해·배려'},
 {q:'김리리', g:'초등', s:'store', c:'창작동화', age:'8~10세', cap:6, why:'재미와 상상이 가득한 김리리의 저학년 동화.', e:'상상력·재미'},
 {q:'위기철', g:'초등', s:'lib', c:'창작동화', age:'10~12세', cap:6, why:'생각하는 힘을 길러 주는 위기철의 책.', e:'논리·성찰'},
 {q:'who 스페셜', g:'초등', s:'store', c:'위인·인물', age:'8~12세', cap:12, why:'인물의 삶을 만화로 만나는 위인전.', e:'위인·롤모델'},
 {q:'한국사 대모험', g:'초등', s:'store', c:'학습서', age:'8~12세', cap:10, why:'만화로 즐기는 한국사 학습 시리즈.', e:'역사·흥미'}
];

const CAP_GROUP = 500;
const BAD = /(스티커북|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력|영어원서|워크|가이드북|지도서|문제집)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);

const sleep = ms => new Promise(r=>setTimeout(r,ms));
const coverRe = /https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g;

let total = 0; const summary = [];
for (const cfg of Q) {
  const gCount = () => books.store[cfg.g].length + books.lib[cfg.g].length;
  if (gCount() >= CAP_GROUP) { summary.push(`${cfg.q} → skip(그룹 상한)`); continue; }
  let added = 0;
  try {
    const url = 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord=' + encodeURIComponent(cfg.q);
    const res = await fetch(url, { headers:{ 'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }});
    const html = await res.text();
    const covPos = []; let cm; coverRe.lastIndex = 0; while ((cm = coverRe.exec(html)) !== null) covPos.push([cm.index, cm[0]]);
    const bo3 = /class="bo3">([^<]+)<\/a>/g; let m;
    while ((m = bo3.exec(html)) !== null) {
      if (added >= cfg.cap || gCount() >= CAP_GROUP) break;
      const title = m[1].trim().replace(/\s+/g,' ');
      if (BAD.test(title) || existing.has(title)) continue;
      const chunk = html.slice(m.index, m.index + 700);
      const am = chunk.match(/AuthorSearch=[^>]*>\s*([^<]+?)\s*<\/a>\s*\(지은이\)/) || chunk.match(/AuthorSearch=[^>]*>\s*([^<]+?)\s*<\/a>/);
      const pm = chunk.match(/PublisherSearch=[^>]*>\s*([^<]+?)\s*<\/[Aa]>/);
      const author = am ? am[1].trim() : '';
      const pub = pm ? pm[1].trim() : '';
      if (!author || !pub) continue; // 파싱 실패분 제외(품질 유지)
      let cv = ''; for (const [p,u] of covPos) { if (p < m.index) cv = u; else break; }
      const fn = (cv.match(/\/cover\d+\/([^\/]+?)\.(?:jpg|gif|png)/)||[])[1] || '';
      const im = fn.match(/^([0-9]{9}[0-9Xx])/);
      if (cv) covers[title] = { img: cv, isbn: im ? im[1] : '' };
      books[cfg.s][cfg.g].push([title, author, pub, cfg.age, cfg.c, cfg.r||4, cfg.why, cfg.e]);
      existing.add(title); added++; total++;
    }
  } catch(e) { summary.push(`${cfg.q} 오류`); }
  summary.push(`${cfg.q} → +${added}`);
  await sleep(250);
}
fs.writeFileSync(path.join(root, 'books.json'), JSON.stringify(books, null, 1), 'utf8');
fs.writeFileSync(path.join(root, 'covers.json'), JSON.stringify(covers, null, 1), 'utf8');
console.log(summary.join('\n'));
console.log('총 추가:', total);
for (const s of ['store','lib']) for (const g of ['유아','초등']) console.log(`  ${s}.${g} = ${books[s][g].length}`);
console.log('유치원', books.store['유아'].length+books.lib['유아'].length, '· 초등', books.store['초등'].length+books.lib['초등'].length);
