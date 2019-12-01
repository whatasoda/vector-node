import ts from 'typescript';
import path from 'path';
import { VectorCreators, ARRAY_TYPE_MAP, DIMENSIONS } from '../../../src/vector';
import { OneOfLifetime, OneOfDimension, OneOfArrayType, AnyVectorCreator } from 'decls';

const baseFile = path.resolve(__dirname, '../../../src/decls.base.ts');

const lifetimeInterfaceName: Record<OneOfLifetime, string> = {
  moment: 'Moment',
};

const hydrateVectorCreatorMap = () => {
  const baseText = ts.sys.readFile(baseFile, 'utf-8');
  if (!baseText) throw new Error('no base file found');

  const file = ts.createSourceFile('decls.base.ts', baseText, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  const { kindMap, members } = createVectorMapMembers();

  let statements = overwriteInterfaceDeclaration([...file.statements], 'VectorMap', members);

  Object.entries(kindMap).forEach(([lifetimeName, typeList]) => {
    statements = overwriteTypeAlias(
      statements,
      `OneOf${lifetimeName}VectorType`,
      ts.createUnionTypeNode(typeList.map((type) => ts.createLiteralTypeNode(ts.createStringLiteral(type)))),
    );
  });

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

  const members: ts.PropertySignature[] = [];
  const kindMap = Object.values(lifetimeInterfaceName).reduce<Record<string, string[]>>((acc, key) => {
    acc[key] = [];
    return acc;
  }, {});
  (Object.values(VectorCreators) as AnyVectorCreator[]).forEach(({ type, schema }) => {
    const { arrayType, dimension, lifetime } = schema;
    const lifetimeName = lifetimeInterfaceName[lifetime];
    kindMap[lifetimeName].push(type);
    members.push(
      ts.createPropertySignature(
        [ts.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
        ts.createStringLiteral(type),
        undefined,
        ts.createTypeReferenceNode(lifetimeInterfaceName[lifetime], [tupleNodes[arrayType](dimension)]),
        undefined,
      ),
    );
  });

  return { members, kindMap };
};

const overwriteTypeAlias = (statements: ts.Statement[], name: string, type: ts.TypeNode) => {
  const index = statements.findIndex((statement) => {
    if (!ts.isTypeAliasDeclaration(statement)) return false;
    if (ts.idText(statement.name) !== name) return false;
    return true;
  });
  if (index === -1) return statements;

  const statement = ts.getMutableClone(statements[index] as ts.TypeAliasDeclaration);
  statement.type = type;
  return [...statements.slice(0, index), statement, ...statements.slice(index + 1)];
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
