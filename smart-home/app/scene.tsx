'use client';
import {useEffect,useRef,useState} from 'react';
import type {DeviceId,SimState} from '@/lib/simulation';
import {pointOnRoute,routePoints} from '@/lib/simulation';
import {Wind,CircleDot,Monitor,RotateCcw,Plus,Minus,Layers} from 'lucide-react';
import type {SceneController} from './three-scene';
type Props={state:SimState;selected:DeviceId|null;onSelect:(id:DeviceId)=>void;air:boolean};
export default function RoomScene(props:Props){
 const mount=useRef<HTMLDivElement>(null);const labels=useRef<Record<string,HTMLButtonElement|null>>({});const controller=useRef<SceneController|null>(null);const latest=useRef(props);latest.current=props;
 const [error,setError]=useState('');const [ready,setReady]=useState(false);const [retry,setRetry]=useState(0);
 useEffect(()=>{let disposed=false;let cleanup:(()=>void)|undefined;
 import('./three-scene').then(async({createScene})=>{
  if(disposed||!mount.current)return;
  const c=await createScene(mount.current,()=>latest.current,id=>latest.current.onSelect(id),labels.current,()=>{if(!disposed)setReady(true)});
  if(disposed){c.dispose();return}controller.current=c;cleanup=()=>c.dispose();
 }).catch(()=>{if(!disposed)setError('3D 空間無法載入。你仍可從左側設備清單操作。')});
 return ()=>{disposed=true;cleanup?.();controller.current=null};
 },[retry]);
 const items=[{id:'purifier' as const,name:'空氣清淨機',icon:Wind,status:props.state.purifier.on?`${props.state.purifier.fan}% 風速`:'已關閉'},{id:'vacuum' as const,name:'掃地機器人',icon:CircleDot,status:props.state.vacuum.mode==='cleaning'?'清掃中':props.state.vacuum.mode==='paused'?'已暫停':props.state.vacuum.mode==='returning'?'回充中':'待命'},{id:'hub' as const,name:'Google Nest Hub',icon:Monitor,status:'家庭中樞'}];
 return <><div className="three-mount" ref={mount} role="img" aria-label="可旋轉的辦公室 3D 模型；設備亦可由清單或空間標籤選取"/>{!ready&&!error&&<div className="scene-loading"><span className="loading-orbit"/>正在打開你的空間…</div>}{error&&<div className="scene-error"><img src="/office-overview.png" alt="辦公室模型預覽"/><p>{error}</p><button onClick={()=>{setError('');setReady(false);setRetry(n=>n+1)}}>重新載入 3D</button></div>}
 {items.map(d=><button ref={el=>{labels.current[d.id]=el}} key={d.id} className={'spatial-label '+(props.selected===d.id?'selected':'')+(props.state.offline===d.id?' offline':'')} style={{visibility:ready?'visible':'hidden'}} onClick={()=>props.onSelect(d.id)} aria-label={`${d.name}，${d.status}，開啟控制`}><span className="pin-icon"><d.icon size={16}/></span><span><strong>{d.name}</strong><small>{props.state.offline===d.id?'離線':d.status}</small></span><span className="pin-dot"/></button>)}
 <div className="camera-tools" aria-label="視角控制"><button title="還原視角" aria-label="還原視角" onClick={()=>controller.current?.reset()}><RotateCcw size={18}/></button><button title="俯視" aria-label="切換俯視" onClick={()=>controller.current?.top()}><Layers size={18}/></button><span/><button title="放大" aria-label="放大" onClick={()=>controller.current?.zoom(.85)}><Plus size={18}/></button><button title="縮小" aria-label="縮小" onClick={()=>controller.current?.zoom(1.18)}><Minus size={18}/></button></div>
 </>;
}
