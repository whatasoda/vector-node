/// <reference types="typed-tuple-type/lib" />

export const ARRAY_TYPE_MAP = {
  i8: Int8Array,
  u8: Uint8Array,
  i16: Int16Array,
  u16: Uint16Array,
  f32: Float32Array,
  f64: Float64Array,
};
export const DIMENSIONS = [1, 2, 3, 4, 6, 9, 16] as const;

const arrayTypeEntries = Object.entries(ARRAY_TYPE_MAP) as [OneOfArrayType, OneOfArrayConstructor][];
export const VectorCreators = arrayTypeEntries.reduce<Record<string, AnyVectorCreator>>(
  (acc, [arrayType, constructor]) => {
    DIMENSIONS.forEach((dimension) => {
      const creator: AnyVectorCreator = () => new constructor(dimension) as AnyVector;
      creator.type = `${arrayType}-${dimension}`;
      creator.schema = { arrayType, dimension };
      acc[creator.type] = creator;
    });
    return acc;
  },
  {},
);

export type OneOfArrayType = Extract<keyof typeof ARRAY_TYPE_MAP, string>;
export type OneOfArrayConstructor = typeof ARRAY_TYPE_MAP[OneOfArrayType];
export type OneOfArray = InstanceType<OneOfArrayConstructor>;

export type OneOfDimension = typeof DIMENSIONS[number];

export interface VectorSchema {
  arrayType: OneOfArrayType;
  dimension: OneOfDimension;
}

export type Vector<A extends OneOfArray> = A;
export type AnyVector = Vector<OneOfArray>;

export interface VectorCreator<V extends AnyVector> {
  (): V;
  type: string;
  schema: VectorSchema;
}
export type AnyVectorCreator = VectorCreator<AnyVector>;

export type OneOfVectorType = Extract<keyof VectorMap, string>;
export type OneOfVector = VectorMap[OneOfVectorType];

export interface VectorMap {
  // interfaces to be hydrated by code generation and related types
  [type: string]: AnyVector;
}
