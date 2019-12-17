import ts from 'typescript';
import path from 'path';
import ArrayCreators, { DIMENSIONS, OneOfDimension, ARRAY_TYPE_MAP, OneOfArrayType } from '../../../src/typedArray';
import { checkConnectabilityBySchema } from '../../../src/utils';

const creatorList = Object.values(ArrayCreators);
const baseFile = path.resolve(__dirname, '../../../src/gen/vectorMap.base.ts');

const hydrateVectorCreatorMap = () => {
  const baseText = ts.sys.readFile(baseFile, 'utf-8');
  if (!baseText) throw new Error('no base file found');

  const file = ts.createSourceFile('vectorMap.base.ts', baseText, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);

  let statements = overwriteInterfaceDeclaration([...file.statements], 'VectorMap', createVectorMapMembers());
  statements = overwriteInterfaceDeclaration(
    statements,
    'AcceptableVectorTypeMap',
    createAcceptableVectorTypeMapMembers(),
  );

  return ts.updateSourceFileNode(
    file,
    statements,
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

  return creatorList.map<ts.PropertySignature>(({ type, schema }) => {
    const { arrayType, dimension } = schema;
    return ts.createPropertySignature(
      [ts.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
      ts.createStringLiteral(type),
      undefined,
      tupleNodes[arrayType](dimension),
      undefined,
    );
  });
};

const createAcceptableVectorTypeMapMembers = () => {
  return creatorList.map<ts.PropertySignature>((to) => {
    const list = creatorList
      .filter((from) => checkConnectabilityBySchema(to.schema, from.schema))
      .map(({ type }) => ts.createLiteralTypeNode(ts.createStringLiteral(type)));
    return ts.createPropertySignature(
      [ts.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
      ts.createStringLiteral(to.type),
      undefined,
      ts.createUnionTypeNode(list),
      undefined,
    );
  });
};

const overwriteInterfaceDeclaration = (statements: ts.Statement[], name: string, members: ts.TypeElement[]) => {
  const index = statements.findIndex((statement) => {
    if (!ts.isInterfaceDeclaration(statement)) return false;
    if (ts.idText(statement.name) !== name) return false;
    return true;
  });
  if (index === -1) return statements;

  const statement = ts.getMutableClone(statements[index] as ts.InterfaceDeclaration);
  statement.members = ts.createNodeArray(members);
  return [...statements.slice(0, index), statement, ...statements.slice(index + 1)];
};

export default hydrateVectorCreatorMap;
