import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root, 'books.json'), 'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root, 'covers.json'), 'utf8'));

// 시리즈 설정: q=검색어, pre=제목 시작(또는 inc=포함), 이하 메타
const S = [
 {q:'Why 예림당', pre:'Why?', g:'초등', s:'store', a:'예림당 편집부', p:'예림당', age:'8~12세', c:'학습서', r:5, why:'과학·사회 주제를 만화로 파고드는 국민 학습만화 시리즈.', e:'지식·탐구심'},
 {q:'who 다산어린이', pre:'who?', g:'초등', s:'store', a:'다산어린이 편집부', p:'다산어린이', age:'8~12세', c:'위인·인물', r:5, why:'세계와 한국의 인물을 만화로 만나는 인기 위인전 시리즈.', e:'위인·롤모델'},
 {q:'이상한 과자 가게 전천당', pre:'이상한 과자 가게 전천당', g:'초등', s:'store', a:'히로시마 레이코', p:'길벗스쿨', age:'9~12세', c:'창작동화', r:5, why:'소원을 이뤄 주는 신비한 과자 가게 이야기. 인기 시리즈.', e:'판단력·상상력'},
 {q:'흔한남매', pre:'흔한남매', g:'초등', s:'store', a:'흔한남매·백난도', p:'아이세움', age:'8~11세', c:'창작동화', r:4, why:'인기 남매 캐릭터의 좌충우돌 코믹 일상.', e:'유머·독서 흥미'},
 {q:'엉덩이 탐정', pre:'엉덩이 탐정', g:'초등', s:'store', a:'트롤', p:'아이세움', age:'8~10세', c:'창작동화', r:4, why:'수수께끼를 풀며 사건을 해결하는 추리 시리즈.', e:'추리·집중력'},
 {q:'설민석의 한국사 대모험', pre:'설민석의 한국사 대모험', g:'초등', s:'store', a:'설민석·스토리박스', p:'단꿈아이', age:'8~12세', c:'학습서', r:5, why:'시간 여행 만화로 한국사를 체험하는 인기 시리즈.', e:'역사·흥미'},
 {q:'용선생의 시끌벅적 한국사', pre:'용선생의 시끌벅적 한국사', g:'초등', s:'store', a:'금현진 외', p:'사회평론', age:'9~12세', c:'학습서', r:5, why:'대화로 풀어가는 한국사 통사 시리즈.', e:'한국사·통합'},
 {q:'내일은 실험왕', pre:'내일은 실험왕', g:'초등', s:'store', a:'스토리 a.', p:'미래엔아이세움', age:'8~12세', c:'학습서', r:4, why:'실험 대결로 과학 원리를 익히는 학습만화.', e:'과학·탐구'},
 {q:'내일은 발명왕', pre:'내일은 발명왕', g:'초등', s:'store', a:'스토리 a.', p:'미래엔아이세움', age:'8~12세', c:'학습서', r:4, why:'발명 대결로 창의와 과학을 배우는 학습만화.', e:'창의·과학'},
 {q:'살아남기 시리즈', inc:'살아남기', g:'초등', s:'store', a:'곰돌이 co.', p:'미래엔아이세움', age:'8~12세', c:'학습서', r:4, why:'극한 상황 생존을 다룬 인기 과학 학습만화 시리즈.', e:'과학·문제해결'},
 {q:'코믹 메이플스토리 수학도둑', pre:'코믹 메이플스토리 수학도둑', g:'초등', s:'store', a:'송도수', p:'서울문화사', age:'8~12세', c:'학습서', r:4, why:'게임 캐릭터와 수학 개념을 익히는 학습만화.', e:'수학·흥미'},
 {q:'마법천자문', pre:'마법천자문', g:'초등', s:'store', a:'시리얼', p:'아울북', age:'8~11세', c:'학습서', r:4, why:'만화로 한자를 익히는 국민 학습만화 시리즈.', e:'한자·어휘'},
 {q:'그리스 로마 신화 홍은영', pre:'그리스 로마 신화', g:'초등', s:'store', a:'홍은영', p:'가나출판사', age:'9~12세', c:'학습서', r:4, why:'신화의 세계를 그린 스테디 학습만화 시리즈.', e:'인문·상상'},
 {q:'잘못 뽑은 반장', pre:'잘못 뽑은 반장', g:'초등', s:'store', a:'이은재', p:'주니어김영사', age:'8~11세', c:'창작동화', r:4, why:'얼떨결에 반장이 된 아이의 성장 소동극 시리즈.', e:'책임·유머'},
 {q:'수상한 박현숙', pre:'수상한', g:'초등', s:'store', a:'박현숙', p:'북멘토', age:'9~12세', c:'창작동화', r:4, why:'일상 속 미스터리를 추적하는 인기 추리 시리즈.', e:'추리·논리'},
 {q:'해리 포터', pre:'해리 포터', g:'초등', s:'store', a:'조앤 K. 롤링', p:'문학수첩', age:'10~12세', c:'창작동화', r:5, why:'마법 학교를 무대로 한 세계적 판타지 시리즈.', e:'상상력·독서력'},
 {q:'나니아 연대기', pre:'나니아 연대기', g:'초등', s:'store', a:'C.S. 루이스', p:'시공주니어', age:'10~12세', c:'창작동화', r:4, why:'옷장 너머 환상 세계의 모험을 그린 판타지 고전 시리즈.', e:'상상력·용기'},
 {q:'마법의 시간여행 비룡소', pre:'마법의 시간여행', g:'초등', s:'store', a:'메리 폽 어즈번', p:'비룡소', age:'8~11세', c:'창작동화', r:4, why:'시대를 넘나드는 남매의 모험 다독 챕터북 시리즈.', e:'역사·모험·다독'},
 {q:'정재승의 인간 탐구 보고서', pre:'정재승의 인간 탐구 보고서', g:'초등', s:'store', a:'정재승·이고은', p:'아울북', age:'9~12세', c:'학습서', r:5, why:'외계인의 눈으로 본 인간의 뇌와 마음 시리즈.', e:'뇌·과학'},
 {q:'무지개 물고기 마르쿠스 피스터', pre:'무지개 물고기', g:'유아', s:'store', a:'마르쿠스 피스터', p:'시공주니어', age:'5~7세', c:'인성', r:4, why:'반짝이는 비늘의 물고기가 겪는 우정 이야기 시리즈.', e:'나눔·우정'},
 {q:'엘머 데이비드 맥키', pre:'엘머', g:'유아', s:'store', a:'데이비드 맥키', p:'마루벌', age:'4~6세', c:'인성', r:4, why:'알록달록 코끼리 엘머의 다름을 존중하는 이야기 시리즈.', e:'다양성·자기긍정'},
 {q:'지원이와 병관이 고대영', pre:'지원이와 병관이', g:'유아', s:'store', a:'고대영·김영진', p:'길벗어린이', age:'4~7세', c:'창작동화', r:4, why:'남매의 생활 사건을 담은 정겨운 생활 그림책 시리즈.', e:'생활·사회성'}
];

