import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanImportedPart } from './map-cleanup.mjs';

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
