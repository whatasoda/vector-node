import { VectorMap, OneOfVectorType } from './decls';
import ArrayCreators from './typedArray';

const Vector = <T extends OneOfVectorType>(type: T): VectorMap[T] => {
  return ArrayCreators[type]() as VectorMap[T];
};

export default Vector;
