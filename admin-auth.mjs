import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
export function hashPin(pin){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(pin,salt,64).toString('hex')}
export function createAdminAuth({hash=process.env.NAIL_ADMIN_PIN_HASH,secure=true,now=Date.now}={}){
 const sessions=new Map(),attempts=new Map();let global={time:0,count:0};
 const configured=typeof hash==='string'&&/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(hash);
 const cookie=value=>`nail_admin=${value}; Path=/nail/api/admin/; HttpOnly; SameSite=Strict${secure?'; Secure':''}`;
 const prune=()=>{const t=now();for(const[k,v]of sessions)if(t-v>8*3600000)sessions.delete(k);for(const[k,v]of attempts)if(t-v.time>60000)attempts.delete(k)};
 const tokenKey=token=>createHash('sha256').update(token).digest('hex');
 return{configured,login(pin,address){prune();if(!configured)return{status:503,error:'看板访问尚未配置'};
  const key=tokenKey(String(address)),t=now();if(t-global.time>=60000)global={time:t,count:0};
  const a=attempts.get(key)||{time:t,count:0};if(a.count>=6||global.count>=30||attempts.size>4096)return{status:429,error:'尝试次数过多，请稍后再试',retryAfter:Math.max(1,Math.ceil((60000-(t-a.time))/1000))};
  a.count++;global.count++;attempts.set(key,a);
  if(typeof pin!=='string'||!/^\d{6}$/.test(pin))return{status:401,error:'访问码不正确'};
  const[salt,expected]=hash.split(':');if(!timingSafeEqual(scryptSync(pin,salt,64),Buffer.from(expected,'hex')))return{status:401,error:'访问码不正确'};
  if(sessions.size>=512)return{status:429,error:'请稍后重试',retryAfter:60};
  const token=randomBytes(32).toString('hex');sessions.set(tokenKey(token),t);attempts.delete(key);return{status:200,cookie:cookie(token)};
 },authorized(header=''){prune();const token=header.match(/(?:^|;\s*)nail_admin=([a-f0-9]{64})(?:;|$)/)?.[1];return !!token&&sessions.has(tokenKey(token))},logout(header=''){const token=header.match(/(?:^|;\s*)nail_admin=([a-f0-9]{64})(?:;|$)/)?.[1];if(token)sessions.delete(tokenKey(token));return cookie('')+'; Max-Age=0'}};
}
