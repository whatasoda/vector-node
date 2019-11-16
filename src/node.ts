import Vector from './vector';

const OutputVectorContainer: Record<number, OneOfVector> = {};
let nodeCount = 0;

const defineNode = <I extends InputsVectorSchema, O extends OneOfVectorType, P extends object>(
  schema: VectorNodeSchema<I, O>,
  logic: (props: P) => (io: VectorNodeIO<I, O>) => Promise<void>,
) => {
  const InputSchema = Object.entries(schema.inputs) as [string, OneOfVectorType][];

  const create = (inputNodes: InputsNodeMap<I>, props: P): VectorNode<I, O> => {
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

    // TODO: use package local container like output
    const inputs = InputSchema.reduce<Record<string, OneOfVector>>((acc, [name, type]) => {
      acc[name] = Vector(type);
      return acc;
    }, {}) as InputsVectorMap<I>;

    const exec = logic(props);
    const update = async (/* TODO: scheduler implementation */) => {
      InputSchema.forEach(([name]) => {
        const from = OutputVectorContainer[inputNodes[name].nodeId];
        if (!from) throw new Error('TODO: error message');
        // we can skip cheking the existence of the `to` because it is already ensured by `isValid`
        const to = inputs[name].value;
        to.set(from.value);
      });
      await exec({ inputs, output });
    };

    return { ...schema, nodeId, update };
  };

  return { create };
};

export default defineNode;
