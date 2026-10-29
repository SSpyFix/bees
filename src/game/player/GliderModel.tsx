import { useMemo } from 'react';
import { DoubleSide, Quaternion, Vector3 } from 'three';
type Point=[number,number,number];
function Strut({from,to}:{from:Point;to:Point}) {
 const a=new Vector3(...from),b=new Vector3(...to),delta=b.clone().sub(a);
 return <mesh position={a.add(b).multiplyScalar(.5)} quaternion={new Quaternion().setFromUnitVectors(new Vector3(0,1,0),delta.clone().normalize())}>
  <cylinderGeometry args={[.025,.025,delta.length(),5]} /><meshStandardMaterial color="#393a36" />
 </mesh>;
}
export default function GliderModel({id}:{id:string}) {
 const wing=useMemo(()=>new Float32Array([0,4.7,1.7,-3.5,4.2,-1.7,0,4.2,-.6,0,4.7,1.7,0,4.2,-.6,3.5,4.2,-1.7]),[]);
 return <group name="deployed-glider">
  {id==='glider-0' ? <>
   <group position={[0,4.3,0]} scale={[1,.4,1]}>
    <mesh><sphereGeometry args={[2.6,24,12,0,Math.PI*2,0,Math.PI/2]} /><meshStandardMaterial color="#f5f0db" side={DoubleSide}/></mesh>
    {[0,1,2].map(i=><mesh key={i}><sphereGeometry args={[2.615,8,8,i*Math.PI*2/3,Math.PI/3,0,Math.PI/2]} /><meshStandardMaterial color="#e6bb38" side={DoubleSide}/></mesh>)}
   </group>
   {[-1,1].flatMap(x=>[-1,1].map(z=><Strut key={`${x},${z}`} from={[x*.5,2.5,z*.15]} to={[x*1.8,4.3,z*1.8]} />))}
  </> : <>
   <mesh><bufferGeometry><bufferAttribute attach="attributes-position" args={[wing,3]} /></bufferGeometry><meshBasicMaterial color="#eed650" side={DoubleSide} /></mesh>
   <Strut from={[-3.5,4.2,-1.7]} to={[0,4.7,1.7]} /><Strut from={[3.5,4.2,-1.7]} to={[0,4.7,1.7]} />
   <Strut from={[0,4.7,1.7]} to={[0,2.4,.5]} />
   <Strut from={[-2.5,4.3,-1]} to={[-.6,2.5,.1]} /><Strut from={[2.5,4.3,-1]} to={[.6,2.5,.1]} />
  </>}
 </group>;
}
