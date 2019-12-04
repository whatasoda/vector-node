import Vector from './vector';
import {
  OneOfVector,
  InputsVectorSchema,
  OneOfVectorType,
  VectorNodeSchema,
  VectorNodeIO,
  NodeFactoryCreator,
  InternalScheduler,
  InputsNodeMap,
  VectorNode,
  InputsVectorMap,
  VectorMap,
} from 'decls';

const OutputVectorContainer: Record<number, OneOfVector> = {};
let nodeCount = 0;
let inputNodeCount = -1;

const defineNode = <I extends InputsVectorSchema, O extends OneOfVectorType, P extends object>(
  schema: VectorNodeSchema<I, O>,
  logic: (props: P) => (io: VectorNodeIO<I, O>) => void,
): NodeFactoryCreator<I, O, P> => {
  const InputSchema = Object.entries(schema.inputs) as [string, OneOfVectorType][];

  const createNodeFactory = ({ push }: InternalScheduler) => {
    const factory = (inputNodes: InputsNodeMap<I>, props: P): VectorNode<I, O> => {
      const nodeId = ++nodeCount;

      let isValid = true;
      InputSchema.forEach(([name, type]) => {
        const { nodeId, output: inputType } = inputNodes[name] || {};
        if (!OutputVectorContainer[nodeId]) {
          // eslint-disable-next-line no-console
          console.log('TODO: error message');
          isValid = false;
        }
        if (inputType !== type) {
          // eslint-disable-next-line no-console
          console.log('TODO: log error message');
          isValid = false;
        }
      });
      if (!isValid) throw new Error('TODO: error message');

      const output = Vector(schema.output);
      OutputVectorContainer[nodeId] = output;

      // TODO: use package local container like `output`
      const inputs = InputSchema.reduce<Record<string, OneOfVector>>((acc, [name, type]) => {
        acc[name] = Vector(type);
        return acc;
      }, {}) as InputsVectorMap<I>;

      const evaluator = logic(props);
      const io = { inputs, output };
      const updater = () => {
        InputSchema.forEach(([name]) => {
          const from = OutputVectorContainer[inputNodes[name].nodeId];
          const to = inputs[name].value;
          to.set(from.value);
        });
        evaluator(io);
      };

      return push({ nodeId, value: output.value, ...schema }, updater);
    };

    return factory;
  };

  return createNodeFactory;
};

const PSEUDO_INPUTS = Object.create(null);
export const createInputNode = <O extends OneOfVectorType>(
  output: O,
): { node: VectorNode<{}, O>; vector: VectorMap[O] } => {
  const nodeId = inputNodeCount--;
  const vector = Vector(output);
  OutputVectorContainer[nodeId] = vector;
  const node = { nodeId, nodeType: 'PseudoNode', inputs: PSEUDO_INPUTS, output, value: vector.value };

  return { node, vector };
};

export default defineNode;
