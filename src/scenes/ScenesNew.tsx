import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Edges, Float, Html, OrbitControls, PerspectiveCamera, RoundedBox, useAnimations, useGLTF } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import { CatmullRomCurve3, DoubleSide, FrontSide, LoopOnce, TubeGeometry, Vector3 } from 'three';
import '../tile-model.css';
import '../metro-mobile.css';

export type ViewMode = 'Panorâmica' | 'Superior' | 'Infraestrutura' | 'Interior' | 'Plataformas' | 'Cabos' | 'Energia Tile';
const tileXs=Array.from({length:11},(_,i)=>-12+i*2.4);
const tileRows=[7.8,6.1,4.4,2.7,1,-.7,-2.4,-5.65,-7,-8.35];
const tileStations:[number,number,number][]=tileRows.flatMap(z=>tileXs.map(x=>[x,.71,z] as [number,number,number]));
const tileDescriptions:Record<string,string>={'Superfície de contato':'Tampa móvel que recebe o passo e distribui a força para os apoios internos.','Camada estrutural':'Base rígida que fixa o módulo ao piso e mantém alinhadas as partes móveis.','Mecanismo e conversor':'Placa guia que limita o curso vertical; o circuito retificador abaixo condiciona a saída elétrica.','Transdutor piezoelétrico':'Discos cerâmicos entre eletrodos: sua deformação produz uma carga elétrica variável.','Conexões elétricas':'Fios levam a saída dos discos ao circuito; a energia útil depende da retificação, armazenamento e perdas.','Sensor de pressão':'Peça opcional para detectar acionamento; o sensor não é a fonte da energia piezoelétrica.','Molas de retorno':'Quatro molas ilustrativas sustentam a tampa e ajudam a devolvê-la à posição inicial após a pisada.','Discos piezoelétricos':'Discos cerâmicos e eletrodos representados em escala visual ampliada; a geometria real depende do projeto.','Circuito retificador':'Placa conceitual com componentes para converter a saída alternada do transdutor em corrente contínua.','Cabos de ligação':'Condutores esquemáticos entre os transdutores e o circuito de condicionamento.'};
const tileCalloutPositions:Record<string,[number,number,number]>={'Superfície de contato':[1.28,.34,0],'Camada estrutural':[-1.23,-.45,0],'Mecanismo e conversor':[-1.16,-.2,.2],'Molas de retorno':[1.05,.12,.9],'Transdutor piezoelétrico':[.58,-.02,.58],'Discos piezoelétricos':[.64,-.02,.64],'Conexões elétricas':[.62,-.05,.9],'Cabos de ligação':[.64,-.02,.9],'Sensor de pressão':[1.02,.48,.95],'Circuito retificador':[.3,.02,1.18]};

function TileModel({ exploded, selected, onSelect, animate }: { exploded: boolean; selected: string; onSelect: (s: string) => void; animate:boolean }) {
  const gap = exploded ? 0.34 : 0;
  return <>
    <color attach="background" args={['#edf5ff']}/><fog attach="fog" args={['#edf5ff',8,17]}/>
    <ambientLight intensity={.55}/><hemisphereLight args={['#bbf5e0','#10202b',1.1]}/>
    <directionalLight position={[4,7,5]} intensity={2.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
    <pointLight position={[-2,1.2,1]} color="#e4ebed" intensity={.55} distance={5}/><pointLight position={[2,-.4,-1]} color="#d8b77b" intensity={.28} distance={4}/>
    <PerspectiveCamera makeDefault position={[3.8,3.6,5]} fov={38}/>
    <Float speed={animate ? .55 : 0} rotationIntensity={animate ? .025 : 0} floatIntensity={animate ? .08 : 0}>
    <group rotation={[-.16,.28,0]}>
      <mesh position={[0,-.72-gap,0]}><cylinderGeometry args={[1.2,1.32,.08,64]}/><meshStandardMaterial color="#13232d" metalness={.6} roughness={.28}/><Edges color="#20c9e8"/></mesh>
      <RoundedBox args={[2.35,.12,2.35]} radius={.045} smoothness={4} position={[0,-.03,0]} onClick={()=>onSelect('Camada estrutural')}><meshPhysicalMaterial color={selected==='Camada estrutural'?'#849196':'#18303c'} metalness={.62} roughness={.34} clearcoat={.55}/></RoundedBox>
      <RoundedBox args={[2.1,.24,2.1]} radius={.05} smoothness={4} position={[0,-.25-gap,0]} onClick={()=>onSelect('Mecanismo e conversor')}><meshPhysicalMaterial color={selected==='Mecanismo e conversor'?'#a99a7a':'#26353a'} metalness={.5} roughness={.38}/></RoundedBox>
      {[-.62,.62].map((x,i)=><mesh key={i} position={[x,-.45-gap,0]} onClick={()=>onSelect('Transdutor piezoelétrico')}><boxGeometry args={[.12,.2,1.7]}/><meshStandardMaterial color="#899296" metalness={.62} roughness={.34}/></mesh>)}
      {[-.62,.62].map((z,i)=><mesh key={i} position={[0,-.45-gap,z]} onClick={()=>onSelect('Conexões elétricas')}><boxGeometry args={[1.36,.2,.09]}/><meshStandardMaterial color="#777f82" metalness={.55} roughness={.4}/></mesh>)}
      <RoundedBox args={[2.6,.18,2.6]} radius={.075} smoothness={5} position={[0,.28+gap,0]} castShadow onClick={()=>onSelect('Superfície de contato')}><meshPhysicalMaterial color={selected==='Superfície de contato'?'#aeb6b8':'#849096'} metalness={.62} roughness={.29} clearcoat={.75} clearcoatRoughness={.18}/><Edges color="#d5dcdd"/></RoundedBox>
      <mesh position={[.89,.38+gap,.89]} onClick={()=>onSelect('Sensor de pressão')}><RoundedBox args={[.42,.025,.42]} radius={.025} smoothness={4}><meshStandardMaterial color="#777f82" metalness={.6} roughness={.36}/></RoundedBox></mesh>
    </group>
    </Float>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.79-gap,0]}><circleGeometry args={[4.5,64]}/><meshStandardMaterial color="#0b171f" metalness={.22} roughness={.5}/></mesh>
    <ContactShadows position={[0,-.77-gap,0]} opacity={.48} scale={7} blur={2.6} far={2.4} color="#02070a"/>
    <OrbitControls enablePan={false} autoRotate={animate&&!exploded} autoRotateSpeed={.28} minDistance={3.4} maxDistance={8} enableDamping dampingFactor={.08}/>
  </>;
}

function ExplodedPart({step,threshold,position,offset,onClick,children}:{step:number;threshold:number;position:[number,number,number];offset:[number,number,number];onClick:()=>void;children:any}){
  const ref=useRef<any>(null);const motion=useRef({open:false,from:position as number[],start:0});
  useFrame(({clock})=>{if(!ref.current)return;const open=step>=threshold;if(open!==motion.current.open){motion.current.open=open;motion.current.from=[ref.current.position.x,ref.current.position.y,ref.current.position.z];motion.current.start=clock.getElapsedTime();}const t=Math.min(1,(clock.getElapsedTime()-motion.current.start)/.58),ease=t*t*(3-2*t),from=motion.current.from,target=open?[position[0]+offset[0],position[1]+offset[1],position[2]+offset[2]]:position;ref.current.position.set(from[0]+(target[0]-from[0])*ease,from[1]+(target[1]-from[1])*ease,from[2]+(target[2]-from[2])*ease);});
  return <group ref={ref} position={position} onClick={(event)=>{event.stopPropagation();onClick();}} onPointerOver={()=>{document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='';}}>{children}</group>;
}

function ReturnSpring({position,step,selected,onSelect}:{position:[number,number,number];step:number;selected:boolean;onSelect:()=>void}){
  const geometry=useMemo(()=>{
    const points=Array.from({length:73},(_,i)=>{const t=i/72,angle=t*Math.PI*10;return new Vector3(Math.cos(angle)*.085,-.12+t*.24,Math.sin(angle)*.085);});
    return new TubeGeometry(new CatmullRomCurve3(points),144,.016,6,false);
  },[]);
  return <ExplodedPart step={step} threshold={1} position={position} offset={[position[0]*.5,.72,position[2]*.5]} onClick={onSelect}><mesh geometry={geometry}><meshStandardMaterial color={selected?'#d8bd86':'#aeb8bb'} metalness={.82} roughness={.3}/></mesh></ExplodedPart>;
}

function CircuitLead({position,end,color,step,onSelect}:{position:[number,number,number];end:[number,number,number];color:string;step:number;onSelect:()=>void}){
  const geometry=useMemo(()=>{
    const curve=new CatmullRomCurve3([new Vector3(0,.025,0),new Vector3(0,.11,(end[2]-position[2])*.35),new Vector3(end[0]-position[0],.08,(end[2]-position[2])*.72),new Vector3(end[0]-position[0],.025,end[2]-position[2])]);
    return new TubeGeometry(curve,32,.012,5,false);
  },[end,position]);
  return <ExplodedPart step={step} threshold={2} position={position} offset={[position[0]*1.55,-.25,position[2]*1.55]} onClick={onSelect}><mesh geometry={geometry}><meshStandardMaterial color={color} metalness={.55} roughness={.38}/></mesh></ExplodedPart>;
}

