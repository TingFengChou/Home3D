import assert from 'node:assert/strict';
import {initialState,applyCommand,tick,pointOnRoute,createSimulationTimer} from './simulation.ts';
const started=applyCommand(initialState,{device:'vacuum',action:'start'});
const moving=tick(started,2);assert.ok(moving.vacuum.route>0);
const paused=applyCommand(moving,{device:'vacuum',action:'pause'});assert.equal(tick(paused,2).vacuum.route,paused.vacuum.route);
let returning=applyCommand(paused,{device:'vacuum',action:'dock'});for(let i=0;i<12;i++)returning=tick(returning,2);assert.equal(returning.vacuum.mode,'docked');assert.deepEqual(pointOnRoute(returning.vacuum.route),[1.68,.75]);
let done=started;for(let i=0;i<40;i++)done=tick(done,2);assert.equal(done.vacuum.mode,'docked');assert.equal(done.vacuum.progress,100);
const offline={...started,offline:'vacuum' as const};assert.equal(tick(offline,2).vacuum.route,offline.vacuum.route);assert.throws(()=>applyCommand(offline,{device:'vacuum',action:'dock'}));
assert.throws(()=>applyCommand(initialState,{device:'hub',action:'power',value:true}));assert.throws(()=>applyCommand(initialState,{device:'purifier',action:'fan',value:NaN}));assert.throws(()=>applyCommand(initialState,{device:'purifier',action:'fan',value:101}));
const off=applyCommand(initialState,{device:'purifier',action:'power',value:false});assert.equal(off.purifier.on,false);assert.ok(tick(off,2).purifier.pm25>off.purifier.pm25);assert.ok(tick(initialState,2).purifier.pm25<initialState.purifier.pm25);
assert.equal(initialState.vacuum.mode,'docked');console.log('Simulation: lifecycle, pause, return, completion, offline, command validation and air response passed.');
// Evaluate timer updaters only after callbacks return, as React may do.
let clock=1000;const queued:Array<(s:typeof initialState)=>typeof initialState>=[];
const fire=createSimulationTimer(()=>clock,update=>queued.push(update));
clock=1300;fire();clock=1600;fire();
const advanced=queued.reduce((s,update)=>update(s),started);
assert.ok(Math.abs(advanced.vacuum.route-.6/70)<1e-9);
assert.ok(advanced.purifier.pm25<started.purifier.pm25);
assert.notDeepEqual(pointOnRoute(advanced.vacuum.route),pointOnRoute(started.vacuum.route));
console.log('Deferred timer updates advance robot coordinates and purifier readings.');
// Window covering: target is distinct from physical position; stop and offline freeze it.
let curtains=applyCommand(initialState,{device:'curtain',action:'opening',value:0});
assert.equal(curtains.curtain.opening,100);curtains=tick(curtains,1);assert.equal(curtains.curtain.opening,75);
const stopped=applyCommand(curtains,{device:'curtain',action:'stop'});assert.equal(tick(stopped,2).curtain.opening,75);
assert.equal(tick({...curtains,offline:'curtain'},2).curtain.opening,75);
curtains=tick(tick(curtains,2),2);assert.equal(curtains.curtain.opening,0);
curtains=applyCommand(curtains,{device:'curtain',action:'opening',value:50});curtains=tick(curtains,2);assert.equal(curtains.curtain.opening,50);
assert.throws(()=>applyCommand(initialState,{device:'curtain',action:'opening',value:101}));
assert.throws(()=>applyCommand({...initialState,offline:'curtain'},{device:'curtain',action:'opening',value:50}));
// Air conditioning: only cools/heats toward the configured setpoint, never overshoots.
let ac=applyCommand(initialState,{device:'ac',action:'power',value:true});ac=applyCommand(ac,{device:'ac',action:'temperature',value:24});
assert.ok(tick(ac,2).ac.roomTemperature<28);
for(let i=0;i<100;i++)ac=tick(ac,2);assert.equal(ac.ac.roomTemperature,24);
ac=applyCommand(ac,{device:'ac',action:'mode',value:'heat'});ac=applyCommand(ac,{device:'ac',action:'temperature',value:26});assert.ok(tick(ac,2).ac.roomTemperature>24);
assert.equal(tick({...ac,offline:'ac'},2).ac.roomTemperature,24);
assert.throws(()=>applyCommand(initialState,{device:'ac',action:'temperature',value:31}));assert.throws(()=>applyCommand(initialState,{device:'ac',action:'mode',value:'invalid'}));
console.log('Curtain motion, stop, limits, offline, and AC directional temperature control passed.');
