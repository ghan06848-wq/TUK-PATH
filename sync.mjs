/**
 * Sync publicly visible Korean university board list pages to a static JSON file.
 * Runs in GitHub Actions on a schedule. No browser/server/Python required for visitors.
 * Uses no dependencies. On failure it keeps previously fetched records and flags errors.
 */
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT=path.join(ROOT,'data','notices.json');
const BOARDS=[
 {name:'장학공지',url:'https://tukorea.ac.kr/tukorea/1097/subview.do'},
 {name:'비교과공지',url:'https://tukorea.ac.kr/tukorea/6622/subview.do'},
 {name:'학사공지',url:'https://haksa.tukorea.ac.kr/haksa/2996/subview.do'},
];
function text(html){return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&#39;|&#x27;/gi,"'").replace(/\s+/g,' ').trim()}
function category(title,board){if(/장학/.test(board))return /(재단|장학생|지자체|시민|도민|군민|국가장학|교외)/.test(title)?'교외장학금':'교내장학금';if(/공모전|경진대회|해커톤|아이디어톤|콘테스트|캡스톤/.test(title))return '공모전';if(/자격증|자격시험|기사시험|어학시험/.test(title))return '자격증';if(/인턴|취업|채용|직무|현장실습|면접|박람회/.test(title))return '취업·인턴';return '대외활동'}
function safeURL(href,base){try{const u=new URL(href,base);return u.protocol==='https:'&&(/(^|\.)tukorea\.ac\.kr$/).test(u.hostname)?u.toString():base}catch{return base}}
function parse(html,board){const results=[];const tables=[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];for(const [,tr] of tables){const date=text(tr).match(/20\d{2}[.\-/]\d{1,2}[.\-/]\d{1,2}/);if(!date)continue;const anchors=[...tr.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];const best=anchors.map(a=>{const title=text(a[2]);const href=a[1].match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]||'';return {title,href}}).filter(a=>a.title.length>=8&&!/^\d+$/.test(a.title)).sort((a,b)=>b.title.length-a.title.length)[0];if(!best)continue;const title=best.title.replace(/\s*새글\s*$/,'').slice(0,220);const dateStr=date[0].replace(/[./]/g,'-');const id=crypto.createHash('sha256').update(board.name+'|'+title).digest('hex').slice(0,18);results.push({id:'tuk-'+id,title,category:category(title,board.name),type:'notice',date:dateStr,url:best.href&&!/^(#|javascript:)/i.test(best.href)?safeURL(best.href,board.url):board.url,description:'학교 공식 공개 게시판에 등록된 공지입니다. 신청 자격과 접수 기간은 원문에서 확인해 주세요.',source:'한국공학대학교 '+board.name,majors:['전체'],grades:[1,2,3,4],tags:['학교 공식 공지','지원조건 확인']})}
return [...new Map(results.map(x=>[x.id,x])).values()]}
const old=await fs.readFile(OUT,'utf8').then(JSON.parse).catch(()=>({items:[],updated_at:null}));const previous=Array.isArray(old.items)?old.items:[];let successes=0;const errors={};const next=[];
for(const board of BOARDS){try{const response=await fetch(board.url,{signal:AbortSignal.timeout(18000),headers:{'User-Agent':'TUKPATH-AcademicProject/2.0 (public university board monitoring)',Accept:'text/html'}});if(!response.ok)throw Error('HTTP '+response.status);const buf=Buffer.from(await response.arrayBuffer());let html=new TextDecoder('utf-8').decode(buf);if(html.includes('\uFFFD')){try{html=new TextDecoder('euc-kr').decode(buf)}catch{}}const parsed=parse(html,board);if(!parsed.length)throw Error('게시판 목록 파싱 실패 (구조 변경 또는 비공개)');successes++;next.push(...parsed);console.log(board.name+': '+parsed.length+'건')}catch(err){errors[board.name]=String(err.message||err).slice(0,180);console.warn(board.name+': '+errors[board.name]);next.push(...previous.filter(x=>x.source==='한국공학대학교 '+board.name))}}
const seen=new Set;const items=[...next,...previous.filter(x=>!next.some(n=>n.id===x.id))].filter(x=>{if(seen.has(x.id))return false;seen.add(x.id);return true}).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,250);
const output={status:successes===BOARDS.length?'ok':successes?'partial':'offline',updated_at:successes?new Date().toISOString():old.updated_at||null,checked_at:new Date().toISOString(),errors,items};await fs.writeFile(OUT,JSON.stringify(output,null,2)+'\n');console.log(`총 ${items.length}건, 성공 ${successes}/${BOARDS.length}`);if(!successes)process.exitCode=1;
