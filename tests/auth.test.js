import assert from 'node:assert/strict';
import { test } from 'node:test';

// Dynamic import helper for TypeScript modules
async function loadTS(modulePath) {
  return import(modulePath);
}

test('image path utility returns placeholder', async () => {
  const mod = await loadTS('../lib/image-path.ts');
  assert.equal(mod.getImagePath(null), '/a-cute-pet.png');
});

test('structured data generator exports function', async () => {
  const mod = await loadTS('../lib/structured-data.ts');
  assert.equal(typeof mod.generateAdoptionPetSchema, 'function');
});

test('image compression module exports function', async () => {
  const mod = await loadTS('../lib/image-compression.ts');
  assert.equal(typeof mod.compressImage, 'function');
});
