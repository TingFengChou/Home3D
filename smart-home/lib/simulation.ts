export type DeviceId='purifier'|'vacuum'|'hub'|'curtain'|'ac';
export type VacuumMode='docked'|'cleaning'|'paused'|'returning';
export type SimState={purifier:{on:boolean;fan:number;pm25:number};vacuum:{mode:VacuumMode;progress:number;route:number;battery:number};hub:{volume:number};curtain:{opening:number;target:number};ac:{on:boolean;mode:'cool'|'heat'|'fan';temperature:number;roomTemperature:number;fan:number};offline:DeviceId|null};
export type Command={device:DeviceId;action:'power'|'fan'|'start'|'pause'|'dock'|'volume'|'opening'|'stop'|'temperature'|'mode';value?:number|boolean|string};
export const initialState:SimState={purifier:{on:true,fan:40,pm25:22},vacuum:{mode:'docked',progress:0,route:0,battery:87},hub:{volume:35},curtain:{opening:100,target:100},ac:{on:false,mode:'cool',temperature:24,roomTemperature:28,fan:50},offline:null};
export const routePoints=[[1.68,.75],[1.32,1.35],[1.32,5.5],[1.65,5.5],[1.65,1.35],[.98,1.35],[.98,.8],[1.68,.75]];
export function pointOnRoute(t:number){const f=Math.max(0,Math.min(1,t))*(routePoints.length-1),i=Math.min(Math.floor(f),routePoints.length-2),p=f-i;return [routePoints[i][0]*(1-p)+routePoints[i+1][0]*p,routePoints[i][1]*(1-p)+routePoints[i+1][1]*p]}
export function applyCommand(state:SimState,c:Command):SimState{
 if(state.offline===c.device)throw Error('設備離線，尚未送出指令。');
 if(c.device==='curtain'){
  if(c.action==='opening'&&typeof c.value==='number'&&Number.isFinite(c.value)&&c.value>=0&&c.value<=100)return {...state,curtain:{...state.curtain,target:c.value}};
  if(c.action==='stop')return {...state,curtain:{...state.curtain,target:state.curtain.opening}};
 }else if(c.device==='ac'){
  if(c.action==='power'&&typeof c.value==='boolean')return {...state,ac:{...state.ac,on:c.value}};
  if(c.action==='mode'&&(c.value==='cool'||c.value==='heat'||c.value==='fan'))return {...state,ac:{...state.ac,mode:c.value}};
  if(c.action==='temperature'&&typeof c.value==='number'&&Number.isFinite(c.value)&&c.value>=16&&c.value<=30)return {...state,ac:{...state.ac,temperature:c.value}};
  if(c.action==='fan'&&typeof c.value==='number'&&Number.isFinite(c.value)&&c.value>=1&&c.value<=100)return {...state,ac:{...state.ac,fan:c.value}};
 }else if(c.device==='purifier'){
  if(c.action==='power'&&typeof c.value==='boolean')return {...state,purifier:{...state.purifier,on:c.value}};
  if(c.action==='fan'&&typeof c.value==='number'&&Number.isFinite(c.value)&&c.value>=1&&c.value<=100)return {...state,purifier:{...state.purifier,on:true,fan:c.value}};
 }else if(c.device==='vacuum'){
  if(c.action==='start')return {...state,vacuum:{...state.vacuum,mode:'cleaning',...(state.vacuum.mode==='paused'?{}:{progress:0,route:0})}};
  if(c.action==='pause'&&state.vacuum.mode==='cleaning')return {...state,vacuum:{...state.vacuum,mode:'paused'}};
  if(c.action==='dock')return {...state,vacuum:{...state.vacuum,mode:state.vacuum.route>0?'returning':'docked'}};
 }else if(c.device==='hub'&&c.action==='volume'&&typeof c.value==='number'&&Number.isFinite(c.value)&&c.value>=0&&c.value<=100)return {...state,hub:{volume:c.value}};
 throw Error('這個設備不支援此操作。');
}
export function tick(s:SimState,seconds:number):SimState{
 const t=Math.max(0,Math.min(seconds,2));let v={...s.vacuum};
 if(s.offline!=='vacuum'){
 if(v.mode==='cleaning'){v.route=Math.min(1,v.route+t/70);v.progress=Math.min(100,v.route*100);v.battery=Math.max(5,v.battery-t/32);if(v.route>=1)v={...v,mode:'docked',route:0,progress:100};}
 if(v.mode==='returning'){v.route=Math.max(0,v.route-t/18);if(v.route===0)v.mode='docked';}
 }
 const pm25=s.offline==='purifier'?s.purifier.pm25:s.purifier.on?Math.max(6,s.purifier.pm25-t*s.purifier.fan/280):Math.min(35,s.purifier.pm25+t*.025);
 const difference=s.curtain.target-s.curtain.opening;
 const opening=s.offline==='curtain'?s.curtain.opening:s.curtain.opening+Math.sign(difference)*Math.min(Math.abs(difference),t*25);
 let roomTemperature=s.ac.roomTemperature;
 if(s.offline!=='ac'){
  const target=s.ac.on&&s.ac.mode==='cool'?Math.min(roomTemperature,s.ac.temperature):s.ac.on&&s.ac.mode==='heat'?Math.max(roomTemperature,s.ac.temperature):28;
  roomTemperature+=Math.sign(target-roomTemperature)*Math.min(Math.abs(target-roomTemperature),t*(s.ac.on&&s.ac.mode!=='fan'?.035*s.ac.fan/50:.006));
 }
 return {...s,vacuum:v,purifier:{...s.purifier,pm25},curtain:{...s.curtain,opening},ac:{...s.ac,roomTemperature}};
}
export const modeLabels:Record<VacuumMode,string>={docked:'充電座待命',cleaning:'清掃中',paused:'已暫停',returning:'返回充電座'};

// Capture elapsed time before enqueueing: React may defer evaluating the updater.
export function createSimulationTimer(now:()=>number,enqueue:(update:(state:SimState)=>SimState)=>void){
 let previous=now();
 return ()=>{const current=now();const elapsed=(current-previous)/1000;previous=current;enqueue(state=>tick(state,elapsed));};
}

export const acModeLabels={cool:'冷氣',heat:'暖氣',fan:'送風'};
export function curtainSpan(opening:number,windowWidth:number){return .30+(windowWidth-.30)*(1-Math.max(0,Math.min(100,opening))/100)}
