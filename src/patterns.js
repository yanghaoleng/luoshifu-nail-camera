export const patterns=[['none','无图案'],['stars','星星'],['dots','圆点'],['hearts','爱心'],['flowers','小雏菊'],['checker','棋盘格'],['leopard','豹纹'],['zebra','斑马纹'],['bows','蝴蝶结'],['moon','月亮'],['snow','雪花'],['cherry','樱桃'],['waves','波浪']].map(([id,name])=>({id,name}));
export function drawPattern(ctx,w,h,state){const type=state.pattern;if(!type||type==='none')return;const dark=['#eee3d1','#fffaf4','#ead8b7','#f4b8c4','#edaa82','#c5dfa4','#f4d66c','#bcd7e7','#cebbe2','#cf9f9d','#dfb5af'].includes(state.hex);const ink=dark?'#795b65':'#fff4dc';ctx.save();ctx.fillStyle=ink;ctx.strokeStyle=ink;ctx.lineWidth=w*.035;ctx.lineCap='round';ctx.lineJoin='round';
const locations=[[-.22,-.32],[.2,-.06],[-.17,.27],[.23,.4]];
function circle(x,y,r,color=ink){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function star(x,y,r){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.43:r;ctx[i?'lineTo':'moveTo'](x+Math.cos(a)*rr,y+Math.sin(a)*rr)}ctx.closePath();ctx.fill()}
if(type==='dots'){for(let row=0;row<6;row++)for(let col=0;col<3;col++)circle((col-1)*w*.29+(row%2?w*.12:0),(row-2.5)*h*.18,w*.045)}
else if(type==='checker'){const s=w*.23;for(let row=-5;row<6;row++)for(let col=-3;col<3;col++)if((row+col)%2===0)ctx.fillRect(col*s,row*s,s,s)}
else if(type==='zebra'||type==='waves'){ctx.lineWidth=w*(type==='zebra'?.07:.035);for(let i=-4;i<=4;i++){const y=i*h*.13;ctx.beginPath();ctx.moveTo(-w*.6,y);ctx.bezierCurveTo(-w*.1,y-h*.12,w*.15,y+h*.1,w*.6,y-h*.02);ctx.stroke()}}
else for(const [px,py]of locations){const x=px*w,y=py*h,r=w*.12;
if(type==='stars')star(x,y,r);
if(type==='hearts'){ctx.fillStyle='#e76488';ctx.beginPath();ctx.moveTo(x,y+r*.8);ctx.bezierCurveTo(x-r*2,y-r*.3,x-r*.7,y-r*1.5,x,y-r*.5);ctx.bezierCurveTo(x+r*.7,y-r*1.5,x+r*2,y-r*.3,x,y+r*.8);ctx.fill()}
if(type==='flowers'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;circle(x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8,r*.55,'#fff9ef')}circle(x,y,r*.4,'#f5c547')}
if(type==='leopard'){ctx.strokeStyle='#452d2b';ctx.lineWidth=w*.04;ctx.beginPath();ctx.ellipse(x,y,r,r*.68,px*4,.2,5.5);ctx.stroke();circle(x,y,r*.55,'#bd7f4b')}
if(type==='bows'){ctx.fillStyle='#f297bb';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-r*1.2,y-r*.7);ctx.quadraticCurveTo(x-r*1.9,y,x-r*1.2,y+r*.7);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+r*1.2,y-r*.7);ctx.quadraticCurveTo(x+r*1.9,y,x+r*1.2,y+r*.7);ctx.closePath();ctx.fill();circle(x,y,r*.3,'#fff0ef')}
if(type==='moon'){ctx.fillStyle='#f5d268';ctx.beginPath();ctx.arc(x,y,r,Math.PI*.3,Math.PI*1.7);ctx.quadraticCurveTo(x-r*.4,y,x+r*Math.cos(Math.PI*.3),y+r*Math.sin(Math.PI*.3));ctx.fill()}
if(type==='snow'){for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.stroke()}}
if(type==='cherry'){ctx.strokeStyle='#61946a';ctx.beginPath();ctx.moveTo(x-r*.5,y);ctx.lineTo(x,y-r*1.4);ctx.lineTo(x+r*.55,y);ctx.stroke();circle(x-r*.5,y,r*.48,'#ce3453');circle(x+r*.55,y,r*.48,'#ce3453')}
}ctx.restore()}
