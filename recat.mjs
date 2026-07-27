import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root, 'books.json'), 'utf8'));

// 제목 → 새 분야
const MAP = {
 '위인·인물': ['who? 한국사 이순신','who? 아인슈타인','who? 한국사 세종대왕','who? 스티브 잡스','who? 마리 퀴리','who? 링컨','who? 한국사 김구','who? 한국사 정약용','who? 김연아','who? 손흥민','who? 빌 게이츠','who? 한국사 안중근','who? 한국사 유관순','who? 나이팅게일','who? 헬렌 켈러','who? 세종대왕 위인 이야기','이순신 위인전'],
 '전래·전통': ['콩쥐 팥쥐','흥부와 놀부','해와 달이 된 오누이','팥죽 할멈과 호랑이','방귀쟁이 며느리','훨훨 간다','아씨방 일곱 동무','열두 띠 이야기','반쪽이','좁쌀 한 톨로 장가든 총각','밥 안 먹는 색시','황소와 도깨비','손 큰 할머니의 만두 만들기','솔이의 추석 이야기','홍길동전','시리동동 거미동동','백만 마리 고양이'],
 '경제·금융': ['세금 내는 아이들','열두 살에 부자가 된 키라'],
 '자연·환경': ['야, 우리 기차에서 내려!','나무를 심은 사람','갯벌이 좋아요','강아지가 태어났어요','부엉이와 보름달','아주 조용한 귀뚜라미','우리 순이 어디 가니'],
 '학습서': ['Why? 시리즈 (우주)','Why? 인체','용선생의 시끌벅적 한국사','용선생의 시끌벅적 세계사','설민석의 한국사 대모험','설민석의 세계사 대모험','그리스 로마 신화 (만화)','그리스 로마 신화 (만화 2권)','코믹 메이플스토리 수학도둑','수학의 신','코믹 한자마루','내일은 실험왕','내일은 발명왕','살아남기 시리즈: 무인도에서 살아남기','사막에서 살아남기','화산에서 살아남기','과학공화국 물리법정','한국사편지','세계사편지','만화로 보는 조선왕조실록','살아있는 한국사 교과서','어린이를 위한 나의 문화유산답사기','반갑다 논리야','어린이를 위한 정의란 무엇인가','재미있는 수학여행','갈릴레오가 들려주는 별 이야기']
};
const title2cat = {};
for (const [cat, titles] of Object.entries(MAP)) for (const t of titles) title2cat[t] = cat;

let changed = 0; const unmatched = new Set(Object.keys(title2cat));
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) {
  if (title2cat[b[0]]) { b[4] = title2cat[b[0]]; changed++; unmatched.delete(b[0]); }
}
fs.writeFileSync(path.join(root, 'books.json'), JSON.stringify(books, null, 1), 'utf8');

// 분야별 집계
const counts = {};
for (const s of ['store','lib']) for (const g of ['유아','초등']) for (const b of books[s][g]) counts[b[4]] = (counts[b[4]]||0)+1;
console.log('재분류 반영:', changed, '권');
if (unmatched.size) console.log('매칭 실패(제목 확인 필요):', [...unmatched].join(', '));
console.log('분야별 권수:'); for (const k of Object.keys(counts).sort((a,b)=>counts[b]-counts[a])) console.log('  ' + k + ': ' + counts[k]);
