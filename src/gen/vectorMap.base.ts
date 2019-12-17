/// <reference types="typed-tuple-type/lib" />

export interface VectorMap {
  // interface to be hydrated by code generation and related types
  [type: string]: import('../typedArray').OneOfArray;
}

export interface AcceptableVectorTypeMap {
  // interface to be hydrated by code generation and related types
  [type: string]: string;
}