function EngineeringTile({step,selected,onSelect,showCallout,onCloseCallout}:{step:number;selected:string;onSelect:(s:string)=>void;showCallout:boolean;onCloseCallout:()=>void}){
  return <>
    <color attach="background" args={['#edf5ff']}/><fog attach="fog" args={['#edf5ff',8,18]}/><ambientLight intensity={.72}/><hemisphereLight args={['#dbe7e6','#18232a',1.1]}/><directionalLight position={[4,7,5]} intensity={2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
    <PerspectiveCamera makeDefault position={step?[4.5,4.2,6.4]:[3.8,3.6,5]} fov={38}/>
    <group rotation={[-.16,.28,0]}>
      <ExplodedPart step={step} threshold={4} position={[0,-.45,0]} offset={[0,-.82,0]} onClick={()=>onSelect('Camada estrutural')}><group>
        <RoundedBox args={[2.35,.12,2.35]} radius={.045} smoothness={4}><meshPhysicalMaterial color={selected==='Camada estrutural'?'#aeb8ba':'#536064'} metalness={.5} roughness={.44}/></RoundedBox>
        <RoundedBox args={[2.2,.035,2.2]} radius={.035} smoothness={3} position={[0,.078,0]}><meshStandardMaterial color="#697579" metalness={.62} roughness={.38}/></RoundedBox>
        {[-.91,.91].flatMap(x=>[-.91,.91].map(z=><mesh key={`foot-${x}-${z}`} position={[x,-.1,z]}><boxGeometry args={[.2,.08,.2]}/><meshStandardMaterial color="#272f33" roughness={.78}/></mesh>))}
        {[-.94,.94].flatMap(x=>[-.94,.94].map(z=><group key={`mount-${x}-${z}`} position={[x,.09,z]}><mesh><cylinderGeometry args={[.11,.12,.045,12]}/><meshStandardMaterial color="#3b474c" metalness={.64} roughness={.4}/></mesh><mesh position={[0,.028,0]}><cylinderGeometry args={[.052,.052,.025,6]}/><meshStandardMaterial color="#aeb7b7" metalness={.82} roughness={.28}/></mesh></group>))}
        {[-.86,.86].map(x=><mesh key={`rail-x-${x}`} position={[x,.118,0]}><boxGeometry args={[.045,.045,1.68]}/><meshStandardMaterial color="#839094" metalness={.72} roughness={.34}/></mesh>)}
      </group></ExplodedPart>
      <ExplodedPart step={step} threshold={3} position={[0,-.31,0]} offset={[0,-.62,0]} onClick={()=>onSelect('Mecanismo e conversor')}><group>
        <RoundedBox args={[2.1,.18,2.1]} radius={.05} smoothness={4}><meshPhysicalMaterial color={selected==='Mecanismo e conversor'?'#c3ad83':'#4d585c'} metalness={.45} roughness={.44}/></RoundedBox>
        {[-.48,.48].flatMap(x=>[-.48,.48].map(z=><mesh key={`piezo-seat-${x}-${z}`} position={[x,.13,z]}><cylinderGeometry args={[.24,.27,.18,20]}/><meshStandardMaterial color="#737f83" metalness={.72} roughness={.34}/></mesh>))}
        {[-.91,.91].map(x=><group key={`guide-${x}`} position={[x,.12,0]}><mesh><cylinderGeometry args={[.055,.065,.24,12]}/><meshStandardMaterial color="#aeb8bb" metalness={.78} roughness={.28}/></mesh><mesh position={[0,.13,0]}><torusGeometry args={[.066,.012,6,16]}/><meshStandardMaterial color="#5b696e" metalness={.72} roughness={.32}/></mesh></group>)}
        {[-.62,.62].map(z=><mesh key={`crossbrace-${z}`} position={[0,.11,z]}><boxGeometry args={[1.45,.055,.055]}/><meshStandardMaterial color="#748287" metalness={.62} roughness={.38}/></mesh>)}
      </group></ExplodedPart>
      {[-.91,.91].flatMap(x=>[-.91,.91].map(z=><ReturnSpring key={`spring-${x}-${z}`} step={step} position={[x,.04,z]} selected={selected==='Molas de retorno'} onSelect={()=>onSelect('Molas de retorno')}/>))}
      {[-.48,.48].flatMap(x=>[-.48,.48].map(z=><ExplodedPart key={`piezo-${x}-${z}`} step={step} threshold={2} position={[x,-.08,z]} offset={[x*1.55,-.25,z*1.55]} onClick={()=>onSelect('Discos piezoelétricos')}><group><mesh><cylinderGeometry args={[.205,.205,.065,32]}/><meshStandardMaterial color={selected==='Discos piezoelétricos'?'#d2bd91':'#b5a57f'} metalness={.28} roughness={.48}/></mesh><mesh position={[0,.038,0]}><cylinderGeometry args={[.178,.178,.012,32]}/><meshStandardMaterial color="#c1c8c8" metalness={.82} roughness={.28}/></mesh><mesh position={[0,-.04,0]}><cylinderGeometry args={[.185,.185,.012,32]}/><meshStandardMaterial color="#aab3b5" metalness={.78} roughness={.32}/></mesh></group></ExplodedPart>))}
      {[-.48,.48].flatMap(x=>[-.48,.48].map(z=><CircuitLead key={`lead-${x}-${z}`} position={[x,-.08,z]} end={[0,-.075,.91]} color={(x*z)>0?'#c65f4f':'#c2a369'} step={step} onSelect={()=>onSelect('Cabos de ligação')}/>))}
      <ExplodedPart step={step} threshold={3} position={[0,-.075,.91]} offset={[0,-.48,1.18]} onClick={()=>onSelect('Circuito retificador')}><group>
        <RoundedBox args={[.68,.075,.42]} radius={.025} smoothness={3}><meshStandardMaterial color={selected==='Circuito retificador'?'#526a73':'#303e44'} metalness={.28} roughness={.55}/></RoundedBox>
        <mesh position={[0,.052,0]}><boxGeometry args={[.2,.045,.18]}/><meshStandardMaterial color="#171e21" metalness={.3} roughness={.48}/></mesh>
        {[-.23,-.13,.13,.23].map((x,i)=><mesh key={x} position={[x,.047,i%2?-.1:.1]}><cylinderGeometry args={[.035,.035,.055,10]}/><meshStandardMaterial color={i%2?'#9fa8a8':'#b38b52'} metalness={.68} roughness={.32}/></mesh>)}
        {[-.23,.23].map(x=><mesh key={x} position={[x,.045,0]}><boxGeometry args={[.07,.035,.1]}/><meshStandardMaterial color="#aab1b1" metalness={.78} roughness={.3}/></mesh>)}
        {[-.16,.16].map(x=><mesh key={`capacitor-${x}`} position={[x,.105,-.13]}><cylinderGeometry args={[.037,.037,.09,12]}/><meshStandardMaterial color="#272f33" metalness={.24} roughness={.55}/></mesh>)}
        {[-.18,.18].map(x=><mesh key={`connector-${x}`} position={[x,.05,.18]}><boxGeometry args={[.1,.055,.08]}/><meshStandardMaterial color="#b28d59" metalness={.72} roughness={.3}/></mesh>)}
        {[-.25,-.17,.17,.25].map(x=><mesh key={`trace-${x}`} position={[x,.039,0]}><boxGeometry args={[.012,.006,.23]}/><meshStandardMaterial color="#b58e55" metalness={.62} roughness={.38}/></mesh>)}
      </group></ExplodedPart>
      <ExplodedPart step={step} threshold={1} position={[0,.28,0]} offset={[0,.82,0]} onClick={()=>onSelect('Superfície de contato')}><group>
        <RoundedBox args={[2.6,.18,2.6]} radius={.075} smoothness={5} castShadow><meshPhysicalMaterial color={selected==='Superfície de contato'?'#c5cdcf':'#909a9d'} metalness={.52} roughness={.34} clearcoat={.45}/><Edges color="#d5dcdd"/></RoundedBox>
        {Array.from({length:7},(_,i)=>{const p=-.9+i*.3;return <group key={`grip-${i}`}><mesh position={[p,.094,0]}><boxGeometry args={[.012,.008,2.25]}/><meshStandardMaterial color="#5f696c" metalness={.36} roughness={.54}/></mesh><mesh position={[0,.094,p]}><boxGeometry args={[2.25,.008,.012]}/><meshStandardMaterial color="#5f696c" metalness={.36} roughness={.54}/></mesh></group>;})}
      </group></ExplodedPart>
      <ExplodedPart step={step} threshold={1} position={[.89,.38,.89]} offset={[.42,1.08,.42]} onClick={()=>onSelect('Sensor de pressão')}><RoundedBox args={[.42,.025,.42]} radius={.025} smoothness={4}><meshStandardMaterial color={selected==='Sensor de pressão'?'#c7b17d':'#858e91'} metalness={.5} roughness={.4}/></RoundedBox></ExplodedPart>
      {showCallout&&<Html fullscreen zIndexRange={[30,30]} style={{pointerEvents:'none'}}>
        <div className="tile-callout-layer"><div className="tile-callout-card"><span>PEÇA SELECIONADA</span><button aria-label="Fechar descrição da peça" onClick={onCloseCallout}>×</button><strong>{selected}</strong><p>{tileDescriptions[selected]}</p></div></div>
      </Html>}
    </group>
    <ContactShadows position={[0,-1.5,0]} opacity={.4} scale={5} blur={2.8} far={2.4} color="#02070a"/>
    <OrbitControls enablePan minDistance={3.4} maxDistance={9} enableDamping dampingFactor={.08}/>
  </>;
}

const walkerLooks=[
  {skin:'#9b6548',hair:'#25212a',shirt:'#4b91a6',pants:'#263649'},
  {skin:'#e1b18a',hair:'#392b26',shirt:'#d17a55',pants:'#34463d'},
  {skin:'#744832',hair:'#171b20',shirt:'#73966d',pants:'#4a3b38'},
  {skin:'#c98e6a',hair:'#73533d',shirt:'#c5a758',pants:'#35495e'},
  {skin:'#f0c5a0',hair:'#483c35',shirt:'#8a75a8',pants:'#3d4248'},
  {skin:'#81553e',hair:'#241e1b',shirt:'#b95f64',pants:'#46534f'},
];

function Walker({offset,operating,animate,doorsOpen,conversationSide=1,direction=1,boardingX,homeX,stationaryChat=false,snackStop=false,startDistance=0,baseY=.49,z=0,walkSpan=30,resetKey,onPlatformStep,onPlatformLeave}:{offset:number;operating:boolean;animate:boolean;doorsOpen:boolean;conversationSide?:number;direction?:1|-1;boardingX?:number;homeX?:number;stationaryChat?:boolean;snackStop?:boolean;startDistance?:number;baseY?:number;z?:number;walkSpan?:number;resetKey:number;onPlatformStep:(index:number)=>void;onPlatformLeave:(index:number)=>void}) {
  const body=useRef<any>(null);
  const leftLeg=useRef<any>(null);const rightLeg=useRef<any>(null);
  const leftArm=useRef<any>(null);const rightArm=useRef<any>(null);
  const journey=useRef(startDistance);const routeZ=useRef(z);const hiddenUntil=useRef(0);const lastTile=useRef(-1);
  const routePhase=useRef<'walk'|'turn'|'approach'|'board'|'snack-turn'|'snack-approach'|'snack-wait'|'snack-return'>('walk');
  const snackDone=useRef(false);const snackWaitUntil=useRef(0);const snackX=direction>0?-10.7:-8.3;const snackStandZ=7.85;
  const pace=.78+((Math.round(offset*10)%5)*.075);
  const homeRow=tileRows.reduce((nearest,value)=>Math.abs(value-z)<Math.abs(nearest-z)?value:nearest,tileRows[0]);
  const laneOffset=z-homeRow;
  const trainEntryZ=-4.15+laneOffset;
  const look=walkerLooks[Math.round(offset/1.18)%walkerLooks.length];
  useEffect(()=>{
    journey.current=startDistance;routeZ.current=z;hiddenUntil.current=0;lastTile.current=-1;routePhase.current='walk';snackDone.current=false;snackWaitUntil.current=0;
    if(body.current){body.current.visible=true;body.current.position.set(homeX??-direction*(15-startDistance),baseY,z);body.current.rotation.set(0,direction>0?Math.PI/2:-Math.PI/2,0);}
  },[resetKey]);
  useFrame(({clock},delta)=>{
    if(!body.current)return;
    const time=clock.getElapsedTime();
    const walking=operating&&animate&&!stationaryChat;
    const conversationPhase=(time+(offset%5.3)*1.6)%17;
    const chatting=stationaryChat||(walking&&conversationPhase>8.2&&conversationPhase<9.5);
    if(walking&&hiddenUntil.current){
      if(time<hiddenUntil.current){body.current.visible=false;return;}
      hiddenUntil.current=0;journey.current=0;routeZ.current=z;lastTile.current=-1;routePhase.current='walk';
    }
    let x=-direction*(15-journey.current);
    if(walking&&routePhase.current==='walk'){
      if(!chatting)journey.current+=delta*pace;
      x=-direction*(15-journey.current);
      if(snackStop&&!snackDone.current&&direction*(x-snackX)>=0){journey.current=15+direction*snackX;x=snackX;routePhase.current='snack-turn';}
      else if(direction*(x-(boardingX??-direction*.8))>=0)routePhase.current='turn';
    }
    if(walking&&routePhase.current==='snack-turn'){
      x=snackX;
    }
    if(walking&&routePhase.current==='snack-approach'){
      x=snackX;routeZ.current+=Math.sign(snackStandZ-routeZ.current)*Math.min(Math.abs(snackStandZ-routeZ.current),delta*pace);
      if(Math.abs(snackStandZ-routeZ.current)<.05){routeZ.current=snackStandZ;snackWaitUntil.current=time+3.6;routePhase.current='snack-wait';}
    }
    if(walking&&routePhase.current==='snack-wait'&&time>=snackWaitUntil.current)routePhase.current='snack-return';
    if(walking&&routePhase.current==='snack-return'){
      x=snackX;routeZ.current+=Math.sign(z-routeZ.current)*Math.min(Math.abs(z-routeZ.current),delta*pace);
      if(Math.abs(z-routeZ.current)<.05){routeZ.current=z;snackDone.current=true;routePhase.current='walk';journey.current=15+direction*snackX;x=snackX;}
    }
    if(walking&&routePhase.current==='approach'){
      const platformEdge=(z>-4.15?-3.45:-4.85)+laneOffset;
      if(!chatting)routeZ.current+=Math.sign(platformEdge-routeZ.current)*Math.min(Math.abs(platformEdge-routeZ.current),delta*pace);
      if(Math.abs(platformEdge-routeZ.current)<.06){routeZ.current=platformEdge;if(doorsOpen)routePhase.current='board';}
    }
    if(walking&&routePhase.current==='board'){
      if(!chatting)routeZ.current+=Math.sign(trainEntryZ-routeZ.current)*Math.min(Math.abs(trainEntryZ-routeZ.current),delta*pace);
      if(Math.abs(trainEntryZ-routeZ.current)<.12){body.current.visible=false;hiddenUntil.current=time+2.8;return;}
    }
    if(walking&&journey.current>=walkSpan&&routePhase.current==='walk'){body.current.visible=false;hiddenUntil.current=time+2.3;return;}
    body.current.visible=true;
    const platformEdge=(z>-4.15?-3.45:-4.85)+laneOffset;
    const moving=walking&&!chatting&&(routePhase.current==='walk'||(routePhase.current==='approach'&&Math.abs(platformEdge-routeZ.current)>.06)||(routePhase.current==='board'&&Math.abs(trainEntryZ-routeZ.current)>.12)||(routePhase.current==='snack-approach'&&Math.abs(snackStandZ-routeZ.current)>.05)||(routePhase.current==='snack-return'&&Math.abs(z-routeZ.current)>.05));
    if(walking&&routePhase.current==='walk'){
      const row=homeRow;
      const column=tileXs.reduce((nearest,value)=>Math.abs(value-x)<Math.abs(nearest-x)?value:nearest,tileXs[0]);
      const tileIndex=tileRows.indexOf(row)*tileXs.length+tileXs.indexOf(column);
      const onTile=Math.abs(x)<12.8&&Math.abs(column-x)<1.3;
      if(onTile&&tileIndex!==lastTile.current){if(lastTile.current>=0)onPlatformLeave(lastTile.current);lastTile.current=tileIndex;onPlatformStep(tileIndex);}
      else if(!onTile&&lastTile.current>=0){onPlatformLeave(lastTile.current);lastTile.current=-1;}
    }else if(lastTile.current>=0){onPlatformLeave(lastTile.current);lastTile.current=-1;}
    const gait=moving?Math.sin(time*3.4+offset*1.7):0;
    x=walking?x:(homeX??-direction*(15-startDistance));
    body.current.position.x=x;
    body.current.position.z=walking?routeZ.current:z;
    body.current.position.y=baseY+(moving?Math.abs(Math.sin(time*6.8+offset*1.7))*.012:0);
    const horizontalYaw=direction>0?Math.PI/2:-Math.PI/2;
    const turnYaw=z>-4.15?Math.PI:0;
    const targetYaw=(routePhase.current==='snack-turn'?Math.PI/2:routePhase.current==='snack-approach'||routePhase.current==='snack-wait'?Math.PI/2:routePhase.current==='snack-return'?horizontalYaw:(routePhase.current==='turn'||routePhase.current==='approach'||routePhase.current==='board'?turnYaw:horizontalYaw))+(chatting?Math.sin(time*.8+offset)*.22*conversationSide:0);
    const angleDelta=Math.atan2(Math.sin(targetYaw-body.current.rotation.y),Math.cos(targetYaw-body.current.rotation.y));
    body.current.rotation.y+=angleDelta*Math.min(1,delta*3.5);
    const turnDelta=Math.atan2(Math.sin(turnYaw-body.current.rotation.y),Math.cos(turnYaw-body.current.rotation.y));
    if(routePhase.current==='turn'&&Math.abs(turnDelta)<.07)routePhase.current='approach';
    if(routePhase.current==='snack-turn'&&Math.abs(Math.atan2(Math.sin(Math.PI/2-body.current.rotation.y),Math.cos(Math.PI/2-body.current.rotation.y)))<.09){routePhase.current='snack-approach';}
    body.current.rotation.z=moving?Math.sin(time*1.8+offset)*.018:0;
    if(leftLeg.current)leftLeg.current.rotation.x=gait*.42;
    if(rightLeg.current)rightLeg.current.rotation.x=-gait*.42;
    if(leftArm.current)leftArm.current.rotation.x=chatting?Math.sin(time*3+offset)*.3:-gait*.24;
    if(rightArm.current)rightArm.current.rotation.x=chatting?Math.cos(time*3+offset)*.28:gait*.24;
  });
  return <group ref={body} position={[homeX??-direction*(15-startDistance),baseY,z]} rotation={[0,direction>0?Math.PI/2:-Math.PI/2,0]} scale={.82}>
    <mesh position={[0,1.08,0]}><capsuleGeometry args={[.18,.48,5,10]}/><meshStandardMaterial color={look.shirt} roughness={.82}/></mesh>
    <mesh position={[0,1.39,0]}><cylinderGeometry args={[.075,.085,.14,10]}/><meshStandardMaterial color={look.skin} roughness={.9}/></mesh>
    <mesh position={[0,1.56,0]}><sphereGeometry args={[.14,12,10]}/><meshStandardMaterial color={look.skin} roughness={.88}/></mesh>
    <mesh position={[0,1.64,-.012]}><sphereGeometry args={[.145,12,10,0,Math.PI*2,0,Math.PI*.53]}/><meshStandardMaterial color={look.hair} roughness={.95}/></mesh>
    {[-.045,.045].map((x)=><mesh key={x} position={[x,1.57,.127]}><sphereGeometry args={[.012,8,8]}/><meshBasicMaterial color="#231d1a"/></mesh>)}
    <mesh position={[0,.69,0]}><boxGeometry args={[.29,.28,.2]}/><meshStandardMaterial color={look.pants} roughness={.9}/></mesh>
    <group ref={leftLeg} position={[-.09,.58,0]}><mesh position={[0,-.24,0]}><capsuleGeometry args={[.075,.34,3,6]}/><meshStandardMaterial color={look.pants} roughness={.9}/></mesh><mesh position={[0,-.49,.055]}><boxGeometry args={[.13,.08,.23]}/><meshStandardMaterial color="#232a2c" roughness={.85}/></mesh></group>
    <group ref={rightLeg} position={[.09,.58,0]}><mesh position={[0,-.24,0]}><capsuleGeometry args={[.075,.34,3,6]}/><meshStandardMaterial color={look.pants} roughness={.9}/></mesh><mesh position={[0,-.49,.055]}><boxGeometry args={[.13,.08,.23]}/><meshStandardMaterial color="#232a2c" roughness={.85}/></mesh></group>
    <group ref={leftArm} position={[-.23,1.26,0]}><mesh position={[0,-.19,0]}><capsuleGeometry args={[.065,.28,3,6]}/><meshStandardMaterial color={look.shirt} roughness={.85}/></mesh><mesh position={[0,-.37,0]}><sphereGeometry args={[.055,8,6]}/><meshStandardMaterial color={look.skin}/></mesh></group>
    <group ref={rightArm} position={[.23,1.26,0]}><mesh position={[0,-.19,0]}><capsuleGeometry args={[.065,.28,3,6]}/><meshStandardMaterial color={look.shirt} roughness={.85}/></mesh><mesh position={[0,-.37,0]}><sphereGeometry args={[.055,8,6]}/><meshStandardMaterial color={look.skin}/></mesh></group>
  </group>;
}

function TilePad({index,pulseId,selected,active,onPress,position,size=[.84,.58]}:{index:number;pulseId:number;selected:boolean;active:boolean;onPress:(index:number)=>void;position:[number,number,number];size?:[number,number]}) {
  const tile=useRef<any>(null);const material=useRef<any>(null);const lastPulse=useRef(pulseId);const lastActive=useRef(active);const pulseStarted=useRef(-10);
  useFrame(({clock})=>{
    if(!tile.current||!material.current)return;
    const time=clock.getElapsedTime();
    if(pulseId!==lastPulse.current){lastPulse.current=pulseId;pulseStarted.current=time;}
    const activeChanged=active!==lastActive.current;lastActive.current=active;
    if(activeChanged&&active)pulseStarted.current=time;
    if(!selected&&pulseStarted.current<0&&!activeChanged)return;
    const progress=(time-pulseStarted.current)/.72;
    const pulse=(selected||active)&&progress>=0&&progress<=1?Math.sin(progress*Math.PI):0;
    tile.current.position.y=.025-pulse*.045;
    material.current.emissiveIntensity=(active ? .95 : 0)+pulse*.85;
    if(progress>1)pulseStarted.current=-10;
  });
  return <group position={position} onClick={(event)=>{event.stopPropagation();onPress(index);}} onPointerOver={()=>{document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='';}}>
    <RoundedBox args={[size[0]+.1,.05,size[1]+.1]} radius={.045} smoothness={4}><meshStandardMaterial color="#343a3d" metalness={.48} roughness={.62}/></RoundedBox>
    <RoundedBox ref={tile} args={[size[0],.05,size[1]]} radius={.035} smoothness={4} position={[0,.025,0]}><meshPhysicalMaterial ref={material} color="#7d8588" emissive="#ffc36b" emissiveIntensity={0} metalness={.57} roughness={.38} clearcoat={.35}/><Edges color="#bfc4c4"/></RoundedBox>
  </group>;
}

function FlowParticle({offset,pulseId,moduleIndex,running,active}:{offset:number;pulseId:number;moduleIndex:number;running:boolean;active:boolean}) {
  const particle=useRef<any>(null);const lastPulse=useRef(pulseId);const lastActive=useRef(false);const pulseStarted=useRef(-10);
  useFrame(({clock})=>{
    if(!particle.current)return;
    const time=clock.getElapsedTime();
    if(pulseId!==lastPulse.current){lastPulse.current=pulseId;pulseStarted.current=time;}
    if(active&&!lastActive.current)pulseStarted.current=time;
    lastActive.current=active;
    if(!running&&pulseStarted.current<0){particle.current.visible=false;return;}
    const progress=running?(time*.42+offset)%1:(time-pulseStarted.current-offset)/1.6;
    if(!running&&progress>1){pulseStarted.current=-10;particle.current.visible=false;return;}
    particle.current.visible=running||progress>=0;
    if(!particle.current.visible)return;
    const [x,,z]=tileStations[moduleIndex];
    const path=[[x,.82,z],[x,.82,7.15],[10.5,.82,7.15],[10.5,.82,9.35],[10.5,1.65,9.35],[14.2,1.65,9.35],[14.2,1.65,7.78],[14.2,2.75,7.78]];
    const scaled=progress*(path.length-1),segment=Math.min(path.length-2,Math.floor(scaled)),u=scaled-segment;
    const a=path[segment],b=path[segment+1];
    particle.current.position.set(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u);
  });
  return <mesh ref={particle} visible={false}><sphereGeometry args={[.065,12,12]}/><meshBasicMaterial color="#ffd28a"/></mesh>;
}

function SidePlatform({visible,ghost,onClick}:{visible:boolean;ghost:boolean;onClick:(index:number)=>void}){
  return <>{[-1,1].map((side)=><group key={side} visible={visible} position={[0,.64,side<0?2.775:-6.925]} onClick={(event)=>{event.stopPropagation();const point=event.point;let nearest=0,nearestDistance=Infinity;tileStations.forEach(([x,,z],index)=>{const distance=(x-point.x)*(x-point.x)+(z-point.z)*(z-point.z);if(distance<nearestDistance){nearest=index;nearestDistance=distance;}});onClick(nearest);}} onPointerOver={()=>{document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='';}}>
    <mesh receiveShadow><boxGeometry args={[30,.24,side<0?12.45:4.15]}/><meshStandardMaterial color="#626c70" roughness={.82} transparent={ghost} opacity={ghost ? .16 : 1} depthWrite={!ghost}/></mesh>
    <mesh position={[0,.132,side<0?-6.38:2.2]}><boxGeometry args={[29.8,.025,.16]}/><meshStandardMaterial color="#c1a36d" roughness={.68} transparent={ghost} opacity={ghost ? .22 : 1} depthWrite={!ghost}/></mesh>
    {Array.from({length:15},(_,i)=><mesh key={`joint-x-${i}`} position={[-14+i*2,.132,0]}><boxGeometry args={[.018,.012,side<0?12.1:3.8]}/><meshStandardMaterial color="#929a9c" roughness={.8} transparent={ghost} opacity={ghost ? .2 : 1} depthWrite={!ghost}/></mesh>)}
    {Array.from({length:side<0?7:3},(_,i)=><mesh key={`joint-z-${i}`} position={[0,.132,side<0?-5.2+i*1.7:-1.4+i*1.4]}><boxGeometry args={[29.8,.012,.018]}/><meshStandardMaterial color="#929a9c" roughness={.8} transparent={ghost} opacity={ghost ? .2 : 1} depthWrite={!ghost}/></mesh>)}
  </group>)}</>;
}

function MetroCar({doorsOpen,trainMoving,animate,interiorView}:{doorsOpen:boolean;trainMoving:boolean;animate:boolean;interiorView:boolean}){
  const root=useRef<any>(null);const firstDoorState=useRef(true);
  const {scene,animations}=useGLTF('/models/metro-driving-car.glb');
  const visualScene=useMemo(()=>{const copy=scene.clone(true);copy.traverse((node:any)=>{if(node.isMesh)node.material=Array.isArray(node.material)?node.material.map((material:any)=>material.clone()):node.material.clone();});return copy;},[scene]);
  const {actions}=useAnimations(animations,root);
  useEffect(()=>{visualScene.traverse((node:any)=>{if(!node.isMesh)return;const materials=Array.isArray(node.material)?node.material:[node.material];const shell=materials.some((material:any)=>material.name==='shell'||material.name==='dark'||material.name==='glass');node.visible=!(interiorView&&shell);for(const material of materials){material.transparent=false;material.opacity=1;material.depthWrite=true;material.side=FrontSide;}});},[interiorView,visualScene]);
  useEffect(()=>{
    if(firstDoorState.current){firstDoorState.current=false;return;}
    actions.open?.stop();actions.close?.stop();
    const action=doorsOpen?actions.open:actions.close;
    if(action){action.reset();action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();}
  },[actions,doorsOpen]);
  useEffect(()=>{
    const wheels=actions['wheel-roll'];
    if(trainMoving&&animate)wheels?.reset().play();else wheels?.stop();
    return()=>{wheels?.stop();};
  },[actions,animate,trainMoving]);
  return <group ref={root} scale={.5} rotation={[0,Math.PI/2,0]}><primitive object={visualScene}/></group>;
}

useGLTF.preload('/models/metro-driving-car.glb');

function PowerPole({id,active,position,onToggle}:{id:number;active:boolean;position:[number,number,number];onToggle:(id:number)=>void}){
  return <group position={position} onClick={(event)=>{event.stopPropagation();onToggle(id);}} onPointerOver={()=>{document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='';}}>
    <mesh position={[0,.1,0]}><cylinderGeometry args={[.28,.36,.2,12]}/><meshStandardMaterial color="#414b50" metalness={.62} roughness={.42}/></mesh>
    <mesh position={[0,1.65,0]}><cylinderGeometry args={[.075,.12,3,10]}/><meshStandardMaterial color="#788388" metalness={.76} roughness={.3}/></mesh>
    <mesh position={[0,3.12,0]}><boxGeometry args={[.78,.11,.2]}/><meshStandardMaterial color="#667176" metalness={.72} roughness={.32}/></mesh>
    <mesh position={[0,3.02,0]}><cylinderGeometry args={[.22,.16,.16,12]}/><meshStandardMaterial color={active?'#f4ead1':'#525c60'} emissive={active?'#f3d28d':'#000000'} emissiveIntensity={active ? .75 : 0} roughness={.32}/></mesh>
    {active&&<pointLight position={[0,3.15,0]} color="#f3dba8" intensity={.85} distance={5} decay={2}/>}
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,.012,0]}><ringGeometry args={[.34,.39,24]}/><meshStandardMaterial color={active?'#d2b77f':'#596469'} metalness={.45} roughness={.5}/></mesh>
  </group>;
}

