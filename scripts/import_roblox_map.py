"""Offline RBXMX conversion. Source scripts are counted, never evaluated.

Usage: python scripts/import_roblox_map.py path/to/map.rbxmx
Then: node scripts/build-map-glb.mjs
"""
import argparse
import concurrent.futures
import gzip
import json
import math
import pathlib
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCALE = 0.35
PART_CLASSES = {'Part', 'MeshPart', 'UnionOperation', 'WedgePart', 'CornerWedgePart', 'TrussPart', 'SpawnLocation', 'Seat'}
IDENTITY = [1, 0, 0, 0, 1, 0, 0, 0, 1]


def asset_id(value):
    if not value:
        return None
    match = re.fullmatch(r'rbxassetid://(\d+)', value)
    if match:
        return match[1]
    url = urllib.parse.urlparse(value)
    if url.hostname in ('www.roblox.com', 'roblox.com', 'assetdelivery.roblox.com'):
        candidate = urllib.parse.parse_qs(url.query).get('id', [''])[0]
        return candidate if candidate.isdigit() else None
    return None


def properties(item):
    node = item.find('Properties')
    return {child.get('name'): child for child in node} if node is not None else {}


def text(props, name, default=''):
    node = props.get(name)
    return ''.join(node.itertext()).strip() if node is not None else default


def vector(props, name, default):
    node = props.get(name)
    return [float(c.text or 0) for c in node] if node is not None else list(default)


def read_scene(source, origin=None, scale=SCALE):
    clean = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', source)
    root = ET.fromstring(clean)
    cache = {id(item): properties(item) for item in root.iter('Item')}
    if origin is None:
        spawn = next((item for item in root.iter('Item') if item.get('class') == 'SpawnLocation'), None)
        cf = vector(cache[id(spawn)], 'CFrame', [0, 0, 0]) if spawn is not None else [0, 0, 0]
        origin = [cf[0], 133.2 if spawn is not None else cf[1], cf[2]]
    scene = {'parts': [], 'models': [], 'markers': [], 'origin': origin, 'scale': scale,
             'report': {'scriptsExcluded': 0, 'controlCharactersRemoved': len(source) - len(clean), 'classes': dict(Counter(i.get('class') for i in root.iter('Item')))}}

    def position(cf):
        return [round((cf[a] - origin[a]) * scale, 5) for a in range(3)]

    def visit(item, path):
        cls = item.get('class')
        props = cache[id(item)]
        name = text(props, 'Name', cls)
        path = path + [name]
        if cls in ('Script', 'LocalScript', 'ModuleScript'):
            scene['report']['scriptsExcluded'] += 1
            return
        if cls == 'Model':
            pivot = props.get('WorldPivotData')
            frame = pivot.find('CFrame') if pivot is not None else None
            if frame is not None:
                scene['models'].append({'name': name, 'path': '/'.join(path), 'position': position([float(c.text or 0) for c in frame][:3])})
        if cls in PART_CLASSES:
            cf = vector(props, 'CFrame', [0, 0, 0] + IDENTITY)
            size = vector(props, 'size', [1, 1, 1])
            color = int(text(props, 'Color3uint8', '4288914085')) & 0xffffff
            part = {'name': name, 'class': cls, 'path': '/'.join(path),
                    'position': position(cf), 'rotation': cf[3:12],
                    'size': [round(s * scale, 5) for s in size], 'color': '#%06x' % color,
                    'opacity': 1 - float(text(props, 'Transparency', '0')),
                    'collide': text(props, 'CanCollide', 'true') == 'true',
                    'shape': int(text(props, 'shape', '1')), 'material': int(text(props, 'Material', '256')),
                    'mesh': asset_id(text(props, 'MeshId')), 'texture': asset_id(text(props, 'TextureID')),
                    'union': asset_id(text(props, 'AssetId')), 'decals': []}
            for child in item.findall('Item'):
                cp = cache[id(child)]
                cc = child.get('class')
                if cc in ('SpecialMesh', 'BlockMesh', 'CylinderMesh'):
                    part['special'] = {'type': int(text(cp, 'MeshType', '6')) if cc == 'SpecialMesh' else (6 if cc == 'BlockMesh' else 4),
                                       'mesh': asset_id(text(cp, 'MeshId')), 'texture': asset_id(text(cp, 'TextureId')),
                                       'scale': vector(cp, 'Scale', [1, 1, 1]), 'offset': [v * scale for v in vector(cp, 'Offset', [0, 0, 0])]}
                if cc in ('Decal', 'Texture'):
                    aid = asset_id(text(cp, 'Texture'))
                    if aid:
                        part['decals'].append({'asset': aid, 'face': int(text(cp, 'Face', '5')), 'opacity': 1 - float(text(cp, 'Transparency', '0'))})
            scene['parts'].append(part)
            if name.endswith((' Field', ' Patch', ' Forest')) or cls == 'SpawnLocation':
                scene['markers'].append({'name': name, 'position': part['position'], 'size': part['size']})
        for child in item.findall('Item'):
            visit(child, path)

    for item in root.findall('Item'):
        visit(item, [])
    return scene


def fetch_asset(aid, cache):
    path = cache / aid
    if path.exists():
        return aid, None
    try:
        req = urllib.request.Request('https://assetdelivery.roblox.com/v1/asset/?id=' + aid, headers={'User-Agent': 'Roblox/WinInet'})
        with urllib.request.urlopen(req, timeout=12) as response:
            data = response.read(32 * 1024 * 1024)
        if data.startswith(b'\x1f\x8b'):
            data = gzip.decompress(data)
        path.write_bytes(data)
        return aid, None
    except Exception as error:
        return aid, str(error)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=pathlib.Path)
    parser.add_argument('--offline', action='store_true')
    args = parser.parse_args()
    print('Reading RBXMX...', flush=True)
    scene = read_scene(args.source.read_text(encoding='utf-8'))
    assets = set()
    for part in scene['parts']:
        assets.update(a for a in (part.get('mesh'), part.get('texture'), part.get('union')) if a)
        assets.update(d['asset'] for d in part['decals'])
        if 'special' in part:
            assets.update(a for a in (part['special']['mesh'], part['special']['texture']) if a)
    cache = ROOT / '.local' / 'roblox-assets'
    cache.mkdir(parents=True, exist_ok=True)
    previous_path = ROOT / '.local' / 'source-map.json'
    previous_failures = json.loads(previous_path.read_text(encoding='utf-8'))['report'].get('assetFailures', {}) if args.offline and previous_path.exists() else {}
    failures = {aid: previous_failures.get(aid, 'Asset not cached') for aid in assets if not (cache / aid).exists()} if args.offline else {}
    if not args.offline:
        print(f'Fetching {len(assets)} distinct referenced assets...', flush=True)
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
            for n, (aid, error) in enumerate(executor.map(lambda aid: fetch_asset(aid, cache), sorted(assets)), 1):
                if error:
                    failures[aid] = error
                if n % 40 == 0:
                    print(f'Assets {n}/{len(assets)}; unavailable {len(failures)}', flush=True)
    scene['report']['assetFailures'] = failures
    scene['report']['source'] = args.source.name
    scene['report']['sourceBytes'] = args.source.stat().st_size
    (ROOT / '.local' / 'source-map.json').write_text(json.dumps(scene, separators=(',', ':')), encoding='utf-8')
    print(f"Extracted {len(scene['parts'])} parts and {len(scene['markers'])} location markers.", flush=True)


if __name__ == '__main__':
    main()
