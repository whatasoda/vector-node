import { ARRAY_TYPE_MAP, DIMENSIONS } from '../vector';

declare global {
  // interfaces to be hydrated by code generation and related types
  interface VectorMapFromGeneration {}

  type OneOfVectorType = FallthroughKey<VectorMapFromGeneration>;
  type VectorMap = Fallthrough<VectorMapFromGeneration, Record<string, OneOfVector>>;
}

declare global {
  type Fallthrough<T extends object, U> = {} extends T ? U : T;
  type FallthroughValue<K extends PropertyKey, T extends object, U> = K extends keyof T ? T[K] : U;
  type FallthroughKey<T extends object> = {} extends T ? string : keyof T;

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

  interface AnyVectorCreator extends VectorCreator<OneOfVector> {}
  interface VectorCreator<V extends OneOfVector> extends VectorBase {
    (length?: number): V;
  }

  type OneOfVector = Vector<OneOfArray>;
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

  interface LifetimeApplicationFunc<T extends OneOfVector['value']> {
    (constructor: OneOfArrayConstructor, dimension: number, length?: number): T;
  }
  interface LifetimeApplicationMap {
    moment: LifetimeApplicationFunc<Moment<any>['value']>;
    sequence: LifetimeApplicationFunc<Sequence<any>['value']>;
  }
}
