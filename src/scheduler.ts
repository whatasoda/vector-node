import Vector from './vector';

const createFrameUtil = (frameMap: Record<number, number>) => {
  let frame = 0;
  const increment = () => ++frame;

  const updateIfPossible: InternalScheduler['updateIfPossible'] = async (
    nodeId: number,
    update: () => Promise<void>,
  ): Promise<boolean> => {
    const curr = frameMap[nodeId];
    if (curr < frame) {
      await update();
      frameMap[nodeId]++;
      return true;
    }
    return false;
  };

  return { increment, updateIfPossible };
};

const Scheduler = <I extends InputsVectorSchema>(schema: I) => {
  const InputSchema = Object.entries(schema) as [string, OneOfVectorType][];
  /**
   * We can use array for this because the implementaion of VectorNode is
   * that child node requires all parent nodes to be initialized.
   * It means every parent node must be pushed to this array before its child nodes.
   * So we don't need to resolve structure or dependency tree of node connection.
   */
  const NodeQueue: AnyVectorNode[] = [];
  const FrameMap: Record<number, number> = {};
  const { increment, updateIfPossible } = createFrameUtil(FrameMap);

  const inputs = InputSchema.reduce<Record<string, OneOfVector>>((acc, [name, type]) => {
    acc[name] = Vector(type);
    return acc;
  }, {}) as InputsVectorMap<I>;

  const push = <T extends AnyVectorNode>(vector: T) => {
    if (!NodeQueue.includes(vector)) {
      NodeQueue.push(vector);
      FrameMap[vector.nodeId] = -1;
    }
    return vector;
  };

  const internalScheduler: InternalScheduler = { push, updateIfPossible };
  type BindedNodeFactoryCreatorMap<T extends NodeFactoryCreatorMap> = {
    [K in keyof T]: ReturnType<T[K]>;
  };

  const update = async (updater: (input: InputsVectorMap<I>) => Promise<void>) => {
    updater(inputs);
    increment();
    await NodeQueue.reduce<Promise<void>>(async (prev, { update }) => {
      await prev;
      await update();
    }, Promise.resolve());
  };

  const construct = <T extends NodeFactoryCreatorMap>(
    definedNodeMap: T,
    cunstructor: (factories: BindedNodeFactoryCreatorMap<T>) => void,
  ) => {
    const factories = Object.entries(definedNodeMap).reduce<Record<string, NodeFactory<any, any, any>>>(
      (acc, [name, create]) => {
        acc[name] = create(internalScheduler);
        return acc;
      },
      {},
    ) as BindedNodeFactoryCreatorMap<T>;
    cunstructor(factories);
    return update;
  };

  return construct;
};

export default Scheduler;
