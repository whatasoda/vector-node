/* DO NOT EDIT MANUALLY. THIS IS GENERATED FILE. */
/* If you want to modify types, modify gen/vectorMap.base.ts first and regenerate this file */
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
  readonly 'i8-1': Int8Tuple<1>;
  readonly 'i8-2': Int8Tuple<2>;
  readonly 'i8-3': Int8Tuple<3>;
  readonly 'i8-4': Int8Tuple<4>;
  readonly 'i8-6': Int8Tuple<6>;
  readonly 'i8-9': Int8Tuple<9>;
  readonly 'i8-16': Int8Tuple<16>;
  readonly 'u8-1': Uint8Tuple<1>;
  readonly 'u8-2': Uint8Tuple<2>;
  readonly 'u8-3': Uint8Tuple<3>;
  readonly 'u8-4': Uint8Tuple<4>;
  readonly 'u8-6': Uint8Tuple<6>;
  readonly 'u8-9': Uint8Tuple<9>;
  readonly 'u8-16': Uint8Tuple<16>;
  readonly 'i16-1': Int16Tuple<1>;
  readonly 'i16-2': Int16Tuple<2>;
  readonly 'i16-3': Int16Tuple<3>;
  readonly 'i16-4': Int16Tuple<4>;
  readonly 'i16-6': Int16Tuple<6>;
  readonly 'i16-9': Int16Tuple<9>;
  readonly 'i16-16': Int16Tuple<16>;
  readonly 'u16-1': Uint16Tuple<1>;
  readonly 'u16-2': Uint16Tuple<2>;
  readonly 'u16-3': Uint16Tuple<3>;
  readonly 'u16-4': Uint16Tuple<4>;
  readonly 'u16-6': Uint16Tuple<6>;
  readonly 'u16-9': Uint16Tuple<9>;
  readonly 'u16-16': Uint16Tuple<16>;
  readonly 'f32-1': Float32Tuple<1>;
  readonly 'f32-2': Float32Tuple<2>;
  readonly 'f32-3': Float32Tuple<3>;
  readonly 'f32-4': Float32Tuple<4>;
  readonly 'f32-6': Float32Tuple<6>;
  readonly 'f32-9': Float32Tuple<9>;
  readonly 'f32-16': Float32Tuple<16>;
  readonly 'f64-1': Float64Tuple<1>;
  readonly 'f64-2': Float64Tuple<2>;
  readonly 'f64-3': Float64Tuple<3>;
  readonly 'f64-4': Float64Tuple<4>;
  readonly 'f64-6': Float64Tuple<6>;
  readonly 'f64-9': Float64Tuple<9>;
  readonly 'f64-16': Float64Tuple<16>;
}
