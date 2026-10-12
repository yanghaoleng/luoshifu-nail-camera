import {readFileSync,mkdirSync,writeFileSync,renameSync} from 'node:fs';
import {dirname} from 'node:path';import {createHmac} from 'node:crypto';
import {colors} from './src/commands.js';import {presets} from './src/presets.js';import {patterns} from './src/patterns.js';
const allowed={length:['short','medium','long'],color:colors.map(c=>c[0]),finish:['solid','cat','matte'],style:presets.map(p=>p.id),pattern:patterns.map(p=>p.id)};
const events=new Set(['page_view','camera_ready','camera_error','model_ready','model_error','tryon_started','demo_started','selection','photo_tap','photo_exported','photo_cancel','photo_error']);
export function dayKey(time){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(time))}
export function sanitizeEvent(input){if(!input||!events.has(input.type)||typeof input.session!=='string'||!/^[a-f0-9-]{36}$/.test(input.session))return null;
 const out={type:input.type,session:input.session,mode:input.mode==='demo'?'demo':'camera'};
 if(input.type==='selection'){if(!allowed[input.field]?.includes(input.value))return null;Object.assign(out,{field:input.field,value:input.value,source:input.source==='voice'?'voice':'touch'})}
 if(input.type==='model_ready')for(const k of['downloadMs','initializeMs'])if(Number.isFinite(input[k])&&input[k]>=0&&input[k]<=300000)out[k]=Math.round(input[k]);
 return out;
}
const freshDay=()=>({events:{},sessions:{},choices:{},timings:[],service:{}});
export function createAnalytics({file=process.env.NAIL_ANALYTICS_FILE||'/var/lib/nail-app/analytics.json',secret=process.env.NAIL_ANALYTICS_SECRET,now=Date.now}={}){
 let data={version:1,startedAt:new Date(now()).toISOString(),updatedAt:null,days:{}},error=null,timer=null;
 try{const value=JSON.parse(readFileSync(file,'utf8'));if(value.version!==1||!value.days||typeof value.startedAt!=='string')throw Error();data=value}catch(e){if(e.code!=='ENOENT')error='统计存储不可读，现有数据未覆盖'}
 if(!secret)error='统计采集尚未配置';
 const flush=()=>{if(timer){clearTimeout(timer);timer=null}if(error)return;try{mkdirSync(dirname(file),{recursive:true,mode:0o700});writeFileSync(file+'.tmp',JSON.stringify(data),{mode:0o600});renameSync(file+'.tmp',file)}catch{error='统计写入失败'}};
 const changed=()=>{data.updatedAt=new Date(now()).toISOString();const cutoff=dayKey(now()-89*86400000);for(const k of Object.keys(data.days))if(k<cutoff)delete data.days[k];if(!timer){timer=setTimeout(flush,500);timer.unref()}};
 flush();
 return{get error(){return error},flush,collect(input){const e=sanitizeEvent(input);if(!e||error)return false;const day=dayKey(now()),d=data.days[day]??=freshDay(),id=createHmac('sha256',secret).update(day+e.session).digest('hex');
  if(!d.sessions[id]&&Object.keys(d.sessions).length>=6000)return false;const flags=d.sessions[id]??=[];
  const flag=e.type==='page_view'||e.type.startsWith('model_')?e.type:e.type+':'+e.mode;
  d.events[flag]=(d.events[flag]||0)+1;
  if(!flags.includes(flag)){flags.push(flag);if(e.type==='model_ready'&&e.downloadMs!=null&&e.initializeMs!=null)d.timings.push(e.downloadMs+e.initializeMs)}
  if(e.type==='selection'){const bucket=e.field+':'+e.mode,key=e.value;d.choices[bucket]??={};d.choices[bucket][key]=(d.choices[bucket][key]||0)+1;const source='selection_'+e.source+':'+e.mode;d.events[source]=(d.events[source]||0)+1}
  changed();return true;
 },service(type,duration){if(error||!['asr_ok','asr_error','mini_ok','mini_error','rules'].includes(type))return;const d=data.days[dayKey(now())]??=freshDay();d.service[type]=(d.service[type]||0)+1;if(Number.isFinite(duration)){const k=type+'_ms';d.service[k]=(d.service[k]||0)+duration}changed()},report(days=7){if(error)throw Error(error);return summarize(data,days,now())}};
}
const median=a=>{if(!a.length)return null;a.sort((x,y)=>x-y);const mid=Math.floor(a.length/2);return a.length%2?a[mid]:(a[mid-1]+a[mid])/2};
export function summarize(data,period,now){const days=[1,7,30].includes(+period)?+period:7,end=dayKey(now),rows=[];let total={views:0,sessions:0,modelReady:0,modelError:0,camera:0,tryon:0,exports:0,demo:0,cameraError:0,photoError:0,cameraWithTryon:0,tryonWithExport:0},choices={},service={},times=[];
 for(let i=days-1;i>=0;i--){const date=dayKey(now-i*86400000),d=data.days[date],row={date,views:d?.events.page_view||0,sessions:0,modelReady:0,modelError:0,camera:0,tryon:0,exports:0,demo:0,cameraError:0,photoError:0,cameraWithTryon:0,tryonWithExport:0};
  for(const flags of Object.values(d?.sessions||{})){row.sessions++;for(const[k,flag]of Object.entries({modelReady:'model_ready',modelError:'model_error',camera:'camera_ready:camera',tryon:'tryon_started:camera',exports:'photo_exported:camera',demo:'demo_started:demo',cameraError:'camera_error:camera',photoError:'photo_error:camera'}))if(flags.includes(flag))row[k]++;if(flags.includes('camera_ready:camera')&&flags.includes('tryon_started:camera'))row.cameraWithTryon++;if(flags.includes('tryon_started:camera')&&flags.includes('photo_exported:camera'))row.tryonWithExport++}
  rows.push(row);for(const k of Object.keys(total))total[k]+=row[k];times.push(...(d?.timings||[]));for(const[bucket,values]of Object.entries(d?.choices||{})){choices[bucket]??={};for(const[k,n]of Object.entries(values))choices[bucket][k]=(choices[bucket][k]||0)+n}for(const[k,n]of Object.entries(d?.service||{}))service[k]=(service[k]||0)+n;
 }
 const rankings=Object.fromEntries(Object.entries(choices).map(([k,v])=>[k,Object.entries(v).sort((a,b)=>b[1]-a[1]).map(([value,count])=>({value,count}))]));
 return{period:days,timezone:'Asia/Shanghai',from:rows[0].date,to:end,startedAt:data.startedAt,updatedAt:data.updatedAt,partial:dayKey(Date.parse(data.startedAt))>rows[0].date,total,trend:rows,rankings,service,modelMedianMs:median(times),modelSamples:times.length};
}
