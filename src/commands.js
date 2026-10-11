import{patterns}from'./patterns.js';
export const colors=[['裸粉','#cf9f9d',['裸粉','豆沙','裸色']],['奶白','#eee3d1',['奶白','白色','乳白']],['酒红','#861f37',['酒红','红色','红']],['黑色','#242129',['黑色','黑']],['咖啡','#785043',['咖啡','棕色','棕']],['蓝色','#416a95',['蓝色','蓝']],['绿色','#56796a',['绿色','绿']],['粉色','#e194b1',['粉色','粉']],['紫色','#9275ac',['紫色','紫']],["樱花粉", "#f4b8c4", ["樱花粉"]],["蜜桃橘", "#edaa82", ["蜜桃橘", "蜜桃"]],["珊瑚红", "#e46765", ["珊瑚红", "珊瑚"]],["正红", "#c52b3c", ["正红", "大红"]],["莓果紫", "#843b69", ["莓果紫", "莓果"]],["焦糖", "#b77c48", ["焦糖"]],["摩卡", "#9b7868", ["摩卡"]],["奶茶", "#bba08b", ["奶茶"]],["米杏", "#ead8b7", ["米杏", "杏色"]],["纯白", "#fffaf4", ["纯白"]],["银灰", "#b6b8c2", ["银灰", "灰色", "银色"]],["香槟金", "#cfb477", ["香槟金", "香槟"]],["柠檬黄", "#f4d66c", ["柠檬黄", "黄色"]],["橄榄绿", "#7f8851", ["橄榄绿", "橄榄"]],["抹茶绿", "#9bac7c", ["抹茶绿", "抹茶"]],["薄荷绿", "#8dcec3", ["薄荷绿", "薄荷"]],["牛油果绿", "#c5dfa4", ["牛油果绿", "牛油果"]],["墨绿", "#214c44", ["墨绿"]],["雾霾蓝", "#91afc5", ["雾霾蓝", "雾霾"]],["冰蓝", "#bcd7e7", ["冰蓝"]],["宝石蓝", "#265ac0", ["宝石蓝", "宝蓝"]],["藏蓝", "#29354f", ["藏蓝"]],["薰衣草紫", "#cebbe2", ["薰衣草紫", "薰衣草"]],["葡萄紫", "#603a82", ["葡萄紫", "葡萄"]]];
export function parseCommand(text){const result={};if(/^(不要|别|不需要)(调整|改变|换|修改)/.test(text.trim()))return result;
 const presets=[['gold',/金色闪钻|金色.*(?:闪|亮|金属)|黄金|金属金|金色款|金色/],['jelly',/糖果|果冻|卡通/],['french',/法式/],['ombre',/奶白渐变|渐变/],['rose',/玫瑰|细闪/],['amber',/玳瑁|琥珀/],['starry',/星夜银河|银河款/],['cherry',/甜心樱桃/],['daisy',/春日雏菊/],['ribbon',/芭蕾蝴蝶结/],['dalmatian',/奶油波点/],['checkered',/黑白棋盘/],['wild',/焦糖豹纹/],['sweetheart',/告白爱心/]];for(const[id,re]of presets)if(re.test(text))result.style=id;
 if(/(?:随机|随便).*(?:款|推荐)|推荐.*款|来.*随机.*款/.test(text))result.randomStyle=true;
 if(/(?:随机|再|重新|换).*(?:配色|颜色)|(?:配色|颜色).*随机/.test(text))result.randomColors=true;
 if(/短款|短甲|短一点|短一些/.test(text))result.length='short';else if(/中款|中长|中等长度/.test(text))result.length='medium';else if(/长款|长甲|长一点|长一些/.test(text))result.length='long';
 if(/猫眼/.test(text))result.finish='cat';else if(/哑光|哑面|磨砂/.test(text))result.finish='matte';else if(/纯色|光面|亮面|亮光/.test(text))result.finish='solid';
 const matches=colors.flatMap(([name,,aliases])=>aliases.filter(a=>text.includes(a)).map(a=>({name,size:a.length}))).sort((a,b)=>b.size-a.size);if(matches.length)result.color=matches[0].name;
 for(const p of patterns)if(p.id!=='none'&&text.includes(p.name))result.pattern=p.id;if(/星星|星形/.test(text))result.pattern='stars';if(/波点|圆点/.test(text))result.pattern='dots';if(/去掉图案|不要图案|无图案/.test(text))result.pattern='none';
 const direction=(pattern)=>{let delta=0;for(const match of text.matchAll(pattern))delta=/高|上|宽|大|放大/.test(match[1])?1:-1;return delta};
 if(/甲床|位置/.test(text)){const d=direction(/(高|低|上移|下移|往上|往下|向上|向下|上调|下调)/g);if(d)result.offsetDelta=-d*.025}
 const width=direction(/(宽|窄)/g);if(width)result.widthDelta=width*.05;
 const size=direction(/(大一点|大一些|大点|变大|更大|放大|小一点|小一些|小点|变小|更小|缩小)/g);if(size)result.sizeDelta=size*.05;
 return result}