function StationFurnishings({metroPowered}:{metroPowered:boolean}){
  return <>
    {[-12,12].map(x=><group key={`planter-${x}`} position={[x,.76,7.7]}>
      <mesh position={[0,.22,0]}><boxGeometry args={[1.9,.44,1.1]}/><meshStandardMaterial color="#465257" roughness={.72}/></mesh>
      <mesh position={[0,.48,0]}><boxGeometry args={[1.7,.06,.84]}/><meshStandardMaterial color="#343d3b" roughness={.9}/></mesh>
      {[-.6,0,.6].map((z,i)=><group key={z} position={[z,.5,0]}><mesh position={[0,.46,0]}><cylinderGeometry args={[.035,.07,.92,8]}/><meshStandardMaterial color="#73634e" roughness={.85}/></mesh><mesh position={[0,1.02,0]}><sphereGeometry args={[.42+i*.025,10,8]}/><meshStandardMaterial color={i%2?'#59695e':'#687568'} roughness={.9}/></mesh></group>)}
    </group>)}
    {[-9,9].map(x=><group key={`bin-${x}`} position={[x,.76,5.3]}><mesh position={[0,.4,0]}><cylinderGeometry args={[.24,.28,.8,12]}/><meshStandardMaterial color="#687277" metalness={.58} roughness={.46}/></mesh><mesh position={[0,.82,0]}><cylinderGeometry args={[.27,.24,.08,12]}/><meshStandardMaterial color="#333c40" metalness={.48} roughness={.44}/></mesh></group>)}
    {[-8,0,8].map(x=><group key={`sign-${x}`} position={[x,2.65,2.35]}><mesh><boxGeometry args={[2.7,.72,.12]}/><meshStandardMaterial color="#1d2b31" metalness={.38} roughness={.46}/></mesh><mesh position={[0,.02,.071]}><boxGeometry args={[2.28,.42,.018]}/><meshStandardMaterial color="#24383e" emissive="#91bfd0" emissiveIntensity={metroPowered ? .5 : 0} roughness={.35}/></mesh><mesh position={[-.78,.02,.09]}><circleGeometry args={[.08,12]}/><meshBasicMaterial color={metroPowered?'#a8e2c0':'#667378'}/></mesh>{[-.3,.05,.38].map((y,i)=><mesh key={y} position={[.35,y,.09]}><boxGeometry args={[.78-i*.12,.025,.012]}/><meshStandardMaterial color="#9eafb3" emissive="#9eafb3" emissiveIntensity={metroPowered ? .3 : 0}/></mesh>)}</group>)}
    <group position={[0,3.25,2.1]}><mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.38,.38,.12,24]}/><meshStandardMaterial color="#29363b" metalness={.5} roughness={.42}/></mesh><mesh position={[0,0,.08]}><circleGeometry args={[.3,24]}/><meshStandardMaterial color="#d4dbd8" emissive="#d4dbd8" emissiveIntensity={metroPowered ? .2 : 0}/></mesh><mesh position={[0,.16,.1]}><boxGeometry args={[.025,.22,.02]}/><meshStandardMaterial color="#46545a"/></mesh><mesh position={[.08,-.025,.1]}><boxGeometry args={[.15,.025,.02]}/><meshStandardMaterial color="#46545a"/></mesh></group>
  </>;
}

