import { OneOfVectorType, VectorMap, VectorCreators } from './gen/vectorMap';

const Vector = <T extends OneOfVectorType>(type: T): VectorMap[T] => {
  return VectorCreators[type]() as VectorMap[T];
};

export default Vector;
