import ts from 'typescript';
import path from 'path';
import hydrateVectorCreatorMap from './generators/vector';
import { printStatements } from './utils/printer';
import prettierrc from '@whatasoda/eslint-config/.prettierrc.json';

const root = path.resolve(__dirname, '../../');
const outfile = path.join(root, 'src/types/custom.generated.d.ts');

const generate = async () => {
  const statements: ts.Statement[] = [hydrateVectorCreatorMap()];
  await printStatements(outfile, statements, ts.sys, { prettierrc: prettierrc as any });
};

if (process.mainModule === module) {
  generate();
}

export default generate;
