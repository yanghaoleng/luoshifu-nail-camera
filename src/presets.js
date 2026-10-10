export const presets=[
{id:'gold',name:'金色闪钻',length:'long',color:'奶白',hex:'#c9a342',texture:'gold',finish:'solid'},
{id:'jelly',name:'彩色果冻',length:'short',color:'粉色',hex:'#e194b1',texture:'jelly',finish:'solid'},
{id:'french',name:'经典法式',length:'medium',color:'裸粉',hex:'#d5aaa5',texture:'french',finish:'solid'},
{id:'ombre',name:'奶白渐变',length:'medium',color:'奶白',hex:'#dfb5af',texture:'ombre',finish:'solid'},
{id:'rose',name:'玫瑰细闪',length:'short',color:'裸粉',hex:'#bd8794',texture:'glitter',finish:'solid'},
{id:'amber',name:'琥珀玳瑁',length:'medium',color:'咖啡',hex:'#b17430',texture:'tortoise',finish:'solid'},
{id:'starry',name:'星夜银河',length:'long',color:'藏蓝',hex:'#29354f',texture:'glitter',pattern:'stars',finish:'solid'},
{id:'cherry',name:'甜心樱桃',length:'short',color:'奶白',hex:'#eee3d1',texture:'jelly',pattern:'cherry',finish:'solid'},
{id:'daisy',name:'春日雏菊',length:'short',color:'抹茶绿',hex:'#9bac7c',texture:'jelly',pattern:'flowers',finish:'solid'},
{id:'ribbon',name:'芭蕾蝴蝶结',length:'medium',color:'樱花粉',hex:'#f4b8c4',texture:'ombre',pattern:'bows',finish:'solid'},
{id:'dalmatian',name:'奶油波点',length:'short',color:'奶白',hex:'#eee3d1',texture:'french',pattern:'dots',finish:'solid'},
{id:'checkered',name:'黑白棋盘',length:'medium',color:'黑色',hex:'#242129',texture:'jelly',pattern:'checker',finish:'solid'},
{id:'wild',name:'焦糖豹纹',length:'medium',color:'焦糖',hex:'#b77c48',texture:'tortoise',pattern:'leopard',finish:'solid'},
{id:'sweetheart',name:'告白爱心',length:'short',color:'樱花粉',hex:'#f4b8c4',texture:'jelly',pattern:'hearts',finish:'solid'}];
const jellyColors=['#f3a0b9','#e7be66','#95d3c1','#97bcec','#b8a1e0','#efa47b','#cd9dcc','#adcf8d','#ec96a0'];
export function applyPreset(state,id,random=Math.random){const preset=presets.find(p=>p.id===id);if(!preset)return;Object.assign(state,{length:preset.length,color:preset.color,finish:preset.finish,style:id,pattern:preset.pattern||'none',rendering:'gloss',seed:Math.floor(random()*1000000)});if(id==='jelly'){const previous=state.palette?.join(',');const pool=[...jellyColors];for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}state.palette=pool.slice(0,5);if(state.palette.join(',')===previous)state.palette.push(state.palette.shift())}else state.palette=null}
export function nailState(state,index){const preset=presets.find(p=>p.id===state.style);return preset?{...state,hex:state.palette?.[index]||preset.hex,texture:preset.texture,nailIndex:index,extension:preset.id==='gold'?1.25:1}:{...state,nailIndex:index}}
