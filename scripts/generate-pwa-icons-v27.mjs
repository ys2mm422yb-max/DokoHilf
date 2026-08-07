import { mkdir, writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';
import { resolve } from 'node:path';

const out = resolve(process.argv[2] || '.');
await mkdir(out, { recursive: true });

const specs = [
  ['icon-touch-180-v3.png',180],
  ['icon-192-v3.png',192],
  ['icon-512-v3.png',512],
  ['icon-maskable-512-v3.png',512],
];

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16),255];
const BG0=hex('#0a2027'), BG1=hex('#031018'), BG2=hex('#020a10');
const GREEN=hex('#72f2ad'), MID=hex('#25d28a'), BLUE=hex('#55a7ff'), WHITE=hex('#f5fbf8'), PANEL=hex('#071820');

function colorMix(a,b,t){return [mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t),mix(a[3],b[3],t)];}
function accent(t){return t<.55?colorMix(GREEN,MID,t/.55):colorMix(MID,BLUE,(t-.55)/.45)}
function blend(buf,idx,c,a){const aa=clamp(a)*(c[3]/255); const ia=1-aa; buf[idx]=buf[idx]*ia+c[0]*aa; buf[idx+1]=buf[idx+1]*ia+c[1]*aa; buf[idx+2]=buf[idx+2]*ia+c[2]*aa; buf[idx+3]=255;}
function sdRoundRect(x,y,cx,cy,hw,hh,r){const qx=Math.abs(x-cx)-hw+r, qy=Math.abs(y-cy)-hh+r; return Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-r;}
function sdSegment(px,py,ax,ay,bx,by){const vx=bx-ax,vy=by-ay,wx=px-ax,wy=py-ay; const t=clamp((wx*vx+wy*vy)/(vx*vx+vy*vy||1)); return Math.hypot(px-(ax+vx*t),py-(ay+vy*t));}
function insidePoly(x,y,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [xi,yi]=p[i],[xj,yj]=p[j];if(((yi>y)!=(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;}
function polyEdgeDist(x,y,p){let d=1e9;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];d=Math.min(d,sdSegment(x,y,a[0],a[1],b[0],b[1]));}return d;}

function render(size){
  const S=2, n=size*S, buf=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++) for(let x=0;x<n;x++){
    const u=x/(n-1),v=y/(n-1), t=clamp((u*.45+v*.55)); let c=t<.52?colorMix(BG0,BG1,t/.52):colorMix(BG1,BG2,(t-.52)/.48);
    const gx=(u-.5),gy=(v-.46),glow=Math.exp(-(gx*gx+gy*gy)/.055)*.13; c=colorMix(c,MID,glow);
    const i=(y*n+x)*4;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];buf[i+3]=255;
  }
  const sc=n/512;
  const paintSdf=(sdf,color,halfW=0,opacity=1,bounds=[0,0,n,n])=>{const [x0,y0,x1,y1]=bounds.map(Math.floor);for(let y=Math.max(0,y0);y<Math.min(n,y1);y++)for(let x=Math.max(0,x0);x<Math.min(n,x1);x++){const d=sdf(x/sc,y/sc); const a=halfW?clamp((halfW+0.75-d)/1.5):clamp((0.75-d)/1.5);if(a>0)blend(buf,(y*n+x)*4,color,a*opacity);}};
  paintSdf((x,y)=>Math.abs(Math.hypot(x-256,y-256)-203),GREEN,1,.06,[45*sc,45*sc,467*sc,467*sc]);
  paintSdf((x,y)=>sdRoundRect(x,y,256,254,164,115,54),PANEL,0,.74,[86*sc,132*sc,426*sc,375*sc]);
  paintSdf((x,y)=>Math.abs(sdRoundRect(x,y,256,254,164,115,54)),GREEN,4.5,.95,[84*sc,130*sc,428*sc,377*sc]);
  for(let y=Math.floor(130*sc);y<Math.min(n,378*sc);y++)for(let x=Math.floor(250*sc);x<Math.min(n,430*sc);x++){
    const xx=x/sc,yy=y/sc,d=Math.abs(sdRoundRect(xx,yy,256,254,164,115,54)); if(d<5.2){const a=clamp((5.2-d)/1.4)*((xx-250)/180)*.9;blend(buf,(y*n+x)*4,BLUE,a);}
  }
  const tail=[[150,350],[190,350],[150,398]];
  for(let y=Math.floor(345*sc);y<Math.min(n,405*sc);y++)for(let x=Math.floor(135*sc);x<Math.min(n,200*sc);x++){const xx=x/sc,yy=y/sc;if(insidePoly(xx,yy,tail))blend(buf,(y*n+x)*4,PANEL,.95); const d=polyEdgeDist(xx,yy,tail);if(d<4.8)blend(buf,(y*n+x)*4,accent(clamp((xx-135)/65)),clamp((4.8-d)/1.3));}
  paintSdf((x,y)=>Math.abs(sdRoundRect(x,y,256,246.5,32,53.5,32)),WHITE,6,1,[215*sc,187*sc,297*sc,308*sc]);
  const line=(a,b,color,w,op=1)=>paintSdf((x,y)=>sdSegment(x,y,a[0],a[1],b[0],b[1]),color,w/2,op,[(Math.min(a[0],b[0])-w)*sc,(Math.min(a[1],b[1])-w)*sc,(Math.max(a[0],b[0])+w)*sc,(Math.max(a[1],b[1])+w)*sc]);
  line([194,265],[194,279],GREEN,13); line([194,279],[205,313],GREEN,13); line([205,313],[235,338],MID,13);
  line([318,265],[318,279],BLUE,13); line([318,279],[307,313],BLUE,13); line([307,313],[277,338],MID,13);
  line([235,338],[277,338],MID,13);
  line([256,342],[256,380],WHITE,12); line([223,380],[289,380],WHITE,12);
  line([173,242],[173,284],BLUE,8); line([151,252],[151,274],BLUE,8); line([339,242],[339,284],GREEN,8); line([361,252],[361,274],GREEN,8);
  const outb=new Uint8Array(size*size*4); for(let y=0;y<size;y++)for(let x=0;x<size;x++){const oi=(y*size+x)*4;for(let c=0;c<4;c++){let sum=0;for(let dy=0;dy<S;dy++)for(let dx=0;dx<S;dx++)sum+=buf[((y*S+dy)*n+(x*S+dx))*4+c];outb[oi+c]=Math.round(sum/(S*S));}}
  return outb;
}

function crc32(buf){let c=0xffffffff;for(const b of buf){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type);const d=Buffer.from(data);const out=Buffer.alloc(12+d.length);out.writeUInt32BE(d.length,0);t.copy(out,4);d.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([t,d])),8+d.length);return out;}
function png(size,rgba){const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;const raw=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++){raw[y*(size*4+1)]=0;Buffer.from(rgba.buffer,rgba.byteOffset+y*size*4,size*4).copy(raw,y*(size*4+1)+1);}return Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);}

for(const [name,size] of specs){await writeFile(resolve(out,name),png(size,render(size)));}
console.log('DokoHilf PWA icons generated');