function DistributionWall({powered}:{powered:boolean}){
  const lever=useRef<any>(null);
  useFrame((_,delta)=>{if(lever.current){const target=powered?-.52:.48;lever.current.rotation.z+=(target-lever.current.rotation.z)*Math.min(1,delta*5);}});
  return <group position={[14.2,.76,7.65]}>
    <mesh position={[0,1.78,0]}><boxGeometry args={[1.8,3.56,.22]}/><meshStandardMaterial color="#465156" roughness={.82}/></mesh>
    <mesh position={[0,1.72,.14]}><boxGeometry args={[1.65,2.35,.18]}/><meshStandardMaterial color="#202b30" metalness={.42} roughness={.48}/></mesh>
    <mesh position={[0,2.1,.245]}><boxGeometry args={[1.28,1.18,.035]}/><meshStandardMaterial color="#344248" metalness={.28} roughness={.42}/></mesh>
    {[1.5,1.2,.9,.6].map((y,i)=><mesh key={y} position={[0,y,.27]}><boxGeometry args={[.88-i*.08,.025,.02]}/><meshStandardMaterial color="#aab7b9" emissive="#9aaeb2" emissiveIntensity={powered ? .35 : 0}/></mesh>)}
    <group ref={lever} position={[.37,2.08,.31]}><mesh><boxGeometry args={[.12,.48,.08]}/><meshStandardMaterial color="#d1d5cf" metalness={.62} roughness={.3}/></mesh><mesh position={[0,.22,0]}><sphereGeometry args={[.11,12,10]}/><meshStandardMaterial color={powered?'#c4a66f':'#859095'} metalness={.35} roughness={.4}/></mesh></group>
    <mesh position={[-.53,.68,.27]}><circleGeometry args={[.075,12]}/><meshStandardMaterial color={powered?'#d8be82':'#535d61'} emissive={powered?'#d8be82':'#000000'} emissiveIntensity={powered ? .75 : 0}/></mesh>
    {powered&&<pointLight position={[-.53,.68,.45]} color="#d6ba80" intensity={.7} distance={3}/>}
    <mesh position={[0,.2,.02]}><boxGeometry args={[.08,.85,.09]}/><meshStandardMaterial color="#596469" metalness={.55} roughness={.48}/></mesh>
  </group>;
}

