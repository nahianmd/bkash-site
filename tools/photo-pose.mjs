// Solve the photographed phone's tilt ONCE, in the photograph's own pixels.
const W0 = 2250, H0 = 3000;
const Q = { tl:[0.3831,0.2038], tr:[0.7092,0.2022], br:[0.6597,0.7432], bl:[0.3362,0.7365] };
const target = [Q.tl,Q.tr,Q.br,Q.bl].flatMap(([fx,fy]) => [fx*W0, fy*H0]);
const aspect = 6.5266/14.085;
function project(q, W, H, cam) {
  const out=[]; const [ca,sa]=[Math.cos(q.rx),Math.sin(q.rx)], [cb,sb]=[Math.cos(q.ry),Math.sin(q.ry)], [cc,sc]=[Math.cos(q.rz),Math.sin(q.rz)];
  for (const [x,y] of [[-W/2,-H/2],[W/2,-H/2],[W/2,H/2],[-W/2,H/2]]) {
    const y1=y*ca, z1=y*sa, x2=x*cb+z1*sb, z2=-x*sb+z1*cb, x3=x2*cc-y1*sc, y3=x2*sc+y1*cc;
    const X=cam.cx+x3+q.tx, Y=cam.cy+y3+q.ty, Z=z2+q.tz, k=cam.d/(cam.d-Z);
    out.push(cam.ox+(X-cam.ox)*k, cam.oy+(Y-cam.oy)*k);
  } return out;
}
function solve6(A,b){const n=A.length;const M=A.map((r,i)=>[...r,b[i]]);for(let c=0;c<n;c++){let p=c;for(let i=c+1;i<n;i++)if(Math.abs(M[i][c])>Math.abs(M[p][c]))p=i;if(Math.abs(M[p][c])<1e-12)return null;[M[c],M[p]]=[M[p],M[c]];for(let i=c+1;i<n;i++){const f=M[i][c]/M[c][c];for(let j=c;j<=n;j++)M[i][j]-=f*M[c][j];}}const x=new Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=M[i][n];for(let j=i+1;j<n;j++)s-=M[i][j]*x[j];x[i]=s/M[i][i];}return x;}
function refine(start, keys, W, H, cam) {
  let q={...start}; const step={tx:.5,ty:.5,tz:.5,rx:1e-3,ry:1e-3,rz:1e-3};
  const resid=p=>project(p,W,H,cam).map((v,i)=>v-target[i]); const cost=r=>r.reduce((a,b)=>a+b*b,0);
  let r=resid(q), c=cost(r), lambda=1e-3;
  for (let it=0; it<200; it++) {
    const J=r.map(()=>new Array(keys.length).fill(0));
    keys.forEach((k,j)=>{const h=step[k];const rp=resid({...q,[k]:q[k]+h}),rm=resid({...q,[k]:q[k]-h});for(let i=0;i<8;i++)J[i][j]=(rp[i]-rm[i])/(2*h);});
    const n=keys.length; const A=keys.map(()=>new Array(n).fill(0)); const g=new Array(n).fill(0);
    for(let i=0;i<8;i++)for(let a=0;a<n;a++){g[a]+=J[i][a]*r[i];for(let b=0;b<n;b++)A[a][b]+=J[i][a]*J[i][b];}
    for(let a=0;a<n;a++)A[a][a]*=1+lambda;
    const d=solve6(A,g.map(v=>-v)); if(!d)break;
    const next={...q}; keys.forEach((k,j)=>next[k]=q[k]+d[j]);
    const rn=resid(next), cn=cost(rn);
    if(cn<c){q=next;r=rn;c=cn;lambda=Math.max(lambda/4,1e-9);if(c<1e-8)break;}else lambda=Math.min(lambda*8,1e6);
  }
  return {pose:q, rms:Math.sqrt(c/8)};
}
const len=(i,j)=>Math.hypot(target[2*j]-target[2*i],target[2*j+1]-target[2*i+1]);
console.log('edges px: left',len(0,3).toFixed(1),'right',len(1,2).toFixed(1),'top',len(0,1).toFixed(1),'bottom',len(3,2).toFixed(1));
for (const d of [1200, 1625, 2200, 3000]) {
  const cam={cx:W0/2,cy:H0/2,d,ox:W0/2,oy:H0/2};
  const W=733, H=W/aspect;
  const qcx=(target[0]+target[2]+target[4]+target[6])/4, qcy=(target[1]+target[3]+target[5]+target[7])/4;
  const base={tx:qcx-W0/2,ty:qcy-H0/2,tz:0,rx:0,ry:0,rz:0};
  const res=[];
  for (const sx of [-1,1]) for (const sy of [-1,1]) { const f=refine({...base,rx:.2*sx,ry:.2*sy},['tx','ty','tz','rx','ry','rz'],W,H,cam); res.push({rx:+f.pose.rx.toFixed(4),ry:+f.pose.ry.toFixed(4),rz:+f.pose.rz.toFixed(4),tz:+f.pose.tz.toFixed(0),rms:+f.rms.toFixed(2)}); }
  console.log('d='+d, JSON.stringify(res));
}

