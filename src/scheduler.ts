import { createInputNode } from './node';
import {
  InputsVectorSchema,
  OneOfVectorType,
  AnyVectorNode,
  OneOfVector,
  InputsNodeMap,
  InputsVectorMap,
  InternalScheduler,
  NodeFactoryCreatorMap,
  NodeFactory,
} from 'decls';

const createFrameUtil = (frameMap: Record<number, number>, updaterMap: Record<number, () => void>) => {
  let frame = 0;
  const increment = () => ++frame;

  const updateIfPossible = (nodeId: number): boolean => {
    const curr = frameMap[nodeId];
    if (curr < frame) {
      updaterMap[nodeId]?.();
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
  const UpdaterMap: Record<number, () => void> = {};
  const { increment, updateIfPossible } = createFrameUtil(FrameMap, UpdaterMap);

  const [inputsNode, inputsVector] = InputSchema.reduce<[Record<string, AnyVectorNode>, Record<string, OneOfVector>]>(
    (acc, [name, type]) => {
      const { node, vector } = createInputNode(type);
      acc[0][name] = node;
      acc[1][name] = vector;
      return acc;
    },
    [{}, {}],
  ) as [InputsNodeMap<I>, InputsVectorMap<I>];

  const push = <T extends AnyVectorNode>(vector: T) => {
    if (!NodeQueue.includes(vector)) {
      NodeQueue.push(vector);
      FrameMap[vector.nodeId] = -1;
    }
    return vector;
  };

  const internalScheduler: InternalScheduler = { push };
  type BindedNodeFactoryCreatorMap<T extends NodeFactoryCreatorMap> = {
    [K in keyof T]: ReturnType<T[K]>;
  };

  const construct = <T extends NodeFactoryCreatorMap, U extends object>(
    definedNodeMap: T,
    cunstructor: (factories: BindedNodeFactoryCreatorMap<T>, inputs: InputsNodeMap<I>) => U,
  ) => {
    type TmpBinded = Record<string, NodeFactory<any, any, any>>;
    const factories = Object.entries(definedNodeMap).reduce<TmpBinded>((acc, [name, create]) => {
      acc[name] = create(internalScheduler);
      return acc;
    }, {}) as BindedNodeFactoryCreatorMap<T>;

    const tree = cunstructor(factories, inputsNode);
    return (updater: (input: InputsVectorMap<I>) => void) => {
      updater(inputsVector);
      increment();
      NodeQueue.forEach(({ nodeId }) => updateIfPossible(nodeId));
      return tree as Readonly<U>;
    };
  };

  return construct;
};

export default Scheduler;
