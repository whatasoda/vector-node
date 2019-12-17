import ArrayCreators, { VectorSchema } from './typedArray';

export const checkConnectabilityBySchema = (to: VectorSchema, from: VectorSchema) => {
  return to.dimension <= from.dimension;
};

export const checkConnectabilityByType = (to: string, from: string) => {
  return checkConnectabilityBySchema(ArrayCreators[to].schema, ArrayCreators[from].schema);
};
