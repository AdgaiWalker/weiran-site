// node build.js  ->  dist/  (static log HTML, robots/sitemap/llms, worker-preview.js, worker-live.js)
const fs=require('fs');const src=fs.readFileSync(__dirname+'/index.html','utf8');
const LOGS=eval(src.match(/const LOGS=(\[[\s\S]*?\n\]);/)[1]);
const e=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const F=[['curious','好奇'],['did','做了'],['reach','AI 做到了'],['stuck','卡在了'],['now','现在觉得']];
const li=LOGS.map(l=>`<li class="rv"><time>${e(l.date)}</time>${l.title?`<h4>${e(l.title)}</h4>`:''}<dl>${F.map(([k,n])=>`<dt>${n}</dt><dd class="${k==='now'?'now':''}${l[k]?'':' tbd'}">${l[k]?e(l[k]):'待我补充'}${k==='did'&&l.link?` <a class="gl" href="${e(l.link)}" target="_blank" rel="noopener">GitHub →</a>`:''}</dd>`).join('')}</dl></li>`).join('');
const html=src.replace('<!--LOGS-->',li);
const site='https://goodloop.si';
const llms=`# 未然界域科技工作室\n\n> 带着好奇去做，做了，才知道什么重要。探 AI 的边界：它能做到什么程度？在哪个领域能做到？也做 Agent 开发，帮你用好 AI。\n\n- 官网: ${site}/\n- 联系: praxiswalker@outlook.com · 微信 wrjy2049\n\n## 做了才知道（探索记录）\n\n`+LOGS.map(l=>`### ${l.date} · ${l.title||''}\n`+F.map(([k,n])=>`- ${n}：${l[k]||'待补充'}`).join('\n')+(l.link?`\n- 链接：${l.link}`:'')).join('\n\n')+'\n';
const today=new Date().toISOString().slice(0,10);
const files={
 live:{'/robots.txt':`User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`,'/sitemap.xml':`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site}/</loc><lastmod>${today}</lastmod></url></urlset>\n`,'/llms.txt':llms},
 preview:{'/robots.txt':'User-agent: *\nDisallow: /\n','/sitemap.xml':`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n`,'/llms.txt':'# 预览版，不对外。正式内容见 '+site+'/llms.txt\n'}};
const types={'/robots.txt':'text/plain','/sitemap.xml':'application/xml','/llms.txt':'text/plain'};
fs.mkdirSync(__dirname+'/dist/live',{recursive:true});fs.mkdirSync(__dirname+'/dist/preview',{recursive:true});
for(const env of ['live','preview']){const pv=env==='preview';
 const h=pv?html.replace('<meta charset="utf-8">','<meta charset="utf-8"><meta name="robots" content="noindex,nofollow">'):html;
 fs.writeFileSync(`${__dirname}/dist/${env}/index.html`,h);for(const [k,v] of Object.entries(files[env]))fs.writeFileSync(`${__dirname}/dist/${env}${k}`,v);
 const w=`const H=${JSON.stringify(h)};const F=${JSON.stringify(files[env])};const T=${JSON.stringify(types)};
export default{fetch(r){const p=new URL(r.url).pathname;const x=${pv?"{'x-robots-tag':'noindex, nofollow'}":'{}'};
if(F[p])return new Response(F[p],{headers:{...x,'content-type':T[p]+';charset=utf-8','cache-control':'public,max-age=300'}});
if(p==='/'||p==='/index.html')return new Response(H,{headers:{...x,'content-type':'text/html;charset=utf-8','cache-control':'${pv?'no-store':'public,max-age=300'}'}});
return new Response(H,{status:404,headers:{...x,'content-type':'text/html;charset=utf-8'}});}};\n`;
 fs.writeFileSync(`${__dirname}/dist/worker-${env}.js`,w);}
console.log('logs',LOGS.length);
