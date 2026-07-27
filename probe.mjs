const q = '이상한 과자 가게 전천당';
const url = 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord=' + encodeURIComponent(q);
const res = await fetch(url, { headers:{ 'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }});
const html = await res.text();
// bo3 제목 앵커
const titles = [...html.matchAll(/class="bo3"[^>]*>\s*<b>([^<]{2,80})<\/b>/g)].map(m=>m[1]).slice(0,12);
console.log('=== bo3 titles ===');
console.log(titles.join('\n'));
// cover 이미지 (순서)
const covers = [...html.matchAll(/https:\/\/image\.aladin\.co\.kr\/product\/[^\s"']+?\/cover\d+\/[^\s"'\/]+?\.(?:jpg|gif|png)/g)].map(m=>m[0]).slice(0,12);
console.log('=== covers ===');
console.log(covers.join('\n'));
console.log('titlesN=', titles.length, 'coversN=', covers.length);