// --- vanishing points → focal length (principal point at the centre)
const line=(p,q)=>{const [x1,y1,x2,y2]=[target[2*p],target[2*p+1],target[2*q],target[2*q+1]];return [y2-y1, x1-x2, x2*y1-x1*y2];}; // ax+by+c=0
const meet=(l,m)=>{const [a,b,c]=l,[d,e,f]=m;const det=a*e-b*d;return [(b*f-c*e)/det,(c*d-a*f)/det];};
const V1=meet(line(0,1),line(3,2)), V2=meet(line(0,3),line(1,2));
const cx=W0/2, cy=H0/2; const f2=-((V1[0]-cx)*(V2[0]-cx)+(V1[1]-cy)*(V2[1]-cy));
console.log('V1',V1.map(v=>v.toFixed(0)),'V2',V2.map(v=>v.toFixed(0)),'f from VPs', f2>0?Math.sqrt(f2).toFixed(0):'inconsistent('+f2.toFixed(0)+')');

// --- free focal length: solve for the tilt with d as a parameter
function refineFree(start, cam0) {
  let best=null;
  for (const d of [2000, 2600, 3200, 4000, 5000, 7000]) {
    const cam={...cam0,d};
    const W=760, H=W/aspect;
    for (const rx0 of [-0.3,-0.1,0.1,0.3]) for (const ry0 of [-0.3,-0.1,0.1,0.3]) {
      const f=refine({...start,rx:rx0,ry:ry0},['tx','ty','tz','rx','ry','rz'],W,H,cam);
      const agrees = f.pose.rx<0 && f.pose.ry<0;
      const rec={d,rx:+f.pose.rx.toFixed(4),ry:+f.pose.ry.toFixed(4),rz:+f.pose.rz.toFixed(4),tz:+f.pose.tz.toFixed(0),rms:+f.rms.toFixed(2),agrees};
      if(!best||f.rms<best.rms) best=rec;
      if(agrees && (!refineFree.bestAgree || f.rms<refineFree.bestAgree.rms)) refineFree.bestAgree=rec;
    }
  }
  return best;
}
const qcx=(target[0]+target[2]+target[4]+target[6])/4, qcy=(target[1]+target[3]+target[5]+target[7])/4;
const best=refineFree({tx:qcx-cx,ty:qcy-cy,tz:0,rx:0,ry:0,rz:0},{cx,cy,ox:cx,oy:cy});
console.log('best overall', JSON.stringify(best));
console.log('best agreeing (rx<0, ry<0)', JSON.stringify(refineFree.bestAgree));

// --- weak perspective: the eye very far away; the mirror pair is exact and nearSide picks
{
  const d = 2e5; const cam={cx,cy,d,ox:cx,oy:cy}; const W=760, H=W/aspect;
  const seen=[];
  for (const rx0 of [-0.3,-0.1,0.1,0.3]) for (const ry0 of [-0.3,-0.1,0.1,0.3]) {
    const f=refine({tx:qcx-cx,ty:qcy-cy,tz:0,rx:rx0,ry:ry0,rz:0},['tx','ty','tz','rx','ry','rz'],W,H,cam);
    const rec={rx:+f.pose.rx.toFixed(4),ry:+f.pose.ry.toFixed(4),rz:+f.pose.rz.toFixed(4),rms:+f.rms.toFixed(2)};
    if(!seen.some(s=>Math.abs(s.rx-rec.rx)<1e-3&&Math.abs(s.ry-rec.ry)<1e-3)) seen.push(rec);
  }
  console.log('weak-perspective minima', JSON.stringify(seen));
  const pick = seen.filter(s=>s.ry<0).sort((a,b)=>a.rms-b.rms)[0];
  console.log('PICK (right side nearer):', JSON.stringify(pick), 'deg', (pick.rx*180/Math.PI).toFixed(1), (pick.ry*180/Math.PI).toFixed(1), (pick.rz*180/Math.PI).toFixed(1));
}