const CAP = 18;
const BAD = /(세트|전집|박스|합본|사은품|미리보기|스페셜\s*팩|권\s*세트|\d+\s*권세트|양장|보드북 세트)/;
const existing = new Set();
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) existing.add(b[0]);

const sleep = ms => new Promise(r=>setTimeout(r,ms));
const SCAN = /(https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png))|ItemId=\d+"\s+class="bo3">([^<]+)<\/a>/g;

let totalAdded = 0; const summary = [];
for (const cfg of S) {
  const url = 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord=' + encodeURIComponent(cfg.q);
  let added = 0;
  try {
    const res = await fetch(url, { headers:{ 'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }});
    const html = await res.text();
    let m, lastCover = '';
    const seen = new Set();
    while ((m = SCAN.exec(html)) !== null) {
      if (m[1]) { lastCover = m[1]; continue; }
      let title = m[2].trim().replace(/\s+/g,' ');
      const ok = cfg.pre ? title.startsWith(cfg.pre) : title.includes(cfg.inc);
      if (!ok || BAD.test(title) || seen.has(title) || existing.has(title)) continue;
      if (added >= CAP) break;
      seen.add(title); existing.add(title);
      const fn = (lastCover.match(/\/cover\d+\/([^\/]+?)\.(?:jpg|gif|png)/)||[])[1] || '';
      const im = fn.match(/^([0-9]{9}[0-9Xx])/);
      covers[title] = { img: lastCover, isbn: im ? im[1] : '' };
      books[cfg.s][cfg.g].push([title, cfg.a, cfg.p, cfg.age, cfg.c, cfg.r, cfg.why, cfg.e]);
      added++; totalAdded++;
    }
  } catch(e) { summary.push(cfg.q + ' 오류'); }
  summary.push(`${cfg.q} → +${added}`);
  await sleep(250);
}

fs.writeFileSync(path.join(root, 'books.json'), JSON.stringify(books, null, 1), 'utf8');
fs.writeFileSync(path.join(root, 'covers.json'), JSON.stringify(covers, null, 1), 'utf8');
console.log(summary.join('\n'));
console.log('총 추가:', totalAdded);
for (const s of ['store','lib']) for (const g of ['유아','초등']) console.log(`  ${s}.${g} = ${books[s][g].length}`);
