'use strict';
{
const $=id=>document.getElementById(id);
const C=Chess;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={get(k,d){try{const v=localStorage.getItem('oc:'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('oc:'+k,JSON.stringify(v));return true}catch(e){return false}},del(k){try{localStorage.removeItem('oc:'+k)}catch(e){}}};
const API='https://api.chess.com/pub/player/';
const DEPTH=16;

/* ================= opening knowledge ================= */
const NOTES={
'w:e4 e5 Nf3 Nc6 d4':['Scotch Game','You open the centre at once. Plan: Nxd4, Nc3, Be3 or Bc4, O-O, then f4 or Qd2. Black\'s counterplay comes from pressure on your d4 knight and on e4 (…Bc5, …Qf6, …Nf6). Before each move ask: is e4 still defended, and is the d4 knight attacked twice?'],
'w:e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5':['Scotch: 4…Bc5','Be3 plus c3 holds d4 like a rock. Meet …Qf6 with c3, then Bc4 or Be2 and castle. Watch …Bb4+ and …Qxf2 tricks while your king is still in the centre.'],
'w:e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6':['Scotch: 4…Nf6','Black attacks e4. Nxc6 bxc6 e5 kicks the knight (then Qe2 and c4 keep it out of d5). If you prefer Nc3, expect …Bb4 pinning the knight that guards e4.'],
'w:e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nxd4':['Scotch: 4…Nxd4','After Qxd4 your queen dominates the centre. Develop Nc3, Be3 or Bf4; long castling is often strong. Black gains time with …c5, …Ne7–c6 and …Qf6: keep the queen on a safe central square and keep developing rather than chasing pawns.'],
'w:e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Ne5':['Scotch: 4…Ne5','Black has moved the same knight three times, so you are clearly ahead in development. Keep developing (Nc3, Be2 or Be3, O-O) and use f4 to kick the knight when it gains time. Your score here is low: the odd-looking move is not a reason to relax.'],
'w:e4 c5':['Open Sicilian','Nf3 and d4 open the game while you are ahead in development. Plan: Nxd4, Nc3, Be3, then Qd2 and f3 with long castling against …g6 set-ups, or Be2, O-O and f4 against …e6 set-ups. Black\'s key counter-moves are …d5, …b5 and an early …Qb6 hitting d4 and b2.'],
'w:e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 e6':['Sicilian: …e6 set-ups','Taimanov/Kan structures: Black wants …a6, …Qc7, …Nf6 and the freeing …d5. Good plan: Nc3, Be2 or Be3, O-O, f4 and Qe1–g3. Ndb5 jumps hit d6 and c7 if Black is careless. Do not allow …d5 for free.'],
'w:e4 e5 Nf3 d6':['Philidor Defence','The Philidor is passive: take space with d4, develop Nc3, Bc4 or Be2, O-O, and aim for f4 or Re1. If Black takes on d4 and plays …c5, the d5 square and the d6 pawn become permanent targets: bring a knight to d5.'],
'w:e4 e5 Nf3 d6 d4 exd4 Nxd4 c5':['Philidor: 4…c5','After …c5 the d5 square is a hole and d6 is backward. Retreat the knight, then Nc3–d5, Bc4 and Bb5+ ideas. Develop with threats; slow play after the retreat is what has cost you points.'],
'w:e4 c6':['Caro-Kann','Solid for Black; you win with development and space. Plan: d4, Nc3, Bd3 or Bc4, O-O, Re1, c3. Watch …Bg4 pinning your f3 knight: h3 forces Black to decide.'],
'w:e4 c6 Nf3 d5 Nc3 dxe4 Nxe4 Nf6 Nxf6+ exf6':['Caro-Kann: …exf6','Black accepts doubled f-pawns for fast development: …Bd6, …O-O, …Re8+ and …Qe7. Your 6.Bc4 here has gone badly. Prefer 6.d4, then Bd3, O-O, c3 and Re1 to fight for the e-file. Long-term trump: your healthy queenside majority in the endgame.'],
'w:e4 d5':['Scandinavian','Develop with tempo on the queen: Nc3, d4, Nf3, then Bc4 or Bd2. A queen on a5 is exposed: Bd2 sets up Nd5 and Nb5 tricks. Keep d4 protected and watch the …Bg4 pin.'],
'w:e4 d5 exd5 Qxd5 Nc3 Qa5':['Scandinavian: 3…Qa5','In your games 4.d4 has worked far better than 4.Nf3. d4 first claims the centre and keeps Bd2 available against the queen.'],
'w:e4 e6':['French Defence','Black will hit your centre with …d5, …c5 and …Qb6. After 2.Nf3 d5, 3.Nc3 or 3.e5 keeps the tension. The exchange 3.exd5 gives a symmetrical, drawish structure where Black equalises easily.'],
'w:e4 e6 Nf3 d5 e5':['French: Advance','e5 gains space. Hold d4 with c3 and Nf3, then Be2 or Bd3 and O-O. Against …Qb6 pressure on b2 and d4, a3 and b4 keep things solid.'],
'b:e4 c5 Nf3 Nc6':['Sicilian with …Nc6','Flexible: you keep …g6, …e6 and …d6 set-ups open. Against the Open Sicilian the move order matters: see the 5.Nc3 position.'],
'b:e4 c5 Nf3 Nc6 Nc3 Nf6':['Sicilian: 3.Nc3 Nf6','Your 3…Nf6 here has scored badly. Solid alternatives are 3…g6 (then …Bg7, …d6) or 3…e6. Watch for Bb5 pinning the c6 knight, and e5 kicking the f6 knight.'],
'b:e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6':['Sicilian: 4…Nf6','Against Nxc6 bxc6 your centre pawns are an asset: use them with …d5 or …e5, and don\'t let e5 kick your f6 knight for free.'],
'b:e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3':['Your biggest Sicilian leak','You play 5…g6 almost every time and score under 40%. With the knight on f6 and no …d6, White gets Nxc6 bxc6 e5, or Be3, f3, Qd2 and a quick attack. Switch to 5…d6 (Classical Sicilian): it stops e5, keeps …g6 possible later as a Dragon, and gives clear plans (…e6, …Be7, …O-O, …a6, …Qc7). 5…e5 (Sveshnikov) is the sharper alternative.'],
'b:e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 d6':['Classical Sicilian','Next: …e6 or …g6, then …Be7 or …Bg7 and castle. Against Bg5 (Richter-Rauzer) play …e6. Against Bc4 play …e6, …Be7 and …a6. Your counterplay comes on the c-file and with …b5.'],
'b:e4 c5 Bc4':['Sicilian: 2.Bc4','The bishop eyes f7. …e6 blunts it, then …d5 gains time; …Nc6, …a6 and …b5 chase the bishop. Watch for Qh5 or Qf3 tricks on f7 before you castle.'],
'b:e4 c5 c3':['Alapin','Against c3, …d5 is principled. After exd5 Qxd5 d4, play …Nf6 and …e6 (or …Bg4), and take on d4 only when it helps: after …cxd4 cxd4, White\'s isolated d-pawn is a long-term target.'],
'b:e4 c5 Nf3 Nc6 c3':['Alapin with Nf3','…d5 hits the centre. After exd5 Qxd5 d4, …Bg4 pins the f3 knight and increases pressure on d4; then …e6, …Nf6 and …cxd4 at the right moment. When White plays Nc3, the queen goes back to d8, d6 or a5.'],
'b:e4 e5':['Against 1.e4 e5','You play this rarely and score poorly. Know the traps on f7: after Bc4, the Two Knights with Ng5 is the danger line. 3…Bc5 (Giuoco Piano) is calmer: …Nf6, …d6, …O-O, …a6 and …Ba7.'],
'b:e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5':['Two Knights: avoid the Fried Liver','After 4.Ng5 d5 5.exd5, the recapture 5…Nxd5 invites Nxf7 (Fried Liver) or d4 with a strong attack. Play 5…Na5: it hits the bishop, and you get fast development for the pawn. Stockfish agrees.'],
'b:e4 c6':['Caro-Kann','Solid: …d5, get the light bishop out before …e6 (Bf5 or Bg4), then …e6, …Nd7, …Ngf6. In the Exchange (exd5 cxd5) play …Nc6, …Bg4 or …Bf5, …e6, and consider the minority attack …b5–b4.'],
'b:e4 c6 Nf3 d5 exd5 cxd5 Bb5+':['Caro-Kann: Bb5+','You have lost every game against this check. Block with …Nc6 (or …Bd7), keep developing with …Nf6, …e6, …Bd6: the bishop alone is not an attack.'],
'b:e4 c6 d4 d5 e5':['Caro-Kann: Advance','After …Bf5, play …e6, then …c5 to hit the base of the chain (d4), with …Nc6 and …Qb6 adding pressure.'],
'b:d4':['Against 1.d4','You mix …d5 and …Nf6 with …g6. The King\'s Indian set-ups score better for you; the …d5 lines against the London and the Queen\'s Gambit are where points leak.'],
'b:d4 d5 Bf4':['London System','The f4 bishop is White\'s best piece. Ideas: …c5 to hit d4, …Qb6 to hit b2 (the London\'s soft spot), and …Bd6 to trade off the f4 bishop. Watch Nb5 jumping at c7. In your games 2…Nc6 has scored much better than 2…Nf6.'],
'b:d4 d5 Bf4 Nf6 e3':['London: plan with …c5','Instead of only …e6, combine …c5 and …Qb6 (or …Nc6) to pressure d4 and b2. If White plays c3 and Qb3, consider trading queens: the London is much less dangerous without them.'],
'b:d4 d5 c4':['Queen\'s Gambit','…e6, …Nf6, …Be7, …O-O, …Nbd7, then free your game with …c5 or …dxc4 and …c5. The light-squared bishop is your problem piece: plan …b6 and …Bb7, or …dxc4 and …b5.'],
'b:c4':['Against the English','One of your weakest openings. White plays Nc3, g3, Bg2 and expands with b4. Treat it as a reversed Sicilian: 1…e5 gives you a clear central plan (…Nc6, …Nf6, …Bb4 or …d5), or keep your King\'s Indian set-up but push …e5 early so you are not squeezed.']
};
const OVR={
'w:e4 c6 Nf3 d5 Nc3 dxe4 Nxe4 Nf6 Nxf6+ exf6':{x:'d4',a:['d4']},
'w:e4 d5 exd5 Qxd5 Nc3 Qa5':{x:'d4',a:['d4','Nf3']},
'w:e4 e6 Nf3 d5':{x:'Nc3',a:['Nc3','e5']},
'b:e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3':{x:'d6',a:['d6','e5']},
'b:e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5':{x:'Na5',a:['Na5']},
'b:d4 d5 Bf4':{x:'Nf6',a:['Nf6','Nc6','c5']},
'b:d4 d5 Bf4 Nf6 e3':{x:'c5',a:['c5','e6']},
'b:e4 c5 c3 d5 exd5 Qxd5 d4':{x:'Nf6',a:['Nf6','e6','Nc6']},
'b:e4 c6 Nf3 d5 exd5 cxd5 Bb5+':{x:'Nc6',a:['Nc6','Bd7']}
};
const MODS=[
{id:'scotch',c:'w',name:'Scotch Game',roots:['e4 e5 Nf3 Nc6']},
{id:'wsic',c:'w',name:'vs Sicilian',roots:['e4 c5']},
{id:'phil',c:'w',name:'vs Philidor',roots:['e4 e5 Nf3 d6']},
{id:'wcaro',c:'w',name:'vs Caro-Kann',roots:['e4 c6']},
{id:'scan',c:'w',name:'vs Scandinavian',roots:['e4 d5']},
{id:'fren',c:'w',name:'vs French',roots:['e4 e6']},
{id:'bsic',c:'b',name:'Sicilian 2.Nf3',roots:['e4 c5 Nf3']},
{id:'banti',c:'b',name:'Sicilian 2.Bc4 / 2.c3',roots:['e4 c5 Bc4','e4 c5 c3']},
{id:'bd4',c:'b',name:'vs 1.d4',roots:['d4']},
{id:'beng',c:'b',name:'vs English',roots:['c4']},
{id:'bcaro',c:'b',name:'Caro-Kann',roots:['e4 c6']},
{id:'be5',c:'b',name:'1.e4 e5',roots:['e4 e5']}];

/* ================= data ================= */
let USER=LS.get('user','ykaya932');
let CACHE=LS.get('games:'+USER,null);
let ALL=[],GS=[];
const F={tc:'all',per:'all'};
const RES={win:'W',checkmated:'L',resigned:'L',timeout:'L',abandoned:'L',lose:'L',agreed:'D',repetition:'D',stalemate:'D',insufficient:'D','50move':'D',timevsinsufficient:'D'};
const TCM={rapid:'r',blitz:'b',bullet:'u',daily:'d'};
function rowOf(g,ecos){const me=USER.toLowerCase(),w=g.white.username.toLowerCase()===me,p=w?g.white:g.black,o=w?g.black:g.white,pgn=g.pgn||'';
 const eco=((pgn.match(/\[ECOUrl "([^"]+)"/)||[])[1]||'').split('/openings/')[1]||'';let ei=ecos.indexOf(eco);if(ei<0){ecos.push(eco);ei=ecos.length-1}
 const body=pgn.split(/\n\n/).pop()||'';const mv=body.replace(/\{[^}]*\}/g,'').replace(/\d+\.\.\./g,'').replace(/\d+\./g,'').trim().split(/\s+/).filter(x=>x&&!/^(1-0|0-1|1\/2-1\/2|\*)$/.test(x));
 return[(w?'w':'b')+(RES[p.result]||'L')+(TCM[g.time_class]||'r'),p.rating,o.rating,Math.round(g.end_time/3600),ei,mv.slice(0,16).join(' '),mv.length,g.accuracies?Math.round(w?g.accuracies.white:g.accuracies.black):'',(g.url||'').split('/').pop()].join('|')}
function parse(){ALL=[];if(!CACHE)return;for(const k of Object.keys(CACHE.months).sort())for(const l of CACHE.months[k].rows){const p=l.split('|');ALL.push({c:p[0][0],r:p[0][1],tc:p[0][2],my:+p[1],op:+p[2],h:+p[3],eco:CACHE.ecos[+p[4]]||'',mv:p[5]?p[5].split(' '):[],n:+p[6],id:p[8]})}ALL.sort((a,b)=>a.h-b.h)}
function applyF(){const now=Date.now()/36e5;GS=ALL.filter(g=>(F.tc==='all'||(F.tc==='r'?g.tc==='r':g.tc==='b'||g.tc==='u'))&&(F.per==='all'||g.h>now-(+F.per)*24))}
async function sync(first){const btn=$('syncBtn');btn.disabled=true;btn.classList.add('busy');
 const ov=$('loading'),set=(t,s,p)=>{$('loadT').textContent=t;$('loadS').textContent=s||'';$('loadP').style.width=(p||0)+'%'};
 if(first){ov.hidden=false;set('Loading your games…','Contacting chess.com',2)}
 try{
  const prof=await fetch(API+USER.toLowerCase()).then(r=>r.ok?r.json():null).catch(()=>null);if(prof&&prof.avatar)LS.set('avatar:'+USER,prof.avatar);
  const r=await fetch(API+USER.toLowerCase()+'/games/archives');if(!r.ok)throw new Error(r.status===404?`chess.com user "${USER}" not found`:'chess.com is not responding ('+r.status+')');
  const arch=(await r.json()).archives||[];const c=CACHE||{months:{},ecos:[]};const before=ALL.length;
  const now=new Date(),cur=now.getUTCFullYear()+'/'+String(now.getUTCMonth()+1).padStart(2,'0');
  const todo=arch.filter(u=>{const k=u.slice(-7);return!(c.months[k]&&c.months[k].final)});let i=0;
  for(const u of todo){const k=u.slice(-7);set('Loading your games…',`Month ${k} (${++i} of ${todo.length})`,i/todo.length*100);
   const j=await fetch(u).then(x=>x.json());c.months[k]={final:k<cur,rows:(j.games||[]).filter(g=>g.rules==='chess'&&g.pgn).map(g=>rowOf(g,c.ecos))}}
  c.synced=Date.now();CACHE=c;LS.set('games:'+USER,c)||console.warn('storage full');parse();applyF();
  const added=ALL.length-before;toast(first?`${ALL.length.toLocaleString()} games loaded`:added?`${added} new game${added>1?'s':''} added`:'Up to date');
  if(added||first)PR.m=[];refresh();engQueueRepertoire()}
 catch(e){toast(e.message||'Could not reach chess.com',true)}
 finally{ov.hidden=true;btn.disabled=false;btn.classList.remove('busy');renderMe()}}
function toast(msg,bad){$('ustat').textContent=msg;$('ustat').style.color=bad?'var(--loss)':'';setTimeout(()=>{$('ustat').style.color='';renderMe()},4000)}
function renderMe(){$('uname').textContent=USER;const av=LS.get('avatar:'+USER,'');$('av').style.backgroundImage=av?`url("${av}")`:'';
 if($('ustat').style.color)return;$('ustat').textContent=CACHE?`${ALL.length.toLocaleString()} games · synced ${ago(CACHE.synced)}`:'not loaded'}
const ago=t=>{const m=(Date.now()-t)/6e4;return m<1?'just now':m<60?Math.round(m)+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'};

/* ================= stats ================= */
const pts=g=>g.r==='W'?1:g.r==='D'?.5:0;
function tally(gs){const t={n:gs.length,w:0,d:0,l:0,s:0};for(const g of gs){t[g.r==='W'?'w':g.r==='D'?'d':'l']++;t.s+=pts(g)}t.p=t.n?t.s/t.n:0;return t}
const pre=(g,m)=>{for(let i=0;i<m.length;i++)if(g.mv[i]!==m[i])return false;return true};
const by=(c,m)=>GS.filter(g=>g.c===c&&pre(g,m));
function kids(c,m){const map=new Map();for(const g of by(c,m)){const x=g.mv[m.length];if(!x)continue;if(!map.has(x))map.set(x,[]);map.get(x).push(g)}
 return[...map].map(([mv,gs])=>Object.assign({mv},tally(gs))).sort((a,b)=>b.n-a.n)}
const fmt=(m,from=0)=>m.map((x,i)=>{const k=i+from;return(k%2===0?(k/2+1)+'.':(i===0?Math.floor(k/2)+1+'…':''))+x}).join(' ');
const pc=x=>Math.round(x*100)+'%';
const wdl=t=>t.n?`<div class="wdl" title="${t.w} won · ${t.d} drawn · ${t.l} lost"><i class="w" style="width:${t.w/t.n*100}%"></i><i class="d" style="width:${t.d/t.n*100}%"></i><i class="l" style="width:${t.l/t.n*100}%"></i></div>`:'';
function fam(s){const m=s.match(/^(.*?(Defense|Opening|Game|Gambit|Attack|System))/);let x=(m?m[1]:s.split('-').slice(0,3).join('-'));
 return x.replace(/-/g,' ').replace(/\b(Kings|Queens|Petrovs|Alekhines|Owens|Birds)\b/g,w=>w.slice(0,-1)+"'s").replace('Defense','Defence').replace('Caro Kann','Caro-Kann')||'Other'}
function noteFor(c,m){let best=null;for(const k in NOTES){if(k[0]!==c)continue;const km=k.slice(2).split(' ');if(km.length>m.length)continue;if(km.every((x,i)=>x===m[i])&&(!best||km.length>best.len))best={len:km.length,t:NOTES[k]}}return best}
const noteHTML=n=>n?`<div class="note"><h3>${esc(n.t[0])}</h3><p>${esc(n.t[1])}</p></div>`:'';
function leaks(){const out=[];for(const c of'wb'){const gs=GS.filter(g=>g.c===c),base=tally(gs).p,nodes=new Map();
 for(const g of gs)for(let i=2;i<=Math.min(14,g.mv.length);i++){const k=g.mv.slice(0,i).join(' ');let o=nodes.get(k);if(!o)nodes.set(k,o=[]);o.push(g)}
 const cand=[];for(const[k,arr]of nodes){if(arr.length<8)continue;const t=tally(arr);if(base-t.p<.12)continue;cand.push({c,k,m:k.split(' '),t,base,v:(base-t.p)*arr.length})}
 cand.sort((a,b)=>b.v-a.v);const pick=[];for(const x of cand){if(pick.some(p=>x.k.startsWith(p.k+' ')||p.k.startsWith(x.k+' ')))continue;pick.push(x);if(pick.length>=6)break}out.push(...pick)}
 return out.sort((a,b)=>b.v-a.v)}
function modFor(c,m){let best=null;for(const md of MODS){if(md.c!==c)continue;for(const r of md.roots){const rm=r.split(' ');const ok=rm.length<=m.length?rm.every((x,i)=>x===m[i]):m.every((x,i)=>x===rm[i]);if(ok&&(!best||rm.length>best.l))best={l:rm.length,md}}}return best&&best.md}

/* ================= engine ================= */
// EC[fen] = {s,b,pv,d}: full search, score for side to move.  CMP[fen] = {d, m:{uci:score}, b, bs}: your candidate moves scored inside one search.
const EC=LS.get('eng:v3',{}),CMP=LS.get('cmp:v3',{});let ecDirty=0;
const saveEC=()=>{if(ecDirty){LS.set('eng:v3',EC);LS.set('cmp:v3',CMP);ecDirty=0}};setInterval(saveEC,5000);addEventListener('pagehide',saveEC);
const Eng={w:null,q:[],cur:null,ok:true,bg:{total:0,done:0,run:false},
 start(){if(this.w)return;try{this.w=new Worker('engine/stockfish.js');this.w.onmessage=e=>this.msg(String(e.data));this.w.onerror=()=>{this.ok=false;this.fail()};this.w.postMessage('uci');this.w.postMessage('setoption name Hash value 16')}catch(e){this.ok=false}},
 fail(){const q=this.q;this.q=[];if(this.cur)q.unshift(this.cur);this.cur=null;q.forEach(j=>j.res(null));renderEngStat()},
 run(job,prio){if(!this.ok)return Promise.resolve(null);this.start();return new Promise(res=>{job.res=res;job.lines={};if(prio)this.q.unshift(job);else this.q.push(job);this.next()})},
 next(){if(this.cur||!this.q.length)return;const j=this.cur=this.q.shift();const w=this.w;
  w.postMessage('ucinewgame');w.postMessage('setoption name MultiPV value '+(j.mpv||1));w.postMessage('position fen '+j.fen);w.postMessage('go depth '+j.depth+(j.moves?' searchmoves '+j.moves.join(' '):''))},
 msg(t){const j=this.cur;if(!j)return;
  if(t.startsWith('info')&&t.includes(' pv ')){const m=t.match(/score (cp|mate) (-?\d+)/),k=+((t.match(/multipv (\d+)/)||[])[1]||1);if(m){const v=+m[2];const pv=t.split(' pv ')[1].split(' ');j.lines[k]={s:m[1]==='cp'?v:(v>0?10000-v:-10000-v),u:pv[0],pv:pv.slice(0,8)}}}
  else if(t.startsWith('bestmove')){this.cur=null;const L=Object.keys(j.lines).sort((a,b)=>a-b).map(k=>j.lines[k]);j.res({L,b:t.split(' ')[1]});this.next()}},
 // full evaluation of a position
 async eval(fen,depth,prio){const c=EC[fen];if(c&&c.d>=depth)return c;const r=await this.run({fen,depth},prio);if(!r||!r.L.length)return c||null;const x={s:r.L[0].s,b:r.b,pv:r.L[0].pv,d:depth};EC[fen]=x;ecDirty=1;return x},
 // score a set of moves (uci) at the root, plus the best move, within comparable searches
 async cmp(fen,moves,depth,prio){const c=CMP[fen];if(c&&c.d>=depth&&moves.every(u=>u in c.m))return c;
  const best=await this.eval(fen,depth,prio);if(!best)return null;const all=[...new Set([best.b,...moves])];
  const r=await this.run({fen,depth,mpv:all.length,moves:all},prio);if(!r||!r.L.length)return null;
  const m={};for(const l of r.L)m[l.u]=l.s;const bs=r.L[0].s,b=r.L[0].u;
  const x={d:depth,m,b,bs};CMP[fen]=x;ecDirty=1;return x}};
function evalTxt(s){if(s==null)return'·';if(Math.abs(s)>=9000)return(s>0?'+M':'−M')+(10000-Math.abs(s));return(s>0?'+':s<0?'−':'')+(Math.abs(s)/100).toFixed(1)}
// positions in your repertoire: your-turn nodes (after move 1) with >=4 games and your moves with >=3 games
function repPositions(){const out=[];for(const c of'wb'){const nodes=new Map();for(const g of ALL){if(g.c!==c)continue;for(let i=c==='w'?2:1;i<Math.min(14,g.mv.length);i+=2){const k=g.mv.slice(0,i).join(' ');let o=nodes.get(k);if(!o)nodes.set(k,o={n:0,k:new Map()});o.n++;const mv=g.mv[i];o.k.set(mv,(o.k.get(mv)||0)+1)}}
 for(const[k,o]of nodes){if(o.n<4)continue;const m=k?k.split(' '):[];const st=C.play(m);if(!st)continue;const moves=[...o.k].filter(([,n])=>n>=3);if(!moves.length)continue;out.push({c,m,st,n:o.n,moves})}}
 return out.sort((a,b)=>b.n-a.n)}
let REP=null;
async function engQueueRepertoire(){if(Eng.bg.run||!ALL.length||!Eng.ok)return;REP=repPositions();
 const need=REP.filter(p=>{const c=CMP[C.fen(p.st)];return!(c&&c.d>=DEPTH&&p.moves.every(([mv])=>{const m=C.fromSan(p.st,mv);return m&&C.uci(m)in c.m}))});
 Eng.bg={total:need.length,done:0,run:true};renderEngStat();
 for(const p of need){const us=p.moves.map(([mv])=>C.fromSan(p.st,mv)).filter(Boolean).map(C.uci);await Eng.cmp(C.fen(p.st),us,DEPTH);Eng.bg.done++;renderEngStat();if(Eng.bg.done%5===0&&(CUR==='mistakes'||CUR==='home'))refreshLight();if(!Eng.ok)break}
 Eng.bg.run=false;saveEC();renderEngStat();refreshLight()}
function renderEngStat(){const b=Eng.bg,el=$('engStat');if(!Eng.ok){el.textContent='Engine unavailable in this browser';return}
 el.innerHTML=b.run?`Engine checking your openings… ${b.done}/${b.total}<div class="pbar"><i style="width:${b.total?b.done/b.total*100:0}%"></i></div>`:(REP?`Engine: ${Object.keys(CMP).length.toLocaleString()} positions checked`:'')}
function lossOf(st,san){const c=CMP[C.fen(st)];if(!c)return null;const m=C.fromSan(st,san);if(!m)return null;const s=c.m[C.uci(m)];return s==null?null:c.bs-s}
function mistakes(){if(!REP)REP=repPositions();const out=[];
 for(const p of REP){const c=CMP[C.fen(p.st)];if(!c)continue;const best=C.fromUci(p.st,c.b);if(!best)continue;const bestSan=C.san(p.st,best);
  for(const[mv]of p.moves){if(mv===bestSan)continue;const m=C.fromSan(p.st,mv);if(!m)continue;const s=c.m[C.uci(m)];if(s==null)continue;const loss=c.bs-s;
   if(loss<MIST)continue;const games=GS.filter(g=>g.c===p.c&&pre(g,p.m)&&g.mv[p.m.length]===mv);if(games.length<2)continue;
   out.push({c:p.c,m:p.m,st:p.st,mv,n:games.length,t:tally(games),loss,best:bestSan,from:m.from,to:m.to,bf:best.from,bt:best.to})}}
 return out.sort((a,b)=>b.n*Math.min(b.loss,400)-a.n*Math.min(a.loss,400))}
const MIST=90;

/* ================= board ================= */
const pkey=p=>(C.white(p)?'w':'b')+p.toUpperCase();
function mini(st,flip,arrows){let s=`<svg class="mini" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">`;
 for(let r=0;r<8;r++)for(let f=0;f<8;f++){const x=flip?7-f:f,y=flip?r:7-r;s+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${(r+f)%2?'#ebecd0':'#779556'}"/>`}
 for(let i=0;i<64;i++){const p=st.b[i];if(!p)continue;const f=i&7,r=i>>3,x=flip?7-f:f,y=flip?r:7-r;s+=`<image href="${PIECE_URL[pkey(p)]}" x="${x}" y="${y}" width="1" height="1"/>`}
 for(const a of arrows||[])s+=arrowSVG(a.from,a.to,flip,a.col,1);
 return s+'</svg>'}
function xy(s,flip){const f=s&7,r=s>>3;return[flip?7-f:f,flip?r:7-r]}
function arrowSVG(a,b,flip,col,u){const[x1,y1]=xy(a,flip),[x2,y2]=xy(b,flip);const ax=x1+.5,ay=y1+.5,bx=x2+.5,by=y2+.5,dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;
 const hx=bx-ux*.42,hy=by-uy*.42,w=.15,hw=.36;const px=-uy,py=ux;
 const pts=[[ax+px*w/2+ux*.2,ay+py*w/2+uy*.2],[hx+px*w/2,hy+py*w/2],[hx+px*hw/2*1.2,hy+py*hw/2*1.2],[bx-ux*.08,by-uy*.08],[hx-px*hw/2*1.2,hy-py*hw/2*1.2],[hx-px*w/2,hy-py*w/2],[ax-px*w/2+ux*.2,ay-py*w/2+uy*.2]].map(p=>p.map(v=>(v*u).toFixed(3)).join(',')).join(' ');
 return`<polygon points="${pts}" fill="${col}" opacity=".85"/>`}
class Board{
 constructor(el,o){this.el=el;this.o=o;this.st=C.start();this.flip=false;this.sel=-1;this.last=null;this.marks={};this.arrows=[];this.pcs={};
  let h='';for(let s=0;s<64;s++)h+=`<div class="sq" data-s="${s}"></div>`;el.innerHTML=h+'<div class="pcs"></div><svg class="arrows" viewBox="0 0 800 800"></svg>';
  this.sqEls=[...el.querySelectorAll('.sq')];this.pl=el.querySelector('.pcs');this.svg=el.querySelector('svg.arrows');
  el.addEventListener('pointerdown',e=>this.down(e));el.addEventListener('pointermove',e=>this.move(e));el.addEventListener('pointerup',e=>this.up(e));el.addEventListener('pointercancel',()=>this.cancel())}
 sqAt(e){const r=this.el.getBoundingClientRect();const x=Math.floor((e.clientX-r.left)/r.width*8),y=Math.floor((e.clientY-r.top)/r.height*8);if(x<0||x>7||y<0||y>7)return-1;const f=this.flip?7-x:x,rk=this.flip?y:7-y;return rk*8+f}
 canMove(s){const p=this.st.b[s];if(!p||(this.o.locked&&this.o.locked()))return false;if(C.white(p)!==(this.st.t==='w'))return false;return!this.o.side||this.o.side()===this.st.t}
 down(e){const s=this.sqAt(e);if(s<0)return;if(this.sel>=0&&this.sel!==s&&this.tryMove(this.sel,s))return;
  if(this.canMove(s)){this.sel=s;this.drag={s,x:e.clientX,y:e.clientY,el:this.pcs[s],moved:false};this.el.setPointerCapture(e.pointerId);this.paint()}else{this.sel=-1;this.paint()}}
 move(e){const d=this.drag;if(!d||!d.el)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.hypot(dx,dy)<4)return;d.moved=true;d.el.classList.add('drag');d.el.style.transform=`translate(${dx}px,${dy}px) scale(1.12)`}
 up(e){const d=this.drag;this.drag=null;if(!d)return;if(d.el){d.el.classList.remove('drag');d.el.style.transform=''}if(d.moved){const t=this.sqAt(e);if(t>=0&&t!==d.s&&this.tryMove(d.s,t,true))return;}}
 cancel(){const d=this.drag;this.drag=null;if(d&&d.el){d.el.classList.remove('drag');d.el.style.transform=''}}
 tryMove(a,b,dragged){const ms=C.legal(this.st).filter(m=>m.from===a&&m.to===b);if(!ms.length)return false;const m=ms.find(x=>!x.promo||x.promo==='Q');this.sel=-1;this.o.move(m,dragged);return true}
 set(st,o={}){const prev=this.st;this.st=st;if('last'in o)this.last=o.last;if('flip'in o)this.flip=o.flip;this.sel=-1;this.marks={};this.arrows=o.arrows||[];this.paint(o.anim&&!o.noAnim?o.anim:null,o.dragged)}
 paint(anim,dragged){const tg=new Set(),cp=new Set();if(this.sel>=0)for(const m of C.legal(this.st))if(m.from===this.sel){tg.add(m.to);if(m.cap)cp.add(m.to)}
  this.sqEls.forEach((el,s)=>{const[x,y]=xy(s,this.flip);el.style.left=x*12.5+'%';el.style.top=y*12.5+'%';const f=s&7,r=s>>3;
   let c='sq '+((r+f)%2?'l':'d');if(this.last&&(this.last.from===s||this.last.to===s))c+=' last';if(s===this.sel)c+=' sel';if(tg.has(s))c+=' tg';if(cp.has(s))c+=' cp';if(this.marks[s])c+=' '+this.marks[s];el.className=c;
   el.innerHTML=(x===0?`<span class="co r">${r+1}</span>`:'')+(y===7?`<span class="co f">${'abcdefgh'[f]}</span>`:'')});
  if(this.drag)return;
  let h='';for(let s=0;s<64;s++){const p=this.st.b[s];if(!p)continue;const[x,y]=xy(s,this.flip);h+=`<div class="pc" data-s="${s}" style="left:${x*12.5}%;top:${y*12.5}%;background-image:url('${PIECE_URL[pkey(p)]}')"></div>`}
  this.pl.innerHTML=h;this.pcs={};this.pl.querySelectorAll('.pc').forEach(el=>this.pcs[+el.dataset.s]=el);
  if(anim&&!dragged&&this.pcs[anim.to]&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const el=this.pcs[anim.to],[x1,y1]=xy(anim.from,this.flip),[x2,y2]=xy(anim.to,this.flip),w=this.el.clientWidth/8;
   el.style.transform=`translate(${(x1-x2)*w}px,${(y1-y2)*w}px)`;el.getBoundingClientRect();el.classList.add('anim');el.style.transform='';setTimeout(()=>el.classList.remove('anim'),220)}
  this.svg.innerHTML=this.arrows.map(a=>arrowSVG(a.from,a.to,this.flip,a.col,100)).join('')}
 mark(m){this.marks=m;this.paint()}
 arrow(a){this.arrows=a;this.svg.innerHTML=a.map(x=>arrowSVG(x.from,x.to,this.flip,x.col,100)).join('')}}

/* ================= dashboard ================= */
let RTC='r',MPC='w';
function home(){const W=tally(GS.filter(g=>g.c==='w')),B=tally(GS.filter(g=>g.c==='b'));const M=mistakes();
 $('kpis').innerHTML=[['Games',GS.length.toLocaleString(),F.per==='all'?'all time':'in this period',null],['As White',pc(W.p),`${W.w}W ${W.d}D ${W.l}L`,W],['As Black',pc(B.p),`${B.w}W ${B.d}D ${B.l}L`,B],['Engine mistakes',REP?M.length:'…',Eng.bg.run?`checking ${Eng.bg.done}/${Eng.bg.total}`:'repeated in your games',null]]
  .map(([a,b,c,t])=>`<div class="kpi"><small>${a}</small><b>${b}</b><span>${c}</span>${t?wdl(t):''}</div>`).join('');
 drawRating();
 const L=leaks();$('leaks').innerHTML=L.length?L.slice(0,6).map((x,j)=>{const st=C.play(x.m);const md=modFor(x.c,x.m);const prev=C.play(x.m.slice(0,-1));const lm=prev&&C.fromSan(prev,x.m[x.m.length-1]);
  return`<div class="leak">${mini(st,x.c==='b',lm?[{from:lm.from,to:lm.to,col:'#f06b54'}]:[])}<div><div class="t">${x.c==='w'?'White':'Black'} · ${esc(fmt(x.m))}</div><div class="d">${x.t.n} games · ${x.t.w}W ${x.t.d}D ${x.t.l}L · you usually score ${pc(x.base)}</div><div class="act"><button class="chip" data-ex="${j}">Explore</button>${md?`<button class="chip pri" data-pr="${md.id}">Practice</button>`:''}</div></div><div class="s"><b>${pc(x.t.p)}</b><small>score</small></div></div>`}).join(''):'<div class="empty">No line scores clearly below your average in this selection.</div>';
 $('leaks').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.ex){const x=L[+b.dataset.ex];EX.c=x.c;EX.m=x.m.slice();go('explore')}else if(b.dataset.pr){PR.mod=b.dataset.pr;PR.m=[];go('practice')}};
 mostPlayed();
 $('homeMist').innerHTML=M.length?M.slice(0,4).map((x,i)=>mcard(x,i)).join(''):`<div class="empty">${Eng.ok?(Eng.bg.run?'The engine is checking your most played positions. Results appear here as they come in.':'No repeated engine mistakes found yet.'):'The engine could not start in this browser.'}</div>`;
 $('homeMist').onclick=e=>{const b=e.target.closest('[data-mi]');if(b){const x=M[+b.dataset.mi];EX.c=x.c;EX.m=x.m.slice();go('explore')}}}
function mcard(x,i){return`<button class="mcard" data-mi="${i}">${mini(x.st,x.c==='b',[{from:x.from,to:x.to,col:'#f06b54'},{from:x.bf,to:x.bt,col:'#8fc15a'}])}<div class="l1">${x.c==='w'?'White':'Black'} · ${esc(fmt(x.m.slice(-4),x.m.length-Math.min(4,x.m.length)))||'start'}</div><div class="l2">You play <span class="bad">${esc(x.mv)}</span> · best <span class="good">${esc(x.best)}</span></div><div class="l1">${x.n} games · costs ${(Math.min(x.loss,999)/100).toFixed(1)} pawns · ${pc(x.t.p)} score</div></button>`}
function mostPlayed(){const map=new Map();for(const g of GS)if(g.c===MPC){const f=fam(g.eco);if(!map.has(f))map.set(f,[]);map.get(f).push(g)}
 const rows=[...map].map(([f,gs])=>{const t=tally(gs);const cnt=new Map();for(const g of gs){const k=g.mv.slice(0,4).join(' ');cnt.set(k,(cnt.get(k)||0)+1)}return{f,t,line:[...cnt].sort((a,b)=>b[1]-a[1])[0][0]}}).sort((a,b)=>b.t.n-a.t.n).slice(0,8);
 $('mp').innerHTML=rows.map((r,i)=>`<div class="op" data-i="${i}" style="cursor:pointer"><div><div class="n">${esc(r.f)}</div><small>${r.t.n} games</small></div>${wdl(r.t)}<div class="p">${pc(r.t.p)}</div></div>`).join('')||'<div class="empty">No games.</div>';
 $('mp').onclick=e=>{const d=e.target.closest('.op');if(d){const r=rows[+d.dataset.i];EX.c=MPC;EX.m=r.line.split(' ');go('explore')}}}
function drawRating(){const box=$('rChart'),s=box.querySelector('svg'),W=box.clientWidth,H=box.clientHeight;if(!W)return;
 const now=Date.now()/36e5;const gs=ALL.filter(g=>g.tc===RTC&&(F.per==='all'||g.h>now-(+F.per)*24));
 if(gs.length<2){s.innerHTML='';$('rNow').textContent=gs.length?gs[0].my:'–';$('rDelta').innerHTML='';return}
 const day=new Map();for(const g of gs)day.set(Math.floor(g.h/24),g.my);const P=[...day];const x0=P[0][0],x1=P[P.length-1][0];
 const ys=P.map(p=>p[1]),lo=Math.floor((Math.min(...ys)-20)/100)*100,hi=Math.ceil((Math.max(...ys)+20)/100)*100;const pl=38,pr=6,pt=8,pb=22;
 const X=d=>pl+(d-x0)/(x1-x0||1)*(W-pl-pr),Y=v=>pt+(hi-v)/(hi-lo||1)*(H-pt-pb);
 let g='<defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc15a" stop-opacity=".35"/><stop offset="1" stop-color="#8fc15a" stop-opacity="0"/></linearGradient></defs>';
 const step=hi-lo>800?200:100;for(let v=lo;v<=hi;v+=step)g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#3b3832"/><text x="${pl-8}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="#7d766b">${v}</text>`;
 const months=[];let pm='';for(const[d]of P){const dt=new Date(d*864e5),k=dt.getUTCFullYear()*12+dt.getUTCMonth();if(k!==pm){pm=k;months.push([d,dt])}}
 const every=Math.max(1,Math.ceil(months.length/(W<480?3:6)));months.forEach(([d,dt],i)=>{if(i%every===0)g+=`<text x="${Math.max(pl+12,Math.min(W-20,X(d)))}" y="${H-5}" font-size="11" fill="#7d766b" text-anchor="middle">${dt.toLocaleDateString('en',{month:'short',year:'2-digit'})}</text>`});
 const line=P.map((p,i)=>(i?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join('');
 g+=`<path d="${line}L${X(x1)} ${H-pb}L${X(x0)} ${H-pb}Z" fill="url(#rg)"/><path d="${line}" fill="none" stroke="#8fc15a" stroke-width="2" stroke-linejoin="round"/><circle id="rdot" r="4.5" fill="#8fc15a" stroke="#161512" stroke-width="2" cx="${X(x1)}" cy="${Y(P[P.length-1][1])}"/>`;
 s.innerHTML=g;const last=P[P.length-1][1],first=P[0][1],d=last-first;$('rNow').textContent=last;$('rDelta').innerHTML=`<span class="${d>=0?'up':'down'}">${d>=0?'▲':'▼'} ${Math.abs(d)}</span> <span class="small">since ${new Date(x0*864e5).toLocaleDateString('en',{month:'short',year:'numeric'})}</span>`;
 const tip=$('rTip');box.onpointermove=e=>{const r=box.getBoundingClientRect(),mx=e.clientX-r.left;let bi=0,bd=1e9;P.forEach((p,i)=>{const dd=Math.abs(X(p[0])-mx);if(dd<bd){bd=dd;bi=i}});const p=P[bi];
  const dot=s.querySelector('#rdot');dot.setAttribute('cx',X(p[0]));dot.setAttribute('cy',Y(p[1]));tip.hidden=false;tip.style.left=X(p[0])+'px';tip.style.top=Y(p[1])+'px';tip.innerHTML=`<b>${p[1]}</b> · ${new Date(p[0]*864e5).toLocaleDateString('en',{day:'numeric',month:'short',year:'numeric'})}`};
 box.onpointerleave=()=>{tip.hidden=true;const dot=s.querySelector('#rdot');dot.setAttribute('cx',X(x1));dot.setAttribute('cy',Y(last))}}

/* ================= explorer ================= */
const EX={c:'w',m:[]};let eB,eTok=0;
function explore(anim){const st=C.play(EX.m)||C.start();const prev=EX.m.length?C.play(EX.m.slice(0,-1)):null,lm=prev&&C.fromSan(prev,EX.m[EX.m.length-1]);
 eB.set(st,{last:lm||null,flip:EX.c==='b',anim:anim?lm:null});
 segOn('eCol',EX.c);
 $('ePath').innerHTML=EX.m.length?EX.m.map((x,i)=>(i%2===0?`<span class="no">${i/2+1}.</span>`:'')+`<button data-i="${i}" class="${i===EX.m.length-1?'cur':''}">${esc(x)}</button>`).join(''):'<span class="no">Start position · pick a move below or play one on the board</span>';
 const here=tally(by(EX.c,EX.m)),K=kids(EX.c,EX.m),mine=(st.t==='w')===(EX.c==='w');
 $('eInfo').innerHTML=`<b>${here.n}</b> of your games reached this position${here.n?` · you scored <b>${pc(here.p)}</b>`:''} · ${mine?'your move':'opponent to move'}`;
 const ov=OVR[EX.c+':'+EX.m.join(' ')];
 const rowsHTML=()=>`<div class="row hd"><span>Move</span><span class="r">Games</span><span>Results</span><span class="r">Score</span><span class="r">Engine</span></div>`+K.map(k=>{const m=C.fromSan(st,k.mv),cp=CMP[C.fen(st)],sv=cp&&m?cp.m[C.uci(m)]:null;const v=sv==null?null:(mine?sv:-sv);const loss=mine&&sv!=null?cp.bs-sv:0;
  return`<div class="row" data-m="${esc(k.mv)}"><span class="mv">${esc(k.mv)}${ov&&ov.x===k.mv?'<span class="tag">tip</span>':''}</span><span class="r">${k.n}</span>${wdl(k)}<span class="r"><b>${pc(k.p)}</b></span><span class="ev ${loss>=MIST?'bad':''}">${evalTxt(v)}</span></div>`}).join('')+(K.length?'':`<div class="empty">None of your games continued from here${ov?` · suggested move: <b>${esc(ov.x)}</b>`:''}.</div>`);
 $('eRows').innerHTML=rowsHTML();$('eNote').innerHTML=noteHTML(noteFor(EX.c,EX.m));
 // engine
 const tok=++eTok,fen=C.fen(st);
 const show=E=>{if(tok!==eTok)return;if(!E){$('eEng').innerHTML='<span class="small">Engine unavailable</span>';return}
  const ws=st.t==='w'?E.s:-E.s,mineS=(EX.c==='w')?ws:-ws;const bar=$('eEval');const pct=50+50*Math.tanh(ws/450);bar.querySelector('i').style.height=pct+'%';bar.querySelector('span').textContent=evalTxt(Math.abs(ws)).replace(/^[+−]/,'');bar.classList.toggle('neg',ws<0);bar.style.transform=EX.c==='b'?'rotate(180deg)':'';bar.querySelector('span').style.transform=EX.c==='b'?'rotate(180deg)':'';
  let s=st,pv=[];for(const u of E.pv.slice(0,6)){const m=C.fromUci(s,u);if(!m)break;pv.push(C.san(s,m));s=C.make(s,m)}
  const bm=C.fromUci(st,E.b);$('eEng').innerHTML=`<b class="${mineS>=0?'up':'down'}">${evalTxt(mineS)}</b><span class="pv">${esc(fmt(pv,EX.m.length))}</span><span class="small" style="margin-left:auto">depth ${E.d}</span>`;
  if(bm)eB.arrow([{from:bm.from,to:bm.to,col:'#8fc15a'}])};
 const c=EC[fen];if(c)show(c);else $('eEng').innerHTML='<span class="small">Engine thinking…</span>';
 Eng.eval(fen,DEPTH,true).then(show);
 const us=K.slice(0,6).map(k=>C.fromSan(st,k.mv)).filter(Boolean).map(C.uci);if(us.length)Eng.cmp(fen,us,DEPTH-2,true).then(()=>{if(tok===eTok)$('eRows').innerHTML=rowsHTML()})}
function exGo(mv){EX.m.push(mv);explore(true)}

/* ================= mistakes page ================= */
function mistakesPage(){const M=mistakes();$('mIntro').textContent=Eng.ok?`Positions from your own games where you have repeatedly played a move that Stockfish rates at least 0.9 pawns worse than the best move.${Eng.bg.run?` Checking ${Eng.bg.done} of ${Eng.bg.total} positions…`:''} Red arrow: your move. Green arrow: engine's move.`:'The engine could not start in this browser.';
 $('mList').innerHTML=M.map((x,i)=>mcard(x,i)).join('')||'<div class="empty">Nothing yet.</div>';
 $('mList').onclick=e=>{const b=e.target.closest('[data-mi]');if(b){const x=M[+b.dataset.mi];EX.c=x.c;EX.m=x.m.slice();go('explore')}}}

/* ================= practice ================= */
const PR={mod:null,m:[],busy:false,tries:0,lineErr:0,done:false,exp:null};let pB;
const prog=LS.get('prog',{mist:{},mods:{}});const saveProg=()=>LS.set('prog',prog);
const modGames=md=>GS.filter(g=>g.c===md.c&&md.roots.some(r=>pre(g,r.split(' '))));
const curMod=()=>MODS.find(x=>x.id===PR.mod);
function renderMods(){const L=leaks();$('mods').innerHTML=MODS.map(md=>{const t=tally(modGames(md)),lk=L.filter(x=>{const m=modFor(x.c,x.m);return m&&m.id===md.id}).length,pg=prog.mods[md.id];const st=C.play(md.roots[0].split(' '));
 return`<button class="mod ${PR.mod===md.id?'on':''}" data-id="${md.id}">${mini(st,md.c==='b')}<b>${esc(md.name)}</b><small>${md.c==='w'?'White':'Black'} · ${t.n} games · ${t.n?pc(t.p):'–'}${lk?` · <span class="lk">${lk} leak${lk>1?'s':''}</span>`:''}${pg?`<br>${pg.lines} lines drilled`:''}</small></button>`}).join('')}
function expected(c,m,st){const key=c+':'+m.join(' '),ov=OVR[key],K=kids(c,m);
 if(ov)return{x:ov.x,a:ov.a,why:'tip',K};
 if(!K.length||K[0].n<2)return null;
 const a=[K[0].mv];for(const k of K.slice(1))if(k.n>=5&&k.p>=K[0].p)a.push(k.mv);
 const cp=CMP[C.fen(st)];if(cp){const best=C.fromUci(st,cp.b),bs=best&&C.san(st,best),l=lossOf(st,K[0].mv);
  if(bs&&l!=null&&l>=150&&bs!==K[0].mv)return{x:bs,a:[bs,...K.filter(k=>{const q=lossOf(st,k.mv);return q!=null&&q<40}).map(k=>k.mv)],why:'engine',loss:l,yours:K[0].mv,K}}
 return{x:K[0].mv,a,why:'book',K}}
function newLine(){if(!PR.mod){const L=leaks();const m=L.length&&modFor(L[0].c,L[0].m);PR.mod=(m||MODS[0]).id}
 const md=curMod();renderMods();
 const w=md.roots.map(r=>Math.max(1,by(md.c,r.split(' ')).length));let rn=Math.random()*w.reduce((a,b)=>a+b),ri=0;while(ri<w.length-1&&rn>w[ri]){rn-=w[ri];ri++}
 PR.m=md.roots[ri].split(' ');PR.tries=0;PR.lineErr=0;PR.done=false;PR.exp=null;
 const st=C.play(PR.m),prev=C.play(PR.m.slice(0,-1));pB.set(st,{flip:md.c==='b',last:prev?C.fromSan(prev,PR.m[PR.m.length-1]):null});
 fb('','');renderProg();step()}
const myTurn=()=>{const md=curMod();return(pB.st.t==='w')===(md.c==='w')};
function fb(t,c){$('pFb').className='cfb '+(c||'');$('pFb').textContent=t}
function status(t,col){$('pStatus').innerHTML=`<span class="dot" style="background:${col}"></span>${esc(t)}`}
function step(){const md=curMod();renderPath();$('pNote').innerHTML=noteHTML(noteFor(md.c,PR.m));
 if(PR.m.length>=16)return finish('Line complete');
 if(myTurn()){const e=expected(md.c,PR.m,pB.st);if(!e)return finish('End of your book');PR.exp=e;PR.tries=0;status('Your move',md.c==='w'?'#fff':'#111');
  return}
 const K=kids(md.c,PR.m).filter(k=>k.n>=2);if(!K.length)return finish('End of your book');
 const w=K.map(k=>{const mi=prog.mist[md.c+':'+PR.m.concat(k.mv).join(' ')]||0;return k.n*(1+2*Math.min(mi,3))*(1+Math.max(0,.5-k.p))});
 let r=Math.random()*w.reduce((a,b)=>a+b),i=0;while(i<K.length-1&&r>w[i]){r-=w[i];i++}const k=K[i];
 PR.busy=true;status('Opponent is thinking…','#7c766c');
 setTimeout(()=>{PR.busy=false;const mv=C.fromSan(pB.st,k.mv);PR.m.push(k.mv);pB.set(C.make(pB.st,mv),{last:mv,anim:mv});fb(`${md.c==='w'?'Black':'White'} played ${fmt([k.mv],PR.m.length-1)}: seen in ${k.n} of your games, you scored ${pc(k.p)}.`);step()},550)}
function userMove(m,dragged){const md=curMod(),e=PR.exp;if(!e||PR.done)return;const s=C.san(pB.st,m),key=md.c+':'+PR.m.join(' ');
 if(e.a.includes(s)){if(PR.tries===0&&prog.mist[key])prog.mist[key]=Math.max(0,prog.mist[key]-1);
  PR.m.push(s);pB.set(C.make(pB.st,m),{last:m,anim:m,dragged});pB.mark({[m.to]:'ok'});const k=e.K.find(x=>x.mv===s);
  fb(`✓ ${s}${e.why==='engine'&&s===e.x?` (engine move; your usual ${e.yours} costs ${(e.loss/100).toFixed(1)} pawns)`:e.why==='tip'&&s===e.x?' (recommended)':''}${k?` · you've played it ${k.n}×, scoring ${pc(k.p)}`:''}`,'ok');PR.exp=null;saveProg();setTimeout(step,300)}
 else{PR.tries++;if(PR.tries===1){PR.lineErr++;prog.mist[key]=(prog.mist[key]||0)+1;saveProg()}
  pB.set(pB.st,{});pB.mark({[m.from]:'bad',[m.to]:'bad'});const k=e.K.find(x=>x.mv===s);
  fb(`${s} is not the move to learn here${k?` (you played it ${k.n}×, ${pc(k.p)})`:''}. Try again or press Hint.`,'no');setTimeout(()=>pB.mark({}),800)}}
function finish(why){const md=curMod();PR.done=true;PR.exp=null;const p=prog.mods[md.id]||(prog.mods[md.id]={lines:0,clean:0});p.lines++;if(!PR.lineErr)p.clean++;saveProg();
 status(PR.lineErr?`${why} · ${PR.lineErr} slip${PR.lineErr>1?'s':''}`:`${why} · perfect`,PR.lineErr?'#e7b84c':'#8fc15a');renderProg();renderMods()}
function renderPath(){$('pPath').innerHTML=PR.m.map((x,i)=>(i%2===0?`<span class="no">${i/2+1}.</span>`:'')+`<button class="${i===PR.m.length-1?'cur':''}" tabindex="-1">${esc(x)}</button>`).join('')}
function renderProg(){const md=curMod();if(!md)return;const p=prog.mods[md.id]||{lines:0,clean:0};const keys=Object.entries(prog.mist).filter(([k,v])=>v>0&&k[0]===md.c&&md.roots.some(r=>k.slice(2).startsWith(r))).length;
 $('pProg').innerHTML=`<div><b>${p.lines}</b><span>lines drilled</span></div><div><b>${p.lines?pc(p.clean/p.lines):'–'}</b><span>without a slip</span></div><div><b>${keys}</b><span>to review</span></div>`}
function hint(show){const e=PR.exp;if(!e)return;const m=C.fromSan(pB.st,e.x);if(!m)return;const md=curMod(),key=md.c+':'+PR.m.join(' ');
 if(PR.tries===0){PR.lineErr++;prog.mist[key]=(prog.mist[key]||0)+1;saveProg()}PR.tries=Math.max(PR.tries,1);
 if(show){userMove(m);return}pB.arrow([{from:m.from,to:m.to,col:'#e7b84c'}]);fb(e.why==='engine'?`Engine suggestion. Your usual ${e.yours} costs ${(e.loss/100).toFixed(1)} pawns here.`:e.a.length>1?`Also fine: ${e.a.filter(x=>x!==e.x).join(', ')}`:'Follow the arrow.')}

/* ================= shell ================= */
let CUR='home';
const TITLES={home:'Dashboard',explore:'Openings',mistakes:'Mistakes',practice:'Practice',settings:'Settings'};
function segOn(id,v){[...$(id).children].forEach(b=>b.classList.toggle('on',b.dataset.v===v))}
function go(v){CUR=v;for(const k in TITLES)$('v-'+k).hidden=k!==v;$('title').textContent=TITLES[v];document.querySelectorAll('#nav button,#bnav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
 document.querySelector('.filters').style.visibility=v==='settings'?'hidden':'';try{history.replaceState(null,'','#'+v)}catch(e){}scrollTo(0,0);refresh()}
function refresh(){renderMe();if(!CACHE&&CUR!=='settings')return;
 if(CUR==='home')home();else if(CUR==='explore')explore();else if(CUR==='mistakes')mistakesPage();else if(CUR==='practice'){renderMods();if(!PR.m.length||!PR.mod)newLine();else renderProg()}else if(CUR==='settings'){$('uIn').value=USER;$('depthV').textContent=DEPTH}}
let lt=0;function refreshLight(){const n=Date.now();if(n-lt<1500)return;lt=n;if(CUR==='home')home();else if(CUR==='mistakes')mistakesPage()}
function init(){
 $('bnav').innerHTML=$('nav').innerHTML;
 parse();applyF();
 eB=new Board($('eBoard'),{move:(m,d)=>{EX.m.push(C.san(eB.st,m));explore(!d)}});
 pB=new Board($('pBoard'),{move:userMove,locked:()=>PR.busy||PR.done||!PR.exp,side:()=>{const md=curMod();return md?md.c:'w'}});
 const navClick=e=>{const b=e.target.closest('button[data-v]');if(b)go(b.dataset.v)};$('nav').onclick=navClick;$('bnav').onclick=navClick;
 document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});
 const seg=(id,cb)=>$(id).addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;segOn(id,b.dataset.v);cb(b.dataset.v)});
 seg('fTc',v=>{F.tc=v;applyF();PR.m=[];refresh()});seg('fPer',v=>{F.per=v;applyF();PR.m=[];refresh()});
 seg('rTc',v=>{RTC=v;drawRating()});seg('mpCol',v=>{MPC=v;mostPlayed()});seg('eCol',v=>{EX.c=v;EX.m=[];explore()});
 $('eBack').onclick=()=>{EX.m.pop();explore()};$('eStart').onclick=()=>{EX.m=[];explore()};
 $('ePath').onclick=e=>{const b=e.target.closest('button');if(b){EX.m=EX.m.slice(0,+b.dataset.i+1);explore()}};
 $('eRows').onclick=e=>{const r=e.target.closest('.row[data-m]');if(r)exGo(r.dataset.m)};
 document.addEventListener('keydown',e=>{if(CUR==='explore'&&e.target.tagName!=='INPUT'){if(e.key==='ArrowLeft'){EX.m.pop();explore()}}});
 $('mods').onclick=e=>{const b=e.target.closest('.mod');if(!b)return;PR.mod=b.dataset.id;newLine()};
 $('pNext').onclick=newLine;$('pHint').onclick=()=>hint(false);$('pShow').onclick=()=>hint(true);
 $('syncBtn').onclick=()=>sync(!CACHE);
 $('uForm').onsubmit=e=>{e.preventDefault();const u=$('uIn').value.trim();if(!u)return;USER=u;LS.set('user',u);CACHE=LS.get('games:'+u,null);REP=null;PR.m=[];parse();applyF();sync(!CACHE).then(()=>go('home'))};
 $('engRun').onclick=()=>{engQueueRepertoire();$('setMsg').textContent='Engine analysis started; progress shows in the sidebar.'};
 $('engClear').onclick=()=>{for(const k in EC)delete EC[k];for(const k in CMP)delete CMP[k];LS.del('eng:v3');LS.del('cmp:v3');$('setMsg').textContent='Engine cache cleared.';renderEngStat()};
 $('allClear').onclick=()=>{if($('allClear').dataset.sure){try{Object.keys(localStorage).filter(k=>k.startsWith('oc:')).forEach(k=>localStorage.removeItem(k))}catch(e){}location.reload()}else{$('allClear').dataset.sure=1;$('allClear').textContent='Tap again to delete everything'}};
 new ResizeObserver(()=>{if(CUR==='home')drawRating()}).observe($('rChart'));
 const h=location.hash.slice(1);go(TITLES[h]?h:'home');
 if(!CACHE)sync(true);else{const stale=Date.now()-(CACHE.synced||0)>30*6e4;if(stale)sync(false);else engQueueRepertoire()}
 if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{})}
window.__oc={EC,CMP,Eng,C,mistakes:()=>mistakes()};
try{init()}catch(e){document.body.insertAdjacentHTML('afterbegin',`<p style="padding:20px;color:#f06b54">Something went wrong: ${esc(e.message)}</p>`);console.error(e)}
}
