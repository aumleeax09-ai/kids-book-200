const q = '앤서니 브라운';
const url = 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord=' + encodeURIComponent(q);
const res = await fetch(url, { headers:{ 'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }});
const html = await res.text();
const i = html.indexOf('class="bo3"');
console.log(html.slice(i-10, i+520).replace(/\s+/g,' '));
