export const colors=[['裸粉','#cf9f9d',['裸粉','豆沙','裸色']],['奶白','#eee3d1',['奶白','白色','乳白']],['酒红','#861f37',['酒红','红色','红']],['黑色','#242129',['黑色','黑']],['咖啡','#785043',['咖啡','棕色','棕']],['蓝色','#416a95',['蓝色','蓝']],['绿色','#56796a',['绿色','绿']],['粉色','#e194b1',['粉色','粉']],['紫色','#9275ac',['紫色','紫']]];
export function parseCommand(text){const result={};if(/^(不要|别|不需要)(调整|改变|换|修改)/.test(text.trim()))return result;
 const presets=[['gold',/金色闪钻|金色.*(?:闪|亮|金属)|黄金|金属金|金色款|金色/],['jelly',/糖果|果冻|卡通/],['french',/法式/],['ombre',/奶白渐变|渐变/],['rose',/玫瑰|细闪/],['amber',/玳瑁|琥珀/]];for(const[id,re]of presets)if(re.test(text))result.style=id;
 if(/(?:随机|随便).*(?:款|推荐)|推荐.*款|来.*随机.*款/.test(text))result.randomStyle=true;
 if(/(?:随机|再|重新|换).*(?:配色|颜色)|(?:配色|颜色).*随机/.test(text))result.randomColors=true;
 if(/短款|短甲|短一点|短一些/.test(text))result.length='short';else if(/中款|中长|中等长度/.test(text))result.length='medium';else if(/长款|长甲|长一点|长一些/.test(text))result.length='long';
 if(/猫眼/.test(text))result.finish='cat';else if(/纯色/.test(text))result.finish='solid';
 for(const[name,,aliases]of colors)if(aliases.some(a=>text.includes(a))){result.color=name;break}
 const direction=(pattern)=>{let delta=0;for(const match of text.matchAll(pattern))delta=/高|上|宽|大|放大/.test(match[1])?1:-1;return delta};
 if(/甲床|位置/.test(text)){const d=direction(/(高|低|上移|下移|往上|往下|向上|向下|上调|下调)/g);if(d)result.offsetDelta=-d*.025}
 const width=direction(/(宽|窄)/g);if(width)result.widthDelta=width*.05;
 const size=direction(/(大一点|大一些|大点|变大|更大|放大|小一点|小一些|小点|变小|更小|缩小)/g);if(size)result.sizeDelta=size*.05;
 return result}