function EnergyCabinet({powered}:{powered:boolean}){
  return <group position={[10.5,.76,9.35]}>
    <mesh position={[0,.08,0]}><boxGeometry args={[1.65,.16,.92]}/><meshStandardMaterial color="#252f34" metalness={.55} roughness={.5}/></mesh>
    <mesh position={[0,1.04,0]}><boxGeometry args={[1.42,1.9,.78]}/><meshStandardMaterial color="#465258" metalness={.42} roughness={.52}/><Edges color="#849095"/></mesh>
    {[-.39,.39].map((x,i)=><group key={x} position={[x,1.05,.405]}>
      <mesh><boxGeometry args={[.68,1.7,.035]}/><meshStandardMaterial color="#273238" metalness={.45} roughness={.5}/></mesh>
      {Array.from({length:5},(_,row)=><mesh key={row} position={[0,.52-row*.23,.024]}><boxGeometry args={[.5,.035,.015]}/><meshStandardMaterial color="#67747a" metalness={.38} roughness={.5}/></mesh>)}
      <mesh position={[.24,.72,.04]}><circleGeometry args={[.045,10]}/><meshStandardMaterial color={powered?'#9bd7a9':'#657176'} emissive={powered?'#64ba82':'#000000'} emissiveIntensity={powered ? .65 : 0}/></mesh>
    </group>)}
    <mesh position={[0,2.04,.41]}><boxGeometry args={[.38,.08,.03]}/><meshStandardMaterial color="#d2b77f" emissive={powered?'#d2b77f':'#000000'} emissiveIntensity={powered ? .45 : 0}/></mesh>
  </group>;
}

