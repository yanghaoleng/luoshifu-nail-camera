// Aggregate events only. Never send camera pixels, audio, transcripts or URLs.
export function createTelemetry(){if(new URLSearchParams(location.search).has('check'))return()=>{};let session;try{session=sessionStorage.getItem('nail_analytics_session');if(!session){session=crypto.randomUUID();sessionStorage.setItem('nail_analytics_session',session)}}catch{session=crypto.randomUUID()}
 const once=new Set();return(type,props={},unique=false)=>{const key=type+':'+(props.mode||'camera');if(unique&&once.has(key))return;if(unique)once.add(key);fetch('/nail/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session,type,...props}),keepalive:true}).catch(()=>{})};
}
