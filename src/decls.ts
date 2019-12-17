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
  GP extends object,
  IP extends object
> extends VectorNodeDescriptor<I, O, E> {
  characterize: (gProps: GP) => (iProps: IP) => VectorComponent<I, O, E>;
}

export type AnyVectorComponent = VectorComponent<any, any, any>;
export interface VectorComponent<I extends VectorSchemaMap, O extends VectorSchemaMap, E extends EventCreatorRecord>
  extends VectorNodeDescriptor<I, O, E> {
  <CU extends NodeConnectionBase<I>>(connection: CU & NodeConnection<I, CU>): VectorNode<
    I,
    O,
    E,
    NodeConnection<I, CU>
  >;
}

export type NodeConnectionBase<I extends VectorSchemaMap> = {
  [K in keyof I]: [AnyVectorNode, any];
};
export type NodeConnection<I extends VectorSchemaMap, U extends NodeConnectionBase<I>> = {
  [K in keyof I]: [U[K][0], AcceptableKeysOf<U[K][0]['type']['outputs'], I[K]>];
};

export type NodeConnectionSchemaOf<I extends VectorSchemaMap, P extends VectorNodeMap> = {
  [K in keyof I]: {
    [L in keyof P]: [L, AcceptableKeysOf<P[L]['type']['outputs'], I[K]>];
  }[keyof P];
};
export type AcceptableKeysOf<T extends VectorSchemaMap, U extends OneOfVectorType> = {
  [K in keyof T]: T[K] extends AcceptableVectorTypeMap[U] ? K : never;
}[keyof T];

export type AnyVectorNode = VectorNode<any, any, any, any>;
export interface VectorNodeMap extends Record<string, AnyVectorNode> {}
export interface VectorNode<
  I extends VectorSchemaMap,
  O extends VectorSchemaMap,
  E extends EventCreatorRecord,
  C extends NodeConnection<I, NodeConnectionBase<I>>
> {
  readonly id: number;
  readonly type: VectorComponent<I, O, E>;
  readonly connection: C;
  readonly addEventListener: <T extends Extract<keyof E, string>>(
    type: T,
    callback: (event: VectorEvent<T, ReturnType<E[T]>>, target: this) => void,
  ) => void;
}

export interface VectorComponentLogicCreator<
  I extends VectorSchemaMap,
  O extends VectorSchemaMap,
  E extends EventCreatorRecord,
  GP extends object,
  IP extends object
> {
  (utility: LogicUtility<E>, gProps: GP, iProps: IP): (io: VectorNodeIO<I, O>) => void;
}

export interface LogicUtility<E extends EventCreatorRecord> {
  dispatch: <T extends keyof E>(type: T, ...args: Parameters<E[T]>) => ReturnType<E[T]>;
  cleanup: (callback: () => void) => void;
}