function SnackKiosk({powered}:{powered:boolean}){
  const {scene}=useGLTF('/models/food-truck-3c4e0e.glb');
  return <>
    <group position={[-9.5,.64,9.45]}>
      <mesh receiveShadow><boxGeometry args={[8,.24,1.7]}/><meshStandardMaterial color="#40494d" roughness={.76}/></mesh>
      <mesh position={[0,.126,-.8]}><boxGeometry args={[7.8,.025,.06]}/><meshStandardMaterial color="#c1a36d" metalness={.35} roughness={.48}/></mesh>
      <mesh position={[0,.126,.8]}><boxGeometry args={[7.8,.025,.06]}/><meshStandardMaterial color="#c1a36d" metalness={.35} roughness={.48}/></mesh>
    </group>
    <group position={[-9.5,.76,9.45]} scale={.48}><primitive object={scene}/></group>
    <group position={[-7.25,.76,9.05]}>
      <mesh position={[0,1.02,0]}><cylinderGeometry args={[.045,.06,1.95,8]}/><meshStandardMaterial color="#536066" metalness={.55} roughness={.4}/></mesh>
      <mesh position={[0,2.02,0]}><boxGeometry args={[1.25,1.12,.1]}/><meshStandardMaterial color="#202a2e" metalness={.28} roughness={.5}/></mesh>
      <mesh position={[0,2.02,.058]}><boxGeometry args={[1.04,.84,.018]}/><meshStandardMaterial color="#38464b" emissive="#dfb875" emissiveIntensity={powered ? .38 : 0} roughness={.4}/></mesh>
      {[-.24,-.06,.12,.3].map((y,i)=><mesh key={y} position={[.03,y+2.02,.072]}><boxGeometry args={[.68-i*.09,.025,.012]}/><meshStandardMaterial color="#e0c28d" emissive="#e0c28d" emissiveIntensity={powered ? .3 : 0}/></mesh>)}
      {powered&&<pointLight position={[0,2.05,.34]} color="#efc77f" intensity={.45} distance={2.5}/>}
    </group>
    {[-12.4,-6.6].map((x,i)=><group key={`snack-table-${i}`} position={[x,.76,9.45]}>
      <mesh position={[0,.52,0]}><cylinderGeometry args={[.055,.075,.98,8]}/><meshStandardMaterial color="#566166" metalness={.48} roughness={.48}/></mesh>
      <mesh position={[0,1.04,0]}><cylinderGeometry args={[.48,.48,.1,16]}/><meshStandardMaterial color="#777d7d" metalness={.22} roughness={.56}/></mesh>
      <mesh position={[.62,.42,.12]}><cylinderGeometry args={[.23,.25,.08,12]}/><meshStandardMaterial color="#8b7760" roughness={.76}/></mesh>
      <mesh position={[.62,.22,.12]}><cylinderGeometry args={[.035,.045,.38,8]}/><meshStandardMaterial color="#4d585b" metalness={.42} roughness={.48}/></mesh>
    </group>)}
  </>;
}

function ReadyMadeStationAssets(){
  const vending=useGLTF('/models/subway-vending-machines.glb');
  const signs=useGLTF('/models/subway-signs.glb');
  const ticketMachines=useGLTF('/models/subway-ticket-machines.glb');
  const turnstiles=useGLTF('/models/subway-turnstiles.glb');
  const benches=useGLTF('/models/subway-benches.glb');
  const benchClones=useMemo(()=>[-3.7,0,3.7].map(()=>benches.scene.clone(true)),[benches.scene]);
  const gateClones=useMemo(()=>[-1,1].map(()=>turnstiles.scene.clone(true)),[turnstiles.scene]);
  return <>
    <group position={[-14.35,.76,9.1]} scale={.72}><primitive object={vending.scene}/></group>
    <group position={[7.8,2.55,2.05]} scale={.72}><primitive object={signs.scene}/></group>
    <group position={[11.8,.76,6.6]} scale={.8}><primitive object={ticketMachines.scene}/></group>
    {benchClones.map((object,index)=><group key={`bench-${index}`} position={[-3.7+index*3.7,.775,-2.05]} scale={.82}><primitive object={object}/></group>)}
    {gateClones.map((object,index)=><group key={`turnstiles-${index}`} position={[index===0?-13.6:13.6,.76,0]} rotation={[0,Math.PI/2,0]} scale={.75}><primitive object={object}/></group>)}
  </>;
}
useGLTF.preload('/models/subway-vending-machines.glb');
useGLTF.preload('/models/subway-signs.glb');
useGLTF.preload('/models/subway-ticket-machines.glb');
useGLTF.preload('/models/subway-turnstiles.glb');
useGLTF.preload('/models/subway-benches.glb');

