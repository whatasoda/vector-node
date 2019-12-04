/* DO NOT EDIT MANUALLY. THIS IS GENERATED FILE. */
/* If you want to modify types, modify decls.base.ts first and regenerate this file */
/// <reference types="typed-tuple-type/lib" />
import { ARRAY_TYPE_MAP, DIMENSIONS } from './vector';
export interface VectorMap {
  readonly 'i8-1-moment': Moment<Int8Tuple<1>>;
  readonly 'i8-2-moment': Moment<Int8Tuple<2>>;
  readonly 'i8-3-moment': Moment<Int8Tuple<3>>;
  readonly 'i8-4-moment': Moment<Int8Tuple<4>>;
  readonly 'i8-6-moment': Moment<Int8Tuple<6>>;
  readonly 'i8-9-moment': Moment<Int8Tuple<9>>;
  readonly 'i8-16-moment': Moment<Int8Tuple<16>>;
  readonly 'u8-1-moment': Moment<Uint8Tuple<1>>;
  readonly 'u8-2-moment': Moment<Uint8Tuple<2>>;
  readonly 'u8-3-moment': Moment<Uint8Tuple<3>>;
  readonly 'u8-4-moment': Moment<Uint8Tuple<4>>;
  readonly 'u8-6-moment': Moment<Uint8Tuple<6>>;
  readonly 'u8-9-moment': Moment<Uint8Tuple<9>>;
  readonly 'u8-16-moment': Moment<Uint8Tuple<16>>;
  readonly 'i16-1-moment': Moment<Int16Tuple<1>>;
  readonly 'i16-2-moment': Moment<Int16Tuple<2>>;
  readonly 'i16-3-moment': Moment<Int16Tuple<3>>;
  readonly 'i16-4-moment': Moment<Int16Tuple<4>>;
  readonly 'i16-6-moment': Moment<Int16Tuple<6>>;
  readonly 'i16-9-moment': Moment<Int16Tuple<9>>;
  readonly 'i16-16-moment': Moment<Int16Tuple<16>>;
  readonly 'u16-1-moment': Moment<Uint16Tuple<1>>;
  readonly 'u16-2-moment': Moment<Uint16Tuple<2>>;
  readonly 'u16-3-moment': Moment<Uint16Tuple<3>>;
  readonly 'u16-4-moment': Moment<Uint16Tuple<4>>;
  readonly 'u16-6-moment': Moment<Uint16Tuple<6>>;
  readonly 'u16-9-moment': Moment<Uint16Tuple<9>>;
  readonly 'u16-16-moment': Moment<Uint16Tuple<16>>;
  readonly 'f32-1-moment': Moment<Float32Tuple<1>>;
  readonly 'f32-2-moment': Moment<Float32Tuple<2>>;
  readonly 'f32-3-moment': Moment<Float32Tuple<3>>;
  readonly 'f32-4-moment': Moment<Float32Tuple<4>>;
  readonly 'f32-6-moment': Moment<Float32Tuple<6>>;
  readonly 'f32-9-moment': Moment<Float32Tuple<9>>;
  readonly 'f32-16-moment': Moment<Float32Tuple<16>>;
  readonly 'f64-1-moment': Moment<Float64Tuple<1>>;
  readonly 'f64-2-moment': Moment<Float64Tuple<2>>;
  readonly 'f64-3-moment': Moment<Float64Tuple<3>>;
  readonly 'f64-4-moment': Moment<Float64Tuple<4>>;
  readonly 'f64-6-moment': Moment<Float64Tuple<6>>;
  readonly 'f64-9-moment': Moment<Float64Tuple<9>>;
  readonly 'f64-16-moment': Moment<Float64Tuple<16>>;
}
export type OneOfMomentVectorType =
  | 'i8-1-moment'
  | 'i8-2-moment'
  | 'i8-3-moment'
  | 'i8-4-moment'
  | 'i8-6-moment'
  | 'i8-9-moment'
  | 'i8-16-moment'
  | 'u8-1-moment'
  | 'u8-2-moment'
  | 'u8-3-moment'
  | 'u8-4-moment'
  | 'u8-6-moment'
  | 'u8-9-moment'
  | 'u8-16-moment'
  | 'i16-1-moment'
  | 'i16-2-moment'
  | 'i16-3-moment'
  | 'i16-4-moment'
  | 'i16-6-moment'
  | 'i16-9-moment'
  | 'i16-16-moment'
  | 'u16-1-moment'
  | 'u16-2-moment'
  | 'u16-3-moment'
  | 'u16-4-moment'
  | 'u16-6-moment'
  | 'u16-9-moment'
  | 'u16-16-moment'
  | 'f32-1-moment'
  | 'f32-2-moment'
  | 'f32-3-moment'
  | 'f32-4-moment'
  | 'f32-6-moment'
  | 'f32-9-moment'
  | 'f32-16-moment'
  | 'f64-1-moment'
  | 'f64-2-moment'
  | 'f64-3-moment'
  | 'f64-4-moment'
  | 'f64-6-moment'
  | 'f64-9-moment'
  | 'f64-16-moment';
