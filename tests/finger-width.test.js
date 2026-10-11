import test from'node:test';
import assert from'node:assert/strict';
import{measureFingerContour,updateFingerWidth,fitNailWidth}from'../src/finger-width.js';
function image({width=22,skin=[202,153,125],background=[60,81,103],paint=false,rows=5,offset=0,scale=0}={}){const pixels=new Uint8ClampedArray(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const inFinger=Math.abs(x-32-offset)<width/2,colour=inFinger?skin:background;const i=(y*64+x)*4;for(let c=0;c<3;c++)pixels[i+c]=colour[c]+(scale?Math.sin(x*.4+y*.3)*scale:0);pixels[i+3]=255;if(paint&&inFinger&&Math.abs(x-32)<5){pixels[i]=20;pixels[i+1]=12;pixels[i+2]=25}if(rows<5&&y>24){pixels[i]=background[0];pixels[i+1]=background[1];pixels[i+2]=background[2]}}return pixels}
test('按实际像素边缘区分粗细，五指不共用固定宽度',()=>{const thin=measureFingerContour(image({width:18}),64),wide=measureFingerContour(image({width:32}),64);assert.ok(thin&&wide);assert.ok(Math.abs(thin.width-18)<=2);assert.ok(Math.abs(wide.width-32)<=2);assert.ok(wide.width>thin.width*1.5)});
test('深浅肤色和有色背景均使用局部颜色，不硬编码肤色阈值',()=>{for(const skin of[[80,48,34],[234,203,190],[160,107,81]]){const result=measureFingerContour(image({skin,background:[110,140,177],scale:2}),64);assert.ok(result);assert.ok(Math.abs(result.width-22)<=2)}});
test('已有深色美甲不会把甲面内部颜色边界误认为手指外缘',()=>{const result=measureFingerContour(image({paint:true}),64);assert.ok(result);assert.ok(Math.abs(result.width-22)<=2)});
test('同色背景、遮挡或边缘不足时拒绝虚构测量',()=>{assert.equal(measureFingerContour(image({background:[202,153,125]}),64),null);assert.equal(measureFingerContour(image({rows:2}),64),null)});
test('平移后的粗细相同，多行测量不依赖骨骼点完全居中',()=>{const a=measureFingerContour(image(),64),b=measureFingerContour(image({offset:3}),64);assert.ok(a&&b);assert.ok(Math.abs(a.width-b.width)<=1)});
test('可靠轮廓决定甲宽，粗细按每根手指分别保留',()=>{const thin=updateFingerWidth(null,{width:22,confidence:1},40),wide=updateFingerWidth(null,{width:34,confidence:1},40);assert.equal(fitNailWidth(30,40,thin).width,22*.74);assert.equal(fitNailWidth(30,40,wide).width,34*.74);assert.ok(fitNailWidth(30,40,thin).width<fitNailWidth(30,40,wide).width)});
test('甲片校准和宽度平滑不能超过最近识别到的手指轮廓',()=>{const old=updateFingerWidth(null,{width:40,confidence:1},50),narrow=updateFingerWidth(old,{width:24,confidence:1},50),fitted=fitNailWidth(32,50,narrow,1.6,1.5);assert.ok(fitted.width<=24*.88+1e-6);assert.ok(fitted.limit<=24*.88+1e-6);assert.equal(updateFingerWidth(narrow,null,50),narrow)});
test('靠近镜头时同比例放大，转动不会除以甲面投影而撑宽',()=>{const measured=updateFingerWidth(null,{width:24,confidence:1},40);const a=fitNailWidth(25,40,measured),near=fitNailWidth(50,80,measured);assert.equal(near.width,a.width*2);assert.ok(fitNailWidth(25,40,null).width<25);assert.equal(fitNailWidth(25,40,measured).source,'contour')});

test('镜头边缘缺像素的透明区域不当作手指背景',()=>{const pixels=image();for(let y=0;y<64;y++)pixels[(y*64+2)*4+3]=0;assert.equal(measureFingerContour(pixels,64),null)});

test('局部图像边缘落在相邻手指上时，仍寻找当前手指外缘',()=>{const pixels=image();for(let y=0;y<64;y++)for(let x=0;x<13;x++){const i=(y*64+x)*4;pixels[i]=202;pixels[i+1]=153;pixels[i+2]=125}const result=measureFingerContour(pixels,64);assert.ok(result);assert.ok(Math.abs(result.width-22)<=2)});
