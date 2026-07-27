// books.json + covers.json + template.html → index.html 생성
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const books = JSON.parse(read('books.json'));
const covers = JSON.parse(read('covers.json'));
let tpl = read('template.html');

tpl = tpl.replace('/*__BOOKS__*/{}', JSON.stringify(books));
tpl = tpl.replace('/*__COVERS__*/{}', JSON.stringify(covers));

// 완전한 HTML 문서로 감싸기
const marker = '<div class="wrap">';
const i = tpl.indexOf(marker);
const head = tpl.slice(0, i);
const body = tpl.slice(i);
const out =
`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${head}</head>
<body>
${body}
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'index.html'), out, 'utf8');
const total = Object.values(books).reduce((s, g) => s + g['유아'].length + g['초등'].length, 0);
console.log('index.html 생성 완료 · 총 도서', total, '· 표지 키', Object.keys(covers).length);
