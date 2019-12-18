export * from './gen/vectorMap';
import { VectorMap, AcceptableVectorTypeMap } from './gen/vectorMap';
import { OneOfArray } from './typedArray';

export type Vector<A extends OneOfArray> = A;
export type AnyVector = Vector<OneOfArray>;

export type OneOfVectorType = Extract<keyof VectorMap, string>;
export type OneOfVector = VectorMap[OneOfVectorType];

export interface VectorSchemaMap extends Record<string, OneOfVectorType> {}
// Node
export type VectorsOf<I extends VectorSchemaMap> = {
  [T in keyof I]: VectorMap[I[T]];
};

export interface VectorEvent<T extends string, V> {
  type: T;
  value: V;
}
export interface EventCreatorRecord extends Record<string, (...args: any[]) => any> {}

export interface VectorNodeDescriptor<
  I extends VectorSchemaMap,
  O extends VectorSchemaMap,
  E extends EventCreatorRecord
> {
  inputs: I;
  outputs: O;
  events: E;
}

export interface VectorNodeIO<I extends VectorSchemaMap, O extends VectorSchemaMap> {
  i: Readonly<VectorsOf<I>>;
  o: Readonly<VectorsOf<O>>;
}

export interface VectorComponentFactory<
  I extends VectorSchemaMap,
  O extends VectorSchemaMap,
  E extends EventCreatorRecord,
  U extends object,
  A extends object
> extends VectorNodeDescriptor<I, O, E> {
  (uniforms: U): VectorComponent<I, O, E, U, A>;
}

export type AnyVectorComponent = VectorComponent<any, any, any, any, any>;
export interface VectorComponent<
  I extends VectorSchemaMap,
  O extends VectorSchemaMap,
  E extends EventCreatorRecord,
  U extends object,
  A extends object
> extends VectorNodeDescriptor<I, O, E> {
  <CB extends NodeConnectionBase<I>>(attributes: A, connections: CB & NodeConnection<I, CB>): VectorNode<
    I,
    O,
    E,
    U,
    A,
    NodeConnection<I, CB>
  >;
  uniforms: Readonly<U>;
}

export type NodeConnectionBase<I extends VectorSchemaMap> = {
  [K in keyof I]: [AnyVectorNode, any];
};
export type NodeConnection<I extends VectorSchemaMap, U extends NodeConnectionBase<I>> = {
  [K in keyof I]: [U[K][0], AcceptableKeysOf<U[K][0]['type']['outputs'], I[K]>];
};

export type AcceptableKeysOf<T extends VectorSchemaMap, U extends OneOfVectorType> = {
  [K in keyof T]: T[K] extends AcceptableVectorTypeMap[U] ? K : never;
}[keyof T];

export type AnyVectorNode = VectorNode<any, any, any, any, any, any>;
export interface VectorNodeMap extends Record<string, AnyVectorNode> {}
export interface VectorNode<
  I extends VectorSchemaMap,
  O extends VectorSchemaMap,
  E extends EventCreatorRecord,
  U extends object,
  A extends object,
  C extends NodeConnection<I, NodeConnectionBase<I>>
> {
  readonly id: number;
  readonly type: VectorComponent<I, O, E, U, A>;
  readonly attributes: Readonly<A>;
  readonly connections: C;
  readonly addEventListener: <T extends Extract<keyof E, string>>(
    type: T,
    callback: (event: VectorEvent<T, ReturnType<E[T]>>, target: this) => void,
  ) => void;
}

export interface VectorComponentLogicCreator<
  I extends VectorSchemaMap,
  O extends VectorSchemaMap,
  E extends EventCreatorRecord,
  U extends object,
  A extends object
> {
  (utility: LogicUtility<E>, uniforms: U, attributes: A): (io: VectorNodeIO<I, O>) => void;
}

export interface LogicUtility<E extends EventCreatorRecord> {
  dispatch: <T extends keyof E>(type: T, ...args: Parameters<E[T]>) => ReturnType<E[T]>;
  cleanup: (callback: () => void) => void;
}
