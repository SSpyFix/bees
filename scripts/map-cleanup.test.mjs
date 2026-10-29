import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanImportedPart, legacyPerimeterWall } from './map-cleanup.mjs';

test('excludes the invisible Rose / Red HQ approach barrier on future map imports', () => {
  const markers = [{name: 'Rose Field', position: [-74.18475, 6.15833, -50.237325], size: [46.2, 1, 28]}];
  const wall = {opacity: 0, position: [-49.47, 15.566, -36.4475], size: [.35, 20.632, 75.457], rotation: [1,0,0,0,1,0,0,0,1]};
  assert.equal(legacyPerimeterWall(wall, markers), true);
  assert.equal(legacyPerimeterWall({...wall, opacity: 1}, markers), false);
});

test('removes short invisible Clover perimeter walls without removing visible terrain', () => {
  const markers = [{ name: 'Clover Field', position: [102.915, 10.95, -27.137], size: [53.2, 1, 40.6] }];
  const wall = { opacity: 0, position: [76.4025, 13.834, -26.175], size: [.175, 8.068, 41.65], rotation: [1,0,0,0,1,0,0,0,1] };
  assert.equal(legacyPerimeterWall(wall, markers), true);
  assert.equal(legacyPerimeterWall({ ...wall, opacity: 1 }, markers), false);
  assert.equal(legacyPerimeterWall({ ...wall, size: [4, 8, 42] }, markers), false);
  assert.equal(legacyPerimeterWall({ ...wall, position: [200, 14, -26] }, markers), false);
  assert.equal(legacyPerimeterWall(wall, [{ ...markers[0], name: 'Spider Field' }]), false);
});

test('excludes exported stray bees together with their wings and accessories', () => {
  for (const path of ['Model/Model/Bee269', 'Model/Model/Bee147/Wings', 'Model/Model/Bee153/Ear'])
    assert.equal(cleanImportedPart({ path, decals: [] }), null);
});

test('empties prefilled hive portraits while preserving the cells and their geometry', () => {
  const source = { path: 'Model/Model/Hive6/Cells/C2,1/Backplate', size: [1,1,.1], decals: [{ asset: '1463276253', opacity: .8 }] };
  const cleaned = cleanImportedPart(source);
  assert.deepEqual(cleaned.decals, []);
  assert.deepEqual(cleaned.size, source.size);
  assert.equal(source.decals.length, 1);
  assert.deepEqual(cleanImportedPart({ path: 'Model/Model/Hive6/Cells/C2,1/Cell', decals: [] }).decals, []);
});

test('preserves bee gate monuments, field geometry, and non-bee signs', () => {
  for (const path of ['Model/Model/5 Bee Gate/Basic/Wings', 'Model/Model/10BeeGate/Platform', 'Model/40 Bee Zone/Path/Part', 'Model/Model/Black Bear/Head']) {
    const source = { path, decals: [{ asset: 'face-or-sign' }] };
    assert.equal(cleanImportedPart(source), source);
  }
});
