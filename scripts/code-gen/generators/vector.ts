import ts from 'typescript';
import path from 'path';
import { VectorCreators, ARRAY_TYPE_MAP, DIMENSIONS } from '../../../src/vector';
import { OneOfLifetime, OneOfDimension, OneOfArrayType, AnyVectorCreator } from 'decls';

const baseFile = path.resolve(__dirname, '../../../src/decls.base.ts');
const INTERFACE_NAME = 'VectorMap';

const lifetimeInterfaceName: Record<OneOfLifetime, string> = {
  moment: 'Moment',
  sequence: 'Sequence',
};

const hydrateVectorCreatorMap = () => {
  const baseText = ts.sys.readFile(baseFile, 'utf-8');
  if (!baseText) throw new Error('no base file found');

  const file = ts.createSourceFile('decls.base.ts', baseText, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  const { statements } = file;

  const targetIndex = statements.findIndex((statement) => {
    if (!ts.isInterfaceDeclaration(statement)) return false;
    if (ts.idText(statement.name) !== INTERFACE_NAME) return false;
    return true;
  });

  if (targetIndex === -1) throw new Error(`No interface '${INTERFACE_NAME}' found`);

  const targetStatement = statements[targetIndex] as ts.InterfaceDeclaration;
  const hydratedStatement = ts.createInterfaceDeclaration(
    targetStatement.decorators,
    targetStatement.modifiers,
    targetStatement.name,
    targetStatement.typeParameters,
    targetStatement.heritageClauses,
    createVectorMapMembers(),
  );

  return ts.updateSourceFileNode(
    file,
    [...statements.slice(0, targetIndex), hydratedStatement, ...statements.slice(targetIndex + 1)],
    false,
    file.referencedFiles,
    file.typeReferenceDirectives,
    file.hasNoDefaultLib,
    file.libReferenceDirectives,
  );
};

const createVectorMapMembers = () => {
  const dimensionNodes = DIMENSIONS.reduce<Record<OneOfDimension, () => ts.TypeNode>>((acc, dimension) => {
    acc[dimension] = () => ts.createLiteralTypeNode(ts.createNumericLiteral(`${dimension}`));
    return acc;
  }, {} as any);

  const tupleNodes = (Object.entries(ARRAY_TYPE_MAP) as [OneOfArrayType, Function][]).reduce<
    Record<OneOfArrayType, (dimension: OneOfDimension) => ts.TypeNode>
  >((acc, [arrayType, { name }]) => {
    const prefix = name.replace(/Array$/, '');
    const typeName = `${prefix}Tuple`;
    acc[arrayType] = (dimension: OneOfDimension) => ts.createTypeReferenceNode(typeName, [dimensionNodes[dimension]()]);
    return acc;
  }, {} as any);

  const members = (Object.values(VectorCreators) as AnyVectorCreator[]).reduce<ts.PropertySignature[]>(
    (acc, { type, schema }) => {
      const { arrayType, dimension, lifetime } = schema;
      acc.push(
        ts.createPropertySignature(
          [ts.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
          ts.createStringLiteral(type),
          undefined,
          ts.createTypeReferenceNode(lifetimeInterfaceName[lifetime], [tupleNodes[arrayType](dimension)]),
          undefined,
        ),
      );
      return acc;
    },
    [],
  );

  return members;
};

export default hydrateVectorCreatorMap;