function Metro({mode,animate,operating,metroPowered,trainMotion,resetKey,energyEnabled,flowVisible,platformsVisible,stepStates,peopleOnPlatforms,polesActive,onPoleClick,onPlatformClick,selectedModule,pulseId,onPressTile,onPassengerStep,onPassengerLeave,doorsOpen,interiorView,trainArrived,onTrainArrived,onDoorsChange}:{mode:ViewMode;animate:boolean;operating:boolean;metroPowered:boolean;trainMotion:boolean;resetKey:number;energyEnabled:boolean;flowVisible:boolean;platformsVisible:boolean;stepStates:boolean[];peopleOnPlatforms:boolean[];polesActive:boolean[];onPoleClick:(id:number)=>void;onPlatformClick:(index:number)=>void;selectedModule:number|null;pulseId:number;onPressTile:(index:number)=>void;onPassengerStep:(index:number)=>void;onPassengerLeave:(index:number)=>void;doorsOpen:boolean;interiorView:boolean;trainArrived:boolean;onTrainArrived:()=>void;onDoorsChange:(open:boolean)=>void}){
  const {size}=useThree();const compact=size.width<=720;
  const train=useRef<any>(null);const cameraRef=useRef<any>(null);const controlsRef=useRef<any>(null);const doorState=useRef(doorsOpen);
  const travelTime=useRef(0);const arrivalNotified=useRef(trainArrived);const movingRef=useRef(false);const lastTrainX=useRef(0);const wasInside=useRef(false);
  const [trainMoving,setTrainMoving]=useState(false);
  const arrivalDuration=7;const dwellDuration=4;const departureDuration=7;const offscreenDuration=2.5;const cycleDuration=arrivalDuration+dwellDuration+departureDuration+offscreenDuration;
  useEffect(()=>{doorState.current=doorsOpen;},[doorsOpen]);
  useEffect(()=>{travelTime.current=0;arrivalNotified.current=false;movingRef.current=false;if(train.current)train.current.position.x=0;setTrainMoving(false);},[resetKey]);
  useFrame((_,delta)=>{
    if(!train.current)return;
    if(trainMotion&&animate)travelTime.current=(travelTime.current+delta)%cycleDuration;
    const t=travelTime.current;
    let x=0;let moving=false;
    if(t<departureDuration){const p=t/departureDuration;x=17*(1-Math.pow(1-p,3));moving=true;}
    else if(t<departureDuration+offscreenDuration){x=17;}
    else if(t<departureDuration+offscreenDuration+arrivalDuration){const p=(t-departureDuration-offscreenDuration)/arrivalDuration;x=-17+17*(1-Math.pow(1-p,3));moving=true;}
    train.current.position.x=x;
    moving=moving&&trainMotion&&animate;
    if(moving!==movingRef.current){movingRef.current=moving;setTrainMoving(moving);}
    const atStation=t>=departureDuration+offscreenDuration+arrivalDuration;
    if(trainMotion&&atStation!==doorState.current){doorState.current=atStation;onDoorsChange(atStation);}
    if(trainMotion&&atStation&&!arrivalNotified.current){arrivalNotified.current=true;onTrainArrived();}
    if(mode==='Interior'&&cameraRef.current&&controlsRef.current){
      const currentX=train.current.position.x;
      const shift=wasInside.current?currentX-lastTrainX.current:currentX;
      cameraRef.current.position.x+=shift;controlsRef.current.target.x+=shift;controlsRef.current.update();wasInside.current=true;
    }else wasInside.current=false;
    lastTrainX.current=train.current.position.x;
  });
  const camera:[number,number,number]=mode==='Superior'?(compact?[0,62,0]:[0,29,0]):mode==='Infraestrutura'?(compact?[0,24,60]:[0,16,30]):mode==='Plataformas'?(compact?[0,24,60]:[0,8,16]):mode==='Cabos'?(compact?[0,15,25]:[0,9,11]):mode==='Energia Tile'?(compact?[0,7,11]:[0,5,8]):mode==='Interior'?[0,1.28,-4.15]:compact?[0,24,60]:[0,13,31];
  const selectedIndex=selectedModule??0;
  return <>
    <color attach="background" args={['#edf5ff']}/><fog attach="fog" args={['#edf5ff',11,30]}/>
    <ambientLight intensity={metroPowered ? .34 : .08}/><hemisphereLight args={['#aebfc2','#070b0f',metroPowered ? .82 : .24]}/><directionalLight position={[5,9,5]} intensity={metroPowered ? 1.45 : .2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
    {metroPowered&&<><pointLight position={[-3,2.1,0]} color="#d6e2e4" intensity={1.1} distance={8}/><pointLight position={[3,2.1,0]} color="#e5dcc9" intensity={.95} distance={8}/><pointLight position={[0,1.4,-3.6]} color="#b8c9d0" intensity={.65} distance={6}/></>}
    <PerspectiveCamera ref={cameraRef} makeDefault position={camera} fov={mode==='Interior'?48:compact?44:38}/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.055,0]}><planeGeometry args={[32,22]}/><meshStandardMaterial color="#101820" roughness={.92} transparent={mode==='Cabos'} opacity={mode==='Cabos' ? .08 : 1} depthWrite={mode!=='Cabos'}/></mesh>
    <mesh position={[0,2.35,-2.2]}><boxGeometry args={[10,.18,6.6]}/><meshStandardMaterial color="#293942" metalness={.35} roughness={.42} transparent={mode==='Infraestrutura'} opacity={mode==='Infraestrutura' ? .14 : 1}/></mesh>
    {/* Open station sides keep the full platform visible from the orbit camera. */}
    {[-5.5,5.5].map(x=><group key={x} position={[x,.76,.2]}><mesh position={[0,.98,0]}><boxGeometry args={[.18,1.96,.18]}/><meshStandardMaterial color="#45545b" metalness={.58} roughness={.3}/><Edges color="#829096"/></mesh><mesh position={[0,2.08,0]}><boxGeometry args={[.42,.06,.4]}/><meshStandardMaterial color="#d4dde0" emissive="#cbd9df" emissiveIntensity={metroPowered ? .22 : 0}/></mesh></group>)}
    <SidePlatform visible={platformsVisible} ghost={mode==='Cabos'} onClick={onPlatformClick}/>
    {platformsVisible&&mode!=='Cabos'&&tileStations.map((position,i)=><TilePad key={`station-tile-${i}`} index={i} pulseId={pulseId} selected={selectedModule===i} active={energyEnabled&&(stepStates[i]||peopleOnPlatforms[i])} position={position} size={[2.5,position[2]<-4.8?1.3:1.45]} onPress={onPressTile}/>)}
    <group position={[0,.78,7.15]}><mesh><boxGeometry args={[26,.09,.16]}/><meshStandardMaterial color="#505c60" metalness={.62} roughness={.4}/><Edges color="#889397"/></mesh></group>
    {tileXs.map((x,i)=><mesh key={`cable-branch-${i}`} visible={mode==='Cabos'} position={[x,.43,(7.15-8.85)/2]}><boxGeometry args={[.045,.045,16.4]}/><meshStandardMaterial color="#8b9699" metalness={.62} roughness={.38}/></mesh>)}
    <mesh position={[10.5,.78,8.25]}><boxGeometry args={[.14,.12,2.2]}/><meshStandardMaterial color="#536064" metalness={.62} roughness={.4}/></mesh>
    <mesh position={[10.5,1.2,9.35]}><boxGeometry args={[.14,.9,.14]}/><meshStandardMaterial color="#536064" metalness={.62} roughness={.4}/></mesh>
    <mesh position={[12.35,1.65,9.35]}><boxGeometry args={[3.7,.14,.14]}/><meshStandardMaterial color="#536064" metalness={.62} roughness={.4}/></mesh>
    <mesh position={[14.2,1.65,8.56]}><boxGeometry args={[.14,.14,1.58]}/><meshStandardMaterial color="#536064" metalness={.62} roughness={.4}/></mesh>
    <mesh position={[14.2,2.2,7.78]}><boxGeometry args={[.14,1.1,.14]}/><meshStandardMaterial color="#536064" metalness={.62} roughness={.4}/></mesh>
    <group position={[0,0,-4.15]}>{[-.36,.36].map(z=><mesh key={z} position={[0,.035,z]}><boxGeometry args={[30,.07,.075]}/><meshStandardMaterial color="#aeb7bb" metalness={.82} roughness={.24}/></mesh>)}{Array.from({length:50},(_,i)=><mesh key={i} position={[-14.7+i*.6,.005,0]}><boxGeometry args={[.16,.09,1.05]}/><meshStandardMaterial color="#39464c" metalness={.32} roughness={.62}/></mesh>)}</group>
    {/* Platform power poles and a quiet cable run, with the station roof above them. */}
    {[-13.5,-7.5,7.5,13.5].map((x,i)=><PowerPole key={x} id={i} active={metroPowered} position={[x,.76,6.2]} onToggle={onPoleClick}/>)}
    {[-12,0,12].map((x,i)=><PowerPole key={`back-pole-${x}`} id={i+4} active={metroPowered} position={[x,.76,-8.05]} onToggle={onPoleClick}/>)}
    <mesh position={[0,4.35,6.2]}><boxGeometry args={[30,.025,.025]}/><meshStandardMaterial color="#555f64" metalness={.68} roughness={.42}/></mesh>
    <mesh position={[0,4.35,-8.05]}><boxGeometry args={[30,.025,.025]}/><meshStandardMaterial color="#555f64" metalness={.68} roughness={.42}/></mesh>
    <group position={[5.15,.775,-1.93]}><mesh position={[0,.47,0]}><boxGeometry args={[.48,.94,.42]}/><meshStandardMaterial color="#4a5357" metalness={.48} roughness={.55}/></mesh>{Array.from({length:5},(_,i)=><mesh key={i} position={[0,.45,-.19+i*.075]}><boxGeometry args={[.34,.025,.018]}/><meshStandardMaterial color="#869095" metalness={.72} roughness={.36}/></mesh>)}</group>
    <group position={[6.15,.775,-1.93]}><mesh position={[0,.48,0]}><boxGeometry args={[.58,.96,.52]}/><meshStandardMaterial color="#525d61" metalness={.54} roughness={.48}/></mesh><mesh position={[0,.99,.02]}><boxGeometry args={[.42,.035,.38]}/><meshStandardMaterial color="#899497" metalness={.62} roughness={.38}/></mesh>{[-.14,0,.14].map((x,i)=><mesh key={x} position={[x,.48,.27]}><boxGeometry args={[.055,.56,.018]}/><meshStandardMaterial color={energyEnabled?'#c3aa77':'#626c70'} emissive={energyEnabled?'#c3aa77':'#000000'} emissiveIntensity={energyEnabled ? .25 : 0}/></mesh>)}</group>
    <EnergyCabinet powered={metroPowered}/>
    <DistributionWall powered={metroPowered}/>
    {/* Ticket gates are connected to the concourse floor; the old floating stair is removed. */}
    <StationFurnishings metroPowered={metroPowered}/>
    <Suspense fallback={null}><SnackKiosk powered={metroPowered}/></Suspense>
    <Suspense fallback={null}><ReadyMadeStationAssets/></Suspense>
    {tileRows.flatMap((z,row)=>Array.from({length:2},(_,person)=>{const offset=row*2.3+person*5.3,slot=row*2+person,direction:1|-1=(row+person)%2===0?1:-1,snackStop=(row===0&&person===0)||(row===1&&person===1)||(row===2&&person===0),boardingX=snackStop?(direction>0?3.5:-13.5):row<7?-3.2+slot*.48:-3.2+(slot-14)*1.28;return <Walker key={`passenger-${row}-${person}`} offset={offset} conversationSide={person===0?1:-1} direction={direction} boardingX={boardingX} snackStop={snackStop} startDistance={person*3.4} baseY={.742} z={z+(person===0?-.38:.38)} walkSpan={30} animate={animate} operating={operating} doorsOpen={doorsOpen} resetKey={resetKey} onPlatformStep={onPassengerStep} onPlatformLeave={onPassengerLeave}/>;}))}
    {[-7.8,-6.6,6.6,7.8].map((x,i)=><Walker key={`station-chat-${i}`} offset={32+i*2} direction={i%2===0?1:-1} homeX={x} stationaryChat baseY={.742} z={3.55} animate={animate} operating={operating} doorsOpen={doorsOpen} resetKey={resetKey} onPlatformStep={()=>{}} onPlatformLeave={()=>{}}/>)}
    <group ref={train} position={[0,.285,-4.15]}>
      <MetroCar doorsOpen={doorsOpen} trainMoving={trainMoving} animate={animate} interiorView={interiorView}/>
      {/* Seats, grab rails and interior lighting sit inside the carriage. */}
      {[-2.9,-1.5,1.5,2.9].map(x=>[-1,1].map(side=><group key={`${x}-${side}`} position={[x,.49,side*.5]}>
        <mesh position={[0,.45,0]}><boxGeometry args={[.68,.1,.34]}/><meshStandardMaterial color={side<0?'#58666b':'#7b6252'} roughness={.78}/></mesh>
        <mesh position={[0,.72,side*.12]}><boxGeometry args={[.68,.46,.07]}/><meshStandardMaterial color={side<0?'#58666b':'#7b6252'} roughness={.78}/></mesh>
      </group>))}
      {[-3,-1.5,0,1.5,3].map(x=><mesh key={x} position={[x,1.1,0]}><cylinderGeometry args={[.018,.024,1.2,8]}/><meshStandardMaterial color="#aab3b6" metalness={.78} roughness={.3}/></mesh>)}
      {[-.34,.34].map(z=><mesh key={z} position={[0,1.75,z]}><boxGeometry args={[7.5,.035,.035]}/><meshStandardMaterial color="#aab3b6" metalness={.72} roughness={.32}/></mesh>)}
      {[-2.3,0,2.3].map(x=><mesh key={x} position={[x,1.78,0]}><boxGeometry args={[1.4,.025,.48]}/><meshStandardMaterial color="#e1e4e3" emissive="#d9dfdf" emissiveIntensity={metroPowered ? .42 : 0}/></mesh>)}
      {metroPowered&&<><pointLight position={[-2,1.65,0]} color="#d5e8ed" intensity={.72} distance={5}/><pointLight position={[2,1.65,0]} color="#d5e8ed" intensity={.72} distance={5}/></>}
    </group>
    {tileStations.map((_,i)=><FlowParticle key={`flow-${i}`} offset={0} pulseId={flowVisible&&selectedModule===i?pulseId:0} moduleIndex={i} active={flowVisible&&energyEnabled&&(stepStates[i]||peopleOnPlatforms[i])} running={false}/>)}
    <gridHelper args={[36,36,'#34454e','#1b2a31']} position={[0,.01,0]}/>
    <OrbitControls ref={controlsRef} makeDefault target={mode==='Interior'?[3.5,1.2,-4.15]:mode==='Plataformas'?[0,.76,-2.4]:mode==='Cabos'?[0,-.35,-4.15]:mode==='Energia Tile'?[0,.76,1.5]:[0,.5,0]} enablePan={!compact} enableZoom minDistance={mode==='Interior'?1.5:compact?8:5} maxDistance={compact?80:42} maxPolarAngle={Math.PI/2.05} enableDamping dampingFactor={.08}/>
  </>;
}
export function Scene({ station=false, exploded=false, mode='Panorâmica' }: {station?:boolean;exploded?:boolean;mode?:ViewMode}) {
  const [selected,setSelected]=useState('Superfície de contato');
  const [explosionStep,setExplosionStep]=useState(exploded?4:0);
  const [explosionPlaying,setExplosionPlaying]=useState(false);
  const [partCardOpen,setPartCardOpen]=useState(false);
  const [metroPowered,setMetroPowered]=useState(false);
  const [trainMotion,setTrainMotion]=useState(false);
  const [resetKey,setResetKey]=useState(0);
  const [energyEnabled,setEnergyEnabled]=useState(false);
  const [flowVisible,setFlowVisible]=useState(false);
  const platformsVisible=true;
  const [stepStates,setStepStates]=useState<boolean[]>(()=>Array(tileStations.length).fill(false));
  const [peopleOnPlatforms,setPeopleOnPlatforms]=useState<boolean[]>(()=>Array(tileStations.length).fill(false));
  const platformOccupancy=useRef<number[]>(Array(tileStations.length).fill(0));
  const stepTimers=useRef<Map<number,number>>(new Map());
  const [polesActive,setPolesActive]=useState<boolean[]>(()=>Array(7).fill(false));
  const [selectedPole,setSelectedPole]=useState<number|null>(null);
  const [selectedModule,setSelectedModule]=useState<number|null>(null);
  const [pulseId,setPulseId]=useState(0);
  const [trainArrived,setTrainArrived]=useState(false);
  const [doorsOpen,setDoorsOpen]=useState(false);
  const reduced=useReducedMotion();
  useEffect(()=>()=>{stepTimers.current.forEach(timer=>window.clearTimeout(timer));stepTimers.current.clear();},[]);
  const activatePlatform=(index:number)=>{
    setSelectedPole(null);
    setSelectedModule(index);
    registerClickStep(index);
    setPulseId(value=>value+1);
  };
  const registerClickStep=(index:number)=>{
    setStepStates(current=>current[index]?current:current.map((active,i)=>i===index?true:active));
    const previousTimer=stepTimers.current.get(index);
    if(previousTimer!==undefined)window.clearTimeout(previousTimer);
    const timer=window.setTimeout(()=>{
      setStepStates(current=>current[index]?current.map((active,i)=>i===index?false:active):current);
      stepTimers.current.delete(index);
    },1100);
    stepTimers.current.set(index,timer);
    setEnergyEnabled(true);
    setFlowVisible(true);
  };
  const registerPassengerStep=(index:number)=>{
    const nextCount=platformOccupancy.current[index]+1;
    platformOccupancy.current[index]=nextCount;
    if(nextCount===1)setPeopleOnPlatforms(current=>current[index]?current:current.map((active,i)=>i===index?true:active));
    setEnergyEnabled(true);
    setFlowVisible(true);
  };
  const leavePassengerPlatform=(index:number)=>{
    const nextCount=Math.max(0,platformOccupancy.current[index]-1);
    platformOccupancy.current[index]=nextCount;
    if(nextCount===0)setPeopleOnPlatforms(current=>current[index]?current.map((active,i)=>i===index?false:active):current);
  };
  useEffect(()=>{
    if(!energyEnabled)return;
    const timer=window.setTimeout(()=>{setMetroPowered(true);setTrainMotion(true);},1000);
    return()=>window.clearTimeout(timer);
  },[energyEnabled]);
  useEffect(()=>{if(!explosionPlaying)return;const timer=window.setInterval(()=>setExplosionStep(step=>Math.min(4,step+1)),850);return()=>window.clearInterval(timer);},[explosionPlaying]);
  useEffect(()=>{if(explosionStep>=4)setExplosionPlaying(false);},[explosionStep]);
  const view:ViewMode=mode;
  return <div className="scene-frame">
    <Canvas dpr={[1,1.5]} camera={{position:[8,8,12]}} gl={{antialias:true,alpha:true}} fallback={<div className="webgl-fallback">A visualização 3D não está disponível neste dispositivo. Consulte a descrição técnica ao lado.</div>}>
      <Suspense fallback={<mesh><boxGeometry args={[2,.2,4]}/><meshStandardMaterial color="#566268"/></mesh>}>
      {station
        ? <Metro mode={view} animate={true} operating={metroPowered||trainMotion} metroPowered={metroPowered} trainMotion={trainMotion} resetKey={resetKey} energyEnabled={energyEnabled} flowVisible={flowVisible} platformsVisible={platformsVisible} stepStates={stepStates} peopleOnPlatforms={peopleOnPlatforms} polesActive={polesActive} onPoleClick={(id)=>{setSelectedModule(null);setSelectedPole(id);}} onPlatformClick={activatePlatform} selectedModule={selectedModule} pulseId={pulseId} onPressTile={activatePlatform} onPassengerStep={registerPassengerStep} onPassengerLeave={leavePassengerPlatform} doorsOpen={doorsOpen} interiorView={view==='Interior'} trainArrived={trainArrived} onTrainArrived={()=>setTrainArrived(true)} onDoorsChange={setDoorsOpen}/>
        : <EngineeringTile step={explosionStep} selected={selected} onSelect={(name)=>{setSelected(name);setPartCardOpen(true);}} showCallout={partCardOpen} onCloseCallout={()=>setPartCardOpen(false)}/>}
      </Suspense>
    </Canvas>
    {station&&<>
      <div className="scene-hud"><span className={metroPowered ? 'is-running' : ''}><i/>{metroPowered ? 'METRO LIGADO' : 'ESTAÇÃO EM ESPERA'}<em className="scene-hud-copy"> · TOQUE NO PISO PARA SIMULAR UMA PISADA</em></span></div>
      {selectedModule!==null&&<div className="scene-info-card" aria-live="polite">
        <b>ECOLUZ TILE - MODULO {selectedModule+1}</b>
        <span>Estado: {energyEnabled&&(stepStates[selectedModule]||peopleOnPlatforms[selectedModule])?'ativo':'em espera'}</span>
        <small>Geracao simulada por acionamento; sem medicao de campo.</small>
      </div>}
      {selectedPole!==null&&<div className="scene-info-card scene-info-pole" aria-live="polite">
        <b>POSTE DE ENERGIA {selectedPole+1}</b>
        <span>Estado: {metroPowered?'ligado':'em espera'}</span>
        <small>Origem simulada: sistema ECOLUZ | Consumo demonstrativo: {12+selectedPole*2} W. Nao e medicao real.</small>
      </div>}
    </>}
    {!station&&<>
      <div className="scene-tile-switch scene-assembly-controls">
        <button onClick={()=>{setExplosionStep(step=>step===0?1:step);setExplosionPlaying(true);}} disabled={explosionStep>=4}>Desmontar</button>
        <button onClick={()=>{setExplosionStep(0);setExplosionPlaying(false);}}>Montar novamente</button>
        <button onClick={()=>setExplosionPlaying(!explosionPlaying)} disabled={explosionStep===0||explosionStep>=4}>{explosionPlaying?'Pausar animacao':'Continuar'}</button>
        <span className="tile-step-badge">ETAPA {explosionStep} / 4</span>
      </div>
    </>}
  </div>;
}
