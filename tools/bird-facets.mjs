import sharp from 'sharp';
const SRC='/Users/nahian/Projects/bkash/src/assets/img/collage-bird.webp';
const {data,info}=await sharp(SRC).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const {width:W,height:H,channels:C}=info;
const a=(x,y)=>data[(y*W+x)*C+3];
const seen=new Uint8Array(W*H), comps=[], stack=new Int32Array(W*H);
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;
 if(seen[i]||a(x,y)<=128)continue;
 let sp=0;stack[sp++]=i;seen[i]=1;const px=[];let n=0,mnX=W,mxX=0,mnY=H,mxY=0;
 while(sp>0){const p=stack[--sp];const cx=p%W,cy=(p/W)|0;n++;px.push(p);
  if(cx<mnX)mnX=cx;if(cx>mxX)mxX=cx;if(cy<mnY)mnY=cy;if(cy>mxY)mxY=cy;
  const push=(nx,ny)=>{if(nx<0||ny<0||nx>=W||ny>=H)return;const q=ny*W+nx;
   if(seen[q]||a(nx,ny)<=128)return;seen[q]=1;stack[sp++]=q;};
  push(cx+1,cy);push(cx-1,cy);push(cx,cy+1);push(cx,cy-1);}
 comps.push({n,mnX,mnY,mxX,mxY,px});}
comps.sort((p,q)=>q.n-p.n);
const big=comps.filter(c=>c.n>400);
const tiles=[];
for(let k=0;k<big.length;k++){
 const c=big[k], w=c.mxX-c.mnX+1, h=c.mxY-c.mnY+1;
 const out=Buffer.alloc(w*h*4,0);
 for(const p of c.px){const x=p%W,y=(p/W)|0;
  const s=(y*W+x)*C, d=((y-c.mnY)*w+(x-c.mnX))*4;
  out[d]=data[s];out[d+1]=data[s+1];out[d+2]=data[s+2];out[d+3]=255;}
 const f=`/tmp/claude-501/facet-${k}.png`;
 await sharp(out,{raw:{width:w,height:h,channels:4}}).png().toFile(f);
 tiles.push(await sharp(f).resize(300,300,{fit:'contain',background:'#ffffff'}).flatten({background:'#ffffff'}).toBuffer());
 console.log(`facet ${k}: ${w}x${h}px  area ${(100*c.n/(W*H)).toFixed(2)}%  bbox ${(100*c.mnX/W).toFixed(1)},${(100*c.mnY/H).toFixed(1)}`);
}
const cols=5, rows=Math.ceil(tiles.length/cols);
await sharp({create:{width:cols*300,height:rows*300,channels:3,background:'#ffffff'}})
 .composite(tiles.map((b,i)=>({input:b,left:(i%cols)*300,top:Math.floor(i/cols)*300})))
 .png().toFile('/tmp/claude-501/facets-montage.png');
