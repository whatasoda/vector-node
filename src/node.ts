import Vector from './vector';

const OutputVectorContainer: Record<number, OneOfVector> = {};
let nodeCount = 0;

const defineNode = <I extends InputsVectorSchema, O extends OneOfVectorType, P extends object>(
  schema: VectorNodeSchema<I, O>,
  logic: (props: P) => (io: VectorNodeIO<I, O>) => Promise<void>,
): NodeFactoryCreator<I, O, P> => {
  const InputSchema = Object.entries(schema.inputs) as [string, OneOfVectorType][];

  const createNodeFactory = ({ push, updateIfPossible }: InternalScheduler) => {
    const factory = (inputNodes: InputsNodeMap<I>, props: P): VectorNode<I, O> => {
      const nodeId = ++nodeCount;

      let isValid = false;
      InputSchema.forEach(([name, type]) => {
        const inputType = inputNodes[name]?.output;
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
      const updater = async () => {
        InputSchema.forEach(([name]) => {
          const from = OutputVectorContainer[inputNodes[name].nodeId];
          if (!from) throw new Error('TODO: error message');
          /**
           * we can skip cheking the existence of the `to`
           * because it is already ensured by `isValid`
           */
          const to = inputs[name].value;
          to.set(from.value);
        });
        await evaluator({ inputs, output });
      };

      const update = async () => {
        const isUpdated = await updateIfPossible(nodeId, updater);
        if (!isUpdated) {
          // eslint-disable-next-line no-console
          console.warn('TODO: warning message');
        }
      };

      return push({ nodeId, ...schema, update });
    };

    return factory;
  };

  return createNodeFactory;
};

export default defineNode;
