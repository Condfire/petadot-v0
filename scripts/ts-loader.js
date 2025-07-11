import { readFile } from 'node:fs/promises';
import ts from 'typescript';

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('node:')) {
    return defaultResolve(specifier, context, defaultResolve);
  }
  if (specifier.endsWith('.ts') || specifier.endsWith('.tsx')) {
    const url = new URL(specifier, context.parentURL).href;
    return { url, shortCircuit: true };
  }
  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    const source = await readFile(new URL(url));
    const { outputText } = ts.transpileModule(source.toString(), {
      compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React }
    });
    return { format: 'module', source: outputText, shortCircuit: true };
  }
  return defaultLoad(url, context, defaultLoad);
}
