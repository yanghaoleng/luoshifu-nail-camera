import{parseCommand}from'./commands.js';import{applyPreset,presets}from'./presets.js';
const clamp=(x,min,max)=>Math.round(Math.max(min,Math.min(max,x))*1000)/1000;
export function applyVoiceCommand(text,state,calibration,random=Math.random){return applyVoiceAction(parseCommand(text),state,calibration,random)}
export function applyVoiceAction(command,state,calibration,random=Math.random){if(!Object.keys(command).length)return false;
if(command.randomStyle){const choices=presets.filter(p=>p.id!==state.style);applyPreset(state,choices[Math.floor(random()*choices.length)].id,random)}else if(command.style)applyPreset(state,command.style,random);
if(command.randomColors&&(state.style==='jelly'||!command.style))applyPreset(state,'jelly',random);
const custom=['length','color','finish'].filter(key=>command[key]);if(custom.length){if(!command.style&&!command.randomStyle&&!command.randomColors)state.style=null;for(const key of custom)state[key]=command[key]}
for(const[key,delta,min,max]of[['width',command.widthDelta,.6,1.4],['offset',command.offsetDelta,.15,.65],['size',command.sizeDelta,.6,1.5]])if(delta)calibration[key]=clamp(calibration[key]+delta,min,max);
return true}
