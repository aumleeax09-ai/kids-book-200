# 어린이 추천도서 200선

유치원생(전체)·초등학생(전체) 대상 추천도서 200권을 **서점 추천 100** + **도서관 추천 100** 으로 나눠 보여 주는 단일 웹페이지입니다. GitHub Pages로 `index.html` 이 게시됩니다.

## 구조
- `books.json` — 도서 데이터. `{ store|lib: { 유아|초등: [ [제목, 저자, 출판사, 추천연령, 분야, 인기도(1~5), 추천이유, 교육효과], ... ] } }`. 각 배열의 **순서 = 순위**.
- `covers.json` — `{ 제목: { img, isbn } }` (알라딘 표지·ISBN).
- `template.html` — 페이지 템플릿(디자인·기능). 데이터 자리는 `/*__BOOKS__*/{}`, `/*__COVERS__*/{}`.
- `scripts/build.mjs` — books.json + covers.json + template.html → `index.html` 생성.
- `scripts/fetch-covers.mjs` — books.json 도서 중 표지 없는 항목을 알라딘에서 수집(`--all` 전체 재수집).

분야(category)는 반드시: 그림책 / 창작동화 / 과학 / 역사 / 수학 / 인성 / 사회 / 영어 중 하나.

## 매주 월요일 자동 갱신 작업 (클라우드 에이전트 지침)
1. `README.md`, `books.json`, `covers.json`, `template.html` 을 읽는다.
2. WebSearch 로 **이번 주 교보문고·YES24·알라딘 어린이 베스트셀러**(유아 그림책 + 초등)를 조사한다.
3. `books.json` 의 **`store.유아`, `store.초등` 만** 최신 인기/신간을 반영해 재정렬·교체한다.
   - 각 목록은 **50권 유지**, 엔트리 형식(위 8개 필드)·분야 규칙을 지킨다. 추천이유는 한국어 100자 내외.
   - `lib`(도서관) 목록은 원칙적으로 고정. 저명한 신간 수상작이 있을 때만 소폭 조정.
4. 새로 추가된 도서가 있으면 `node scripts/fetch-covers.mjs` 로 표지·ISBN 을 채운다.
5. `template.html` 의 기준일 `<span>기준일 <b>YYYY.MM</b></span>` 을 이번 달로 갱신한다.
6. `node scripts/build.mjs` 로 `index.html` 을 다시 생성한다.
7. `index.html` 에 도서 카드 200개가 정상 포함됐는지 확인 후, `git add -A && git commit -m "주간 갱신 <날짜>" && git push`.

변경은 보수적으로, 레이아웃·기능을 깨지 않게 한다.
