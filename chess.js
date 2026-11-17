// Minimal chess rules: legal move generation + SAN. Square index = rank*8+file (a1=0).
const Chess=(()=>{
const N=[[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]],K=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
const BD=[[1,1],[1,-1],[-1,1],[-1,-1]],RD=[[1,0],[-1,0],[0,1],[0,-1]];
const sqName=s=>'abcdefgh'[s&7]+((s>>3)+1);
const white=p=>p&&p===p.toUpperCase();
function start(){const b=Array(64).fill(null),r='RNBQKBNR';for(let f=0;f<8;f++){b[f]=r[f];b[8+f]='P';b[48+f]='p';b[56+f]=r[f].toLowerCase()}return{b,t:'w',c:'KQkq',ep:-1}}
function attacked(b,s,byW){const f=s&7,r=s>>3;
 const at=(df,dr)=>{const F=f+df,R=r+dr;return F>=0&&F<8&&R>=0&&R<8?b[R*8+F]:undefined};
 const is=(p,t)=>p&&white(p)===byW&&p.toUpperCase()===t;
 const pr=byW?-1:1;if(is(at(-1,pr),'P')||is(at(1,pr),'P'))return true;
 for(const[a,c]of N)if(is(at(a,c),'N'))return true;
 for(const[a,c]of K)if(is(at(a,c),'K'))return true;
 for(const[ds,ts]of[[BD,'BQ'],[RD,'RQ']])for(const[a,c]of ds){let F=f+a,R=r+c;while(F>=0&&F<8&&R>=0&&R<8){const p=b[R*8+F];if(p){if(white(p)===byW&&ts.includes(p.toUpperCase()))return true;break}F+=a;R+=c}}
 return false}
function pseudo(st){const{b,t}=st,W=t==='w',ms=[];
 for(let s=0;s<64;s++){const p=b[s];if(!p||white(p)!==W)continue;const T=p.toUpperCase(),f=s&7,r=s>>3;
  const add=(to,x)=>ms.push(Object.assign({from:s,to,p:T},x||{}));
  const ok=(F,R)=>F>=0&&F<8&&R>=0&&R<8;
  if(T==='P'){const d=W?1:-1,R=r+d,last=W?7:0;
   const push=(to,x)=>{if(R===last)for(const q of'QRBN')add(to,Object.assign({promo:q},x));else add(to,x)};
   if(ok(f,R)&&!b[R*8+f]){push(R*8+f);const R2=r+2*d;if((W?r===1:r===6)&&!b[R2*8+f])add(R2*8+f,{dbl:1})}
   for(const df of[-1,1]){const F=f+df;if(!ok(F,R))continue;const to=R*8+F,q=b[to];if(q&&white(q)!==W)push(to,{cap:1});else if(to===st.ep)add(to,{cap:1,ep:1})}
  }else if(T==='N'||T==='K'){for(const[a,c]of T==='N'?N:K){const F=f+a,R=r+c;if(!ok(F,R))continue;const q=b[R*8+F];if(!q)add(R*8+F);else if(white(q)!==W)add(R*8+F,{cap:1})}
   if(T==='K'){const home=W?4:60,cs=W?'KQ':'kq';if(s===home&&!attacked(b,s,!W)){
    if(st.c.includes(cs[0])&&!b[s+1]&&!b[s+2]&&b[s+3]===(W?'R':'r')&&!attacked(b,s+1,!W)&&!attacked(b,s+2,!W))add(s+2,{castle:'K'});
    if(st.c.includes(cs[1])&&!b[s-1]&&!b[s-2]&&!b[s-3]&&b[s-4]===(W?'R':'r')&&!attacked(b,s-1,!W)&&!attacked(b,s-2,!W))add(s-2,{castle:'Q'})}}
  }else{const ds=T==='B'?BD:T==='R'?RD:BD.concat(RD);for(const[a,c]of ds){let F=f+a,R=r+c;while(ok(F,R)){const q=b[R*8+F];if(!q)add(R*8+F);else{if(white(q)!==W)add(R*8+F,{cap:1});break}F+=a;R+=c}}}
 }return ms}
function make(st,m){const b=st.b.slice(),W=st.t==='w';let p=b[m.from];b[m.from]=null;
 if(m.ep)b[m.to+(W?-8:8)]=null;
 if(m.promo)p=W?m.promo:m.promo.toLowerCase();b[m.to]=p;
 if(m.castle){const rf=m.castle==='K'?m.from+3:m.from-4,rt=m.castle==='K'?m.from+1:m.from-1;b[rt]=b[rf];b[rf]=null}
 let c=st.c;const strip=(sq,ch)=>{if(m.from===sq||m.to===sq)c=c.replace(ch,'')};
 if(m.p==='K')c=c.replace(W?/[KQ]/g:/[kq]/g,'');strip(0,'Q');strip(7,'K');strip(56,'q');strip(63,'k');
 return{b,t:W?'b':'w',c,ep:m.dbl?(m.from+m.to)/2:-1}}
function inCheck(st){const W=st.t==='w',k=st.b.indexOf(W?'K':'k');return attacked(st.b,k,!W)}
function legal(st){const W=st.t==='w';return pseudo(st).filter(m=>{const n=make(st,m),k=n.b.indexOf(W?'K':'k');return!attacked(n.b,k,!W)})}
function san(st,m,ms){ms=ms||legal(st);let s;
 if(m.castle)s=m.castle==='K'?'O-O':'O-O-O';
 else if(m.p==='P')s=(m.cap?'abcdefgh'[m.from&7]+'x':'')+sqName(m.to)+(m.promo?'='+m.promo:'');
 else{const amb=ms.filter(o=>o.p===m.p&&o.to===m.to&&o.from!==m.from);let d='';
  if(amb.length){const sf=amb.some(o=>(o.from&7)===(m.from&7)),sr=amb.some(o=>(o.from>>3)===(m.from>>3));d=!sf?'abcdefgh'[m.from&7]:!sr?String((m.from>>3)+1):sqName(m.from)}
  s=m.p+d+(m.cap?'x':'')+sqName(m.to)}
 const n=make(st,m);if(inCheck(n))s+=legal(n).length?'+':'#';return s}
const clean=s=>s.replace(/[+#?!]/g,'');
function fromSan(st,s){const ms=legal(st),c=clean(s).replace('0-0-0','O-O-O').replace('0-0','O-O');for(const m of ms)if(clean(san(st,m,ms))===c)return m;return null}
function play(moves){let st=start();for(const s of moves){const m=fromSan(st,s);if(!m)return null;st=make(st,m)}return st}
function fen(st){let s='';for(let r=7;r>=0;r--){let e=0;for(let f=0;f<8;f++){const p=st.b[r*8+f];if(!p)e++;else{if(e){s+=e;e=0}s+=p}}if(e)s+=e;if(r)s+='/'}
 return s+' '+st.t+' '+(st.c||'-')+' '+(st.ep>=0?sqName(st.ep):'-')+' 0 1'}
const uci=m=>sqName(m.from)+sqName(m.to)+(m.promo?m.promo.toLowerCase():'');
function fromUci(st,u){return legal(st).find(m=>uci(m)===u&&(!m.promo||m.promo.toLowerCase()===(u[4]||'q')))||null}
return{start,legal,make,san,fromSan,play,clean,sqName,inCheck,white,fen,uci,fromUci}})();
if(typeof module!=='undefined')module.exports=Chess;
