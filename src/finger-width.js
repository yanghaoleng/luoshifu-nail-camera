// Measure real finger boundaries in small camera patches, independent of nail colour.
const PATCH=64,COUNT=5,COVERAGE=.74,LIMIT=.88;
const median=values=>{const a=[...values].sort((x,y)=>x-y);return a[Math.floor(a.length/2)]};
const distance=(a,b)=>{const r=a[0]-b[0],g=a[1]-b[1],blue=a[2]-b[2],l=r*.2126+g*.7152+blue*.0722;return Math.sqrt(l*l*.6+(r-g)**2*.24+(blue-g)**2*.24)};
export function measureFingerContour(pixels,stride,start=0,size=PATCH){
 const rows=[];
 for(const y of[12,22,32,42,52]){
  if(pixels[(y*stride+start+2)*4+3]<250||pixels[(y*stride+start+size-3)*4+3]<250)continue;
  const rgb=(x,d=0)=>{const c=[0,0,0];for(let k=0;k<3;k++){const i=(y*stride+start+Math.round(x+k*d))*4;for(let j=0;j<3;j++)c[j]+=pixels[i+j]/3}return c};
  const farLeft=rgb(2,1),farRight=rgb(size-3,-1),center=rgb(size/2-1,1);
  // One crop edge may land on the neighbouring finger. Prefer the contrasting
  // side as shared background, rather than interpreting a finger gap as skin.
  const background=distance(farLeft,farRight)<24?farLeft.map((v,i)=>(v+farRight[i])/2):distance(farLeft,center)>distance(farRight,center)?farLeft:farRight;
  if(distance(background,center)<18)continue;
  const side=direction=>{let best=null;
   for(let radius=5;radius<size/2-5;radius++){const x=size/2+radius*direction,inside=rgb(x-direction,-direction),outside=rgb(x,direction),gradient=distance(inside,outside),a=distance(inside,background),b=distance(outside,background);
    // An internal painted-nail boundary still has skin outside it, not background.
    if(gradient<12||a-b<10||b>Math.max(24,a*.55))continue;
    const score=gradient+(a-b)*.5-b*.8;if(!best||score>best.score)best={x,score,contrast:Math.min(gradient,a-b)};
   }return best;
  };
  const left=side(-1),right=side(1);if(left&&right){const width=right.x-left.x;rows.push({width,center:(left.x+right.x)/2,contrast:Math.min(left.contrast,right.contrast)})}
 }
 if(rows.length<3)return null;
 const width=median(rows.map(r=>r.width)),center=median(rows.map(r=>r.center)),deviation=median(rows.map(r=>Math.abs(r.width-width)));
 const coherent=rows.filter(r=>Math.abs(r.width-width)<=Math.max(2,width*.12)&&Math.abs(r.center-center)<=3);
 if(coherent.length<3||deviation>width*.15||Math.abs(center-size/2)>size*.15)return null;
 const confidence=Math.min(1,(median(coherent.map(r=>r.contrast))-10)/35)*coherent.length/5;
 return confidence>=.35?{width,confidence}:null;
}
// Find the strongest group, not the mean of all five: one wide contour or
// an occluded little finger must not drag the whole hand's estimate around.
export function consensusFingerWidth(measurements){
 const valid=measurements.filter(m=>m&&Number.isFinite(m.ratio)&&m.ratio>=.25&&m.ratio<=1.6&&m.confidence>=.35);
 if(valid.length<3)return null;
 let best=null;
 for(const seed of valid){
  const group=valid.filter(m=>Math.abs(m.ratio-seed.ratio)<=seed.ratio*.14);
  const weights=group.map(m=>m.confidence*Math.exp(-.5*((m.ratio-seed.ratio)/(seed.ratio*.1))**2));
  const score=weights.reduce((a,b)=>a+b,0);
  if(group.length>=3&&(!best||score>best.score))best={group,weights,score};
 }
 if(!best)return null;
 const ratio=best.group.reduce((sum,m,i)=>sum+m.ratio*best.weights[i],0)/best.score;
 return{ratio,confidence:best.score/valid.length,support:best.group.length};
}
export function updateSharedWidth(previous,measurement){
 if(!measurement)return previous;
 if(!previous)return measurement;
 // Filter in hand-relative units. A moving hand still scales immediately with
 // its common reference; contour noise cannot resize a nail independently.
 const change=(measurement.ratio-previous.ratio)*.18;
 const bounded=Math.max(-previous.ratio*.025,Math.min(previous.ratio*.025,change));
 return{...measurement,ratio:previous.ratio+bounded};
}
export function fitSharedNailWidth(reference,estimate,fallbackRatio,widthScale=1,size=1){
 const fingerWidth=reference*(estimate?.ratio??fallbackRatio);
 const limit=fingerWidth*LIMIT;
 return{width:Math.min(fingerWidth*COVERAGE*widthScale*size,limit),limit,source:estimate?'consensus':'fallback'};
}
export function createFingerWidthTracker(){
 const canvas=document.createElement('canvas');canvas.width=PATCH*COUNT;canvas.height=PATCH;const ctx=canvas.getContext('2d',{willReadFrequently:true});let estimates=[],last=0,shared=null,reference=0,fallbackRatio=.65;
 return{reset(){estimates=[];last=0;shared=null;reference=0;fallbackRatio=.65},sample(video,poses,points,width,height,mapping,time){
  // Keep scale independent of which nail faces the camera during a roll.
  const usable=poses.filter(p=>Number.isFinite(p.h)&&p.h/.78>=8);
  if(!usable.length)return;
  const rawReference=median(usable.map(p=>p.h/.78));
  reference=reference?reference+(rawReference-reference)*.28:rawReference;
  if(!shared)fallbackRatio=median(usable.map(p=>p.w*.78/COVERAGE))/rawReference;
  if(time-last<100)return;last=time;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);const spans=[];
  poses.forEach((p,i)=>{const tip=[4,8,12,16,20][i],a=points[tip],b=points[tip-1],dx=(a.x-b.x)*width,dy=(a.y-b.y)*height,len=Math.hypot(dx,dy),bone=p.h/.78;
   if(len/mapping.scale<9||bone<8||!Number.isFinite(bone)||p.visible===false)return;
   const cx=b.x*width+dx*.7,cy=b.y*height+dy*.7,span=bone*1.7,sx=PATCH/span,sy=PATCH/(len*.22),c=Math.cos(p.angle),s=Math.sin(p.angle);
   spans[i]={span};ctx.save();ctx.beginPath();ctx.rect(i*PATCH,0,PATCH,PATCH);ctx.clip();ctx.setTransform(sx*c,-sy*s,sx*s,sy*c,i*PATCH+PATCH/2-sx*(c*cx+s*cy),PATCH/2-sy*(-s*cx+c*cy));ctx.drawImage(video,mapping.ox,mapping.oy,video.videoWidth*mapping.scale,video.videoHeight*mapping.scale);ctx.restore();
  });
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  spans.forEach(({span},i)=>{const measured=measureFingerContour(pixels,canvas.width,i*PATCH);if(measured)estimates[i]={ratio:measured.width/PATCH*span/rawReference,confidence:measured.confidence,time}});
  // Expire stale fingers; retain the previous consensus during brief occlusion.
  const fresh=estimates.filter(m=>m&&time-m.time<450).map(m=>({...m,confidence:m.confidence*Math.exp(-(time-m.time)/650)}));
  shared=updateSharedWidth(shared,consensusFingerWidth(fresh));
 },fit(pose,index,widthScale=1,size=1){return fitSharedNailWidth(reference||pose.h/.78,shared,fallbackRatio,widthScale,size)},get estimates(){return estimates},get consensus(){return shared}};
}
