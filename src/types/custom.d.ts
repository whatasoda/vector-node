import { ARRAY_TYPE_MAP, DIMENSIONS } from '../vector';

declare global {
  // interfaces to be hydrated by code generation and related types
  interface VectorMapFromGeneration {}

  type OneOfVectorType = FallthroughKey<VectorMapFromGeneration>;
  type VectorMap = Fallthrough<VectorMapFromGeneration, Record<string, AnyVector>>;
  type OneOfVector = VectorMap[Extract<OneOfVectorType, keyof VectorMap>];
}

declare global {
  type Fallthrough<T extends object, U> = {} extends T ? U : T;
  type FallthroughValue<K extends PropertyKey, T extends object, U> = K extends keyof T ? T[K] : U;
  type FallthroughKey<T extends object> = {} extends T ? string : keyof T;

  // Vector
  type OneOfArrayType = keyof typeof ARRAY_TYPE_MAP;
  type OneOfDimension = typeof DIMENSIONS[number];
  type OneOfLifetime = keyof LifetimeApplicationMap;
  interface VectorSchema {
    arrayType: OneOfArrayType;
    dimension: OneOfDimension;
    lifetime: OneOfLifetime;
  }

  type OneOfArrayConstructor = typeof ARRAY_TYPE_MAP[OneOfArrayType];
  type OneOfArray = InstanceType<OneOfArrayConstructor>;

  interface AnyVectorCreator extends VectorCreator<AnyVector> {}
  interface VectorCreator<V extends AnyVector> extends VectorBase {
    (length?: number): V;
  }

  type AnyVector = Vector<OneOfArray>;
  type Vector<A extends OneOfArray> = Moment<A> | Sequence<A>;
  interface VectorBase {
    type: string;
    schema: Readonly<VectorSchema>;
  }
  interface Moment<V extends OneOfArray> extends VectorBase {
    value: V;
  }
  interface Sequence<V extends OneOfArray> extends VectorBase {
    // TODO: implement sequence
    value: V;
  }

  interface LifetimeApplicationFunc<T extends AnyVector['value']> {
    (constructor: OneOfArrayConstructor, dimension: number, length?: number): T;
  }
  interface LifetimeApplicationMap {
    moment: LifetimeApplicationFunc<Moment<any>['value']>;
    sequence: LifetimeApplicationFunc<Sequence<any>['value']>;
  }

  // Node
  interface InputsVectorSchema extends Record<string, OneOfVectorType> {}
  type InputsVectorMap<I extends InputsVectorSchema> = {
    [T in keyof I]: VectorMap[I[T]];
  };
  type InputsNodeMap<I extends InputsVectorSchema> = {
    [T in keyof I]: VectorNode<any, I[T]>;
  };

  interface VectorNodeSchema<I extends InputsVectorSchema, O extends OneOfVectorType> {
    readonly nodeType: string;
    readonly inputs: I;
    readonly output: O;
  }

  interface VectorNodeIO<I extends InputsVectorSchema, O extends OneOfVectorType> {
    inputs: Readonly<InputsVectorMap<I>>;
    output: Readonly<VectorMap[O]>;
  }

  type AnyVectorNode = VectorNode<any, any>;
  interface VectorNode<I extends InputsVectorSchema, O extends OneOfVectorType> extends VectorNodeSchema<I, O> {
    readonly nodeId: number;
    readonly update: () => Promise<void>;
  }

  interface NodeFactoryCreator<I extends InputsVectorSchema, O extends OneOfVectorType, P extends object> {
    (scheduler: InternalScheduler): NodeFactory<I, O, P>;
  }
  interface NodeFactory<I extends InputsVectorSchema, O extends OneOfVectorType, P extends object> {
    (inputNodes: InputsNodeMap<I>, props: P): VectorNode<I, O>;
  }
  interface NodeFactoryCreatorMap extends Record<string, NodeFactoryCreator<any, any, any>> {}

  // Scheduler
  interface InternalScheduler {
    push: <T extends AnyVectorNode>(vector: T) => T;
    updateIfPossible: (nodeId: number, update: () => Promise<void>) => Promise<boolean>;
  }
}
