export const ARRAY_TYPE_MAP = {
  i8: Int8Array,
  u8: Uint8Array,
  i16: Int16Array,
  u16: Uint16Array,
  f32: Float32Array,
  f64: Float64Array,
} as const;
export const DIMENSIONS = [1, 2, 3, 4, 6, 9, 16] as const;

const arrayTypeEntries = Object.entries(ARRAY_TYPE_MAP) as [OneOfArrayType, OneOfArrayConstructor][];
const ArrayCreators = arrayTypeEntries.reduce<Record<string, AnyArrayCreator>>((acc, [arrayType, constructor]) => {
  DIMENSIONS.forEach((dimension) => {
    const creator = () => new constructor(dimension) as OneOfArray;
    creator.type = `${arrayType}-${dimension}`;
    creator.schema = { arrayType, dimension };
    acc[creator.type] = creator;
  });
  return acc;
}, {});

export type OneOfArrayType = Extract<keyof typeof ARRAY_TYPE_MAP, string>;
export type OneOfArrayConstructor = typeof ARRAY_TYPE_MAP[OneOfArrayType];
export type OneOfArray = InstanceType<OneOfArrayConstructor>;

export type OneOfDimension = typeof DIMENSIONS[number];

export interface VectorSchema {
  arrayType: OneOfArrayType;
  dimension: OneOfDimension;
}

export interface ArrayCreator<A extends OneOfArray> {
  (): A;
  type: string;
  schema: VectorSchema;
}
export type AnyArrayCreator = ArrayCreator<OneOfArray>;

export default ArrayCreators;
