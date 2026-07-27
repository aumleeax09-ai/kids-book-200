import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(root, 'books.json'), 'utf8'));

const NOISE = /(스티커북|색칠|활동북|워크북|미니북|보드북|오디오|\bCD\b|플래시\s*카드|전\s*\d+\s*권|\d+\s*종\s*시리즈|세트|전집|합본|박스|필사|워크시트|다이어리|달력)/;
const removed = [];
for (const s of ['store','lib']) for (const g of ['유아','초등']) {
  const before = books[s][g].length;
  books[s][g] = books[s][g].filter(b => { if (NOISE.test(b[0])) { removed.push(b[0]); return false; } return true; });
}
fs.writeFileSync(path.join(root, 'books.json'), JSON.stringify(books, null, 1), 'utf8');
console.log('제거:', removed.length, '권');
console.log(removed.join('\n'));
console.log('--- 현재 권수 ---');
let tot=0; for (const s of ['store','lib']) for (const g of ['유아','초등']) { console.log(`  ${s}.${g} = ${books[s][g].length}`); tot+=books[s][g].length; }
console.log('총', tot, '· 유치원', books.store['유아'].length+books.lib['유아'].length, '· 초등', books.store['초등'].length+books.lib['초등'].length);
