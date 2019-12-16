export * from './gen/vectorMap';
import { VectorMap, OneOfVectorType } from './gen/vectorMap';

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
  readonly value: VectorMap[O];
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
