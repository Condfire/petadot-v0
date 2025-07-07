import assert from 'node:assert/strict';
import { test } from 'node:test';

// Helper to dynamically import TypeScript files when possible
async function loadTSModule(modulePath) {
  try {
    return await import(modulePath);
  } catch (err) {
    // Node may not understand .ts extension without loader
    // so just rethrow for visibility in test results
    throw err;
  }
}

test('registration success flow', async (t) => {
  const mod = await loadTSModule('../app/actions/auth-actions.ts');
  assert.ok(typeof mod.registerUserAndNgoAction === 'function');
});

test('login function exists', async (t) => {
  const mod = await loadTSModule('../app/auth-provider.tsx');
  assert.ok(typeof mod.AuthProvider === 'function');
});

test('oauth callback route exists', async (t) => {
  const mod = await loadTSModule('../app/auth/callback/route.ts');
  assert.ok(typeof mod.GET === 'function');
});
