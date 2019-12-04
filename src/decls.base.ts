/// <reference types="typed-tuple-type/lib" />

import { ARRAY_TYPE_MAP, DIMENSIONS } from './vector';

export interface VectorMap {
  // interfaces to be hydrated by code generation and related types
  [type: string]: AnyVector;
}
export type OneOfMomentVectorType = string;

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
  // TODO: implement event target feature
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
