import ts from 'typescript';
import { VectorCreators, ARRAY_TYPE_MAP, DIMENSIONS } from '../../../src/vector';

const lifetimeInterfaceName: Record<OneOfLifetime, string> = {
  moment: 'Moment',
  sequence: 'Sequence',
};

const hydrateVectorCreatorMap = () => {
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

  return ts.createInterfaceDeclaration(
    undefined,
    undefined,
    'VectorCreatorMapFromGeneration',
    undefined,
    undefined,
    members,
  );
};

export default hydrateVectorCreatorMap;
