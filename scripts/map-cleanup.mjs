/** Source-map decoration cleanup; live player bees are rendered separately. */
export function cleanImportedPart(part) {
  if (/(?:^|\/)Bee\d+(?:\/|$)/.test(part.path)) return null;
  if (/(?:^|\/)Hive\d+\/Cells\/[^/]+\/Backplate$/.test(part.path))
    return { ...part, decals: [] };
  return part;
}

export function legacyPerimeterWall(p, markers) {
  // Exported invisible wall beside Rose Field, across the Red HQ / Jelly approach.
  if(p.opacity<=0.001 && p.position.every((v,a)=>Math.abs(v-[-49.47,15.566,-36.4475][a])<.003) &&
    p.size.every((v,a)=>Math.abs(v-[.35,20.632,75.457][a])<.003)) return true;
  if(p.opacity>0.001 || p.size[1]<5 || Math.min(p.size[0],p.size[2])>0.3) return false;
  const r=p.rotation,extent=[0,1,2].map(a=>p.size.reduce((n,v,b)=>n+Math.abs(r[a*3+b])*v/2,0));
  return markers.some(f=>f.name!=='SpawnLocation' &&
    (p.size[1]>=30 || f.name==='Clover Field') &&
    [0,1,2].every(a=>Math.abs(p.position[a]-f.position[a])<extent[a]+f.size[a]/2+(f.name==='Clover Field' ? 1 : 0)));
}