export type OneOfVectorType = Extract<keyof VectorMap, string>;
export type OneOfVector = VectorMap[Extract<OneOfVectorType, keyof VectorMap>];
// Vector
export type OneOfArrayType = Extract<keyof typeof ARRAY_TYPE_MAP, string>;
export type OneOfDimension = typeof DIMENSIONS[number];
export type OneOfLifetime = Extract<keyof LifetimeApplicationMap, string>;
export interface VectorSchema {
  arrayType: OneOfArrayType;
  dimension: OneOfDimension;
  lifetime: OneOfLifetime;
}
export type OneOfArrayConstructor = typeof ARRAY_TYPE_MAP[OneOfArrayType];
export type OneOfArray = InstanceType<OneOfArrayConstructor>;
export interface AnyVectorCreator extends VectorCreator<AnyVector> {}
export interface VectorCreator<V extends AnyVector> extends VectorBase {
  (): V;
}
export type AnyVector = Vector<OneOfArray>;
export type Vector<A extends OneOfArray> = Moment<A>;
export interface VectorBase {
  type: string;
  schema: Readonly<VectorSchema>;
}
export interface Moment<V extends OneOfArray> extends VectorBase {
  value: V;
}
export interface LifetimeApplicationFunc<T extends AnyVector['value']> {
  (constructor: OneOfArrayConstructor, dimension: number): T;
}
export interface LifetimeApplicationMap {
  moment: LifetimeApplicationFunc<Moment<any>['value']>;
}
// Node
export interface InputsVectorSchema extends Record<string, OneOfVectorType> {}
export type InputsVectorMap<I extends InputsVectorSchema> = {
  [T in keyof I]: VectorMap[I[T]];
};
export type InputsNodeMap<I extends InputsVectorSchema> = {
  [T in keyof I]: VectorNode<any, I[T]>;
};
export interface VectorNodeSchema<I extends InputsVectorSchema, O extends OneOfVectorType> {
  readonly nodeType: string;
  readonly inputs: I;
  readonly output: O;
}
export interface VectorNodeIO<I extends InputsVectorSchema, O extends OneOfVectorType> {
  inputs: Readonly<InputsVectorMap<I>>;
  output: Readonly<VectorMap[O]>;
}
export type AnyVectorNode = VectorNode<any, any>;
export interface VectorNode<I extends InputsVectorSchema, O extends OneOfVectorType> extends VectorNodeSchema<I, O> {
  readonly nodeId: number;
  readonly value: VectorMap[O]['value'];
}
export interface NodeFactoryCreator<I extends InputsVectorSchema, O extends OneOfVectorType, P extends object> {
  (scheduler: InternalScheduler): NodeFactory<I, O, P>;
}
export interface NodeFactory<I extends InputsVectorSchema, O extends OneOfVectorType, P extends object> {
  (inputNodes: InputsNodeMap<I>, props: P): VectorNode<I, O>;
}
export interface NodeFactoryCreatorMap extends Record<string, NodeFactoryCreator<any, any, any>> {}
// Scheduler
export interface InternalScheduler {
  push: <T extends AnyVectorNode>(vector: T, updater: () => void) => T;
}
