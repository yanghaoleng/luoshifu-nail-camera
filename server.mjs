import {parseCommand} from './src/commands.js';import {interpret} from './semantic.mjs';
import http from 'node:http';import {randomUUID} from 'node:crypto';import {realpathSync} from 'node:fs';import {fileURLToPath} from 'node:url';
import {createAdminAuth} from './admin-auth.mjs';import {createAnalytics} from './analytics.mjs';
const json=(res,code,data,headers={})=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(JSON.stringify(data))};
async function body(req,limit){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>limit){const e=Error('请求过大');e.status=413;throw e}chunks.push(chunk)}return Buffer.concat(chunks)}
function payload(buffer){try{return JSON.parse(buffer.toString('utf8'))}catch{const e=Error('请求格式无效');e.status=400;throw e}}
export function createAppServer({env=process.env,analytics=createAnalytics(),auth=createAdminAuth(),fetchImpl=fetch}={}){
 const counts=new Map(),origins=new Set(['https://mikeywa.site','https://www.mikeywa.site',env.NAIL_DEV_ORIGIN].filter(Boolean));
 const limited=(key,max)=>{const now=Date.now();for(const[k,v]of counts)if(now-v.time>60000)counts.delete(k);if(counts.size>4096&&!counts.has(key))return true;const c=counts.get(key)||{time:now,n:0};counts.set(key,c);return ++c.n>max};
 const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost'),path=url.pathname,address=req.headers['x-real-ip']||req.socket.remoteAddress;
  try{
   if(path==='/nail/api/health'&&req.method==='GET')return json(res,200,{ok:true,voiceConfigured:!!env.DOUBAO_API_KEY,understandingConfigured:!!env.ARK_API_KEY,understandingModel:env.ARK_MODEL||null});
   if(path.startsWith('/nail/api/admin/')){
    if(req.method!=='GET'&&!origins.has(req.headers.origin))return json(res,403,{error:'请求来源不允许'});
    if(path==='/nail/api/admin/login'&&req.method==='POST'){const input=payload(await body(req,256)),result=auth.login(input?.pin,address);return json(res,result.status,result.error?{error:result.error,retryAfter:result.retryAfter}:{ok:true},result.cookie?{'Set-Cookie':result.cookie}:result.retryAfter?{'Retry-After':String(result.retryAfter)}:{})}
    if(!auth.authorized(req.headers.cookie))return json(res,401,{error:'请先输入访问码'});
    if(path==='/nail/api/admin/logout'&&req.method==='POST')return json(res,200,{ok:true},{'Set-Cookie':auth.logout(req.headers.cookie)});
    if(path==='/nail/api/admin/stats'&&req.method==='GET'){if(analytics.error)return json(res,503,{error:analytics.error});return json(res,200,{...analytics.report(+url.searchParams.get('days')),health:{asrConfigured:!!env.DOUBAO_API_KEY,miniConfigured:!!env.ARK_API_KEY,upSeconds:Math.floor(process.uptime()),storage:'ok'}})}
    return json(res,404,{error:'Not found'});
   }
   if(!['/nail/api/asr','/nail/api/interpret','/nail/api/events'].includes(path)||req.method!=='POST')return json(res,404,{error:'Not found'});
   if(!origins.has(req.headers.origin))return json(res,403,{error:'请求来源不允许'});
   if(path==='/nail/api/events'){if(limited('events:'+address,300))return json(res,429,{error:'采集频率过高'});if(analytics.error)return json(res,503,{error:'统计暂不可用'});return analytics.collect(payload(await body(req,2048)))?json(res,202,{ok:true}):json(res,400,{error:'无效事件'})}
   if(limited('voice:'+address,80))return json(res,429,{error:'请稍等一分钟再使用语音'});
   const audio=await body(req,path==='/nail/api/interpret'?12000:512000);
   if(path==='/nail/api/interpret'){const input=payload(audio);if(typeof input?.text!=='string'||!input.text.trim()||input.text.length>500)return json(res,400,{error:'指令无效'});const started=performance.now();try{const result=await interpret(input.text,input.context,{key:env.ARK_API_KEY,model:env.ARK_MODEL,fetchImpl});analytics.service('mini_ok',performance.now()-started);return json(res,200,result)}catch(e){if(e.status===503){analytics.service('rules');return json(res,200,{action:parseCommand(input.text),reason:'语义理解暂不可用，使用基础指令',mode:'rules'})}analytics.service('mini_error',performance.now()-started);return json(res,e.status||502,{error:e.message==='无效的选款结果'?'未能理解选款，请再说一次':e.message})}}
   if(audio.length<1000||audio.toString('ascii',0,4)!=='RIFF')return json(res,400,{error:'录音无效，请再试一次'});
   const started=performance.now();try{
    const r=await fetchImpl('https://openspeech.bytedance.com/api/v3/auc/bigmodel/recognize/flash',{method:'POST',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json','X-Api-Key':env.DOUBAO_API_KEY,'X-Api-Resource-Id':'volc.bigasr.auc_turbo','X-Api-Request-Id':randomUUID(),'X-Api-Sequence':'-1'},body:JSON.stringify({user:{uid:'nail-camera'},audio:{data:audio.toString('base64')},request:{model_name:'bigmodel'}})});
    const code=r.headers.get('x-api-status-code'),data=await r.json();if(code==='20000003'){analytics.service('asr_ok',performance.now()-started);return json(res,200,{text:''})}
    if(!r.ok||code!=='20000000'){analytics.service('asr_error',performance.now()-started);return json(res,502,{error:code==='45000010'?'豆包 API Key 无效，请配置实际密钥值':`豆包语音暂不可用（${code||r.status}），请检查语音识别服务权限`})}
    analytics.service('asr_ok',performance.now()-started);return json(res,200,{text:data.result?.text||''});
   }catch(e){analytics.service('asr_error',performance.now()-started);return json(res,502,{error:e.name==='TimeoutError'?'语音识别超时，请重试':'语音服务连接失败，请重试'})}
  }catch(e){return json(res,e.status||500,{error:e.status?e.message:'服务暂不可用'})}
 });server.on('close',()=>analytics.flush());return server;
}
if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){const server=createAppServer();server.listen(Number(process.env.PORT)||8796,'127.0.0.1');process.on('SIGTERM',()=>server.close(()=>process.exit(0)))}
