import ts from 'typescript';
import path from 'path';
import hydrateVectorCreatorMap from './generators/vector';
import { printStatements } from './utils/printer';
import prettierrc from '@whatasoda/eslint-config/.prettierrc.json';

const root = path.resolve(__dirname, '../../');
const outfile = path.join(root, 'src/gen/vectorMap.ts');

const generate = async () => {
  const header = 'If you want to modify types, modify gen/vectorMap.base.ts first and regenerate this file';
  const file = hydrateVectorCreatorMap();
  await printStatements(outfile, file, ts.sys, { header, prettierrc: prettierrc as any });
};

if (process.mainModule === module) {
  generate();
}

export default generate;
