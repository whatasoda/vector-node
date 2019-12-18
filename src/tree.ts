import {
  VectorNode,
  VectorSchemaMap,
  EventCreatorRecord,
  NodeConnection,
  NodeConnectionBase,
  OneOfVectorType,
  VectorNodeIO,
  OneOfVector,
  VectorsOf,
  VectorComponent,
  VectorEvent,
  AnyVectorNode,
  LogicUtility,
} from './decls';
import { VectorMap } from './gen/vectorMap';
import Vector from './vector';
import defineNode, { ComponentToLogicMap } from './node';
import { EventListenersMap } from './event';

type GeneralVectorNode = VectorNode<
  VectorSchemaMap,
  VectorSchemaMap,
  EventCreatorRecord,
  object,
  object,
  NodeConnection<VectorSchemaMap, NodeConnectionBase<VectorSchemaMap>>
>;

type GeneralVectorInstance = VectorInstance<OneOfVectorType>;
interface VectorInstance<T extends OneOfVectorType> {
  id: number;
  nodeId: number;
  name: string;
  type: T;
  vector: VectorMap[T];
}
interface VectorConnection {
  source: number;
  targets: number[];
}

interface NodeInstance {
  node: GeneralVectorNode;
  Component: VectorComponent<VectorSchemaMap, VectorSchemaMap, EventCreatorRecord, object, object>;
  logic: (io: VectorNodeIO<VectorSchemaMap, VectorSchemaMap>) => void;
  io: VectorNodeIO<VectorSchemaMap, VectorSchemaMap>;
  inputs: Record<string, GeneralVectorInstance>;
  outputs: Record<string, GeneralVectorInstance>;
}

const CURRENT_UPDATE_NODE_INSTANCE = { current: null as null | NodeInstance };
const CURRENT_INITIALIZE_NODE_INSTANCE = { current: null as null | GeneralVectorNode };

const createTree = <O extends VectorSchemaMap>(schema: O) => {
  const leaves: Record<number, GeneralVectorNode> = Object.create(null);
  const vectorInstances: Record<number, GeneralVectorInstance> = Object.create(null);
  const nodeInstances: Record<number, NodeInstance> = Object.create(null);
  const VectorConnections: Record<number, VectorConnection> = Object.create(null);
  let maxId = 0;

  const constructTree = (() => {
    const queue: GeneralVectorNode[] = [];
    return (node: GeneralVectorNode) => {
      if (node.id in nodeInstances) return;

      const stage: Record<number, GeneralVectorNode> = Object.create(null);
      stage[node.id] = node;
      for (let i = node.id; i >= 0; i--) {
        const curr = stage[i];
        if (!curr) continue;
        Object.values(curr.connections).forEach(([n]) => {
          if (n.id in nodeInstances) return;
          stage[n.id] = n;
        });
        queue.push(curr);
      }

      queue.reverse().forEach((curr) => {
        const instance = createVectorInstance(curr);
        Object.entries(curr.connections).forEach(([input, [sourceNode, output]]) => {
          const { id: source } = nodeInstances[sourceNode.id].outputs[output];
          const connection =
            source in VectorConnections
              ? VectorConnections[source]
              : (VectorConnections[source] = { source: source, targets: [] });
          const { id: target } = instance.inputs[input];
          if (connection.targets.includes(target)) return;
          connection.targets.push(target);
          VectorConnections[target] = connection;
        });
      });
      queue.length = 0;
    };
  })();

  const createVectors = (() => {
    let vectorCount = 0;
    return (nodeId: number, schema: VectorSchemaMap) => {
      return Object.entries(schema).reduce<{
        containers: Record<string, GeneralVectorInstance>;
        vectors: Record<string, OneOfVector>;
      }>(
        (acc, [name, type]) => {
          const id = vectorCount++;
          const vector = Vector(type);
          acc.containers[name] = vectorInstances[id] = { id, nodeId, type, name, vector };
          acc.vectors[name] = vector;
          return acc;
        },
        { containers: {}, vectors: {} },
      );
    };
  })();

  const cleanupCallbacks: Record<number, () => void> = Object.create(null);
  const createVectorInstance = (node: GeneralVectorNode): NodeInstance => {
    const { id: nodeId, type, attributes } = node;
    const { containers: inputs, vectors: i } = createVectors(nodeId, type.inputs);
    const { containers: outputs, vectors: o } = createVectors(nodeId, type.outputs);
    const io = { i, o };

    const initializer = ComponentToLogicMap.get(type);
    if (!initializer) throw new Error('No logic initializer found');

    const prev = CURRENT_INITIALIZE_NODE_INSTANCE.current;
    CURRENT_INITIALIZE_NODE_INSTANCE.current = node;
    const logic = initializer(utility, attributes);
    CURRENT_INITIALIZE_NODE_INSTANCE.current = prev;

    return (nodeInstances[nodeId] = { node, logic, inputs, outputs, io, Component: type });
  };

  const eventQueue: [NodeInstance, VectorEvent<string, any>][] = [];
  const utility = ((): LogicUtility<Record<string, any>> => {
    const dispatch = (type: string, ...args: any[]) => {
      const { current } = CURRENT_UPDATE_NODE_INSTANCE;
      if (!current) throw new Error('"LogicUtility.dispatch" cannot be called outside of updating part');

      const value = current.Component.events[type](...args);
      eventQueue.push([current, { type, value }]);
    };

    const cleanup = (callback: () => void) => {
      const { current } = CURRENT_INITIALIZE_NODE_INSTANCE;
      if (!current) throw new Error('"LogicUtility.cleanup" cannot be called outside of initializing part');

      const nodeId = current.id;
      if (cleanupCallbacks[nodeId]) throw new Error('"LogicUtility.cleanup" cannot be called multiple times');
      cleanupCallbacks[nodeId] = callback;
    };

    return { dispatch, cleanup };
  })();

  const updateInstance = (instance: NodeInstance) => {
    const { outputs, io, logic } = instance;
    const prev = CURRENT_UPDATE_NODE_INSTANCE.current;
    CURRENT_UPDATE_NODE_INSTANCE.current = instance;
    logic(io);
    CURRENT_UPDATE_NODE_INSTANCE.current = prev;
    Object.values(outputs).forEach(({ id, vector }) => {
      const connection = VectorConnections[id];
      if (!connection) return;
      connection.targets.forEach((target) => {
        vectorInstances[target].vector.set(vector);
      });
    });
  };

  const updateAllInstances = () => {
    for (let i = 0; i <= maxId; i++) {
      if (nodeInstances[i]) updateInstance(nodeInstances[i]);
    }
    eventQueue.forEach(([target, event]) => {
      const list = EventListenersMap[target.node.id]?.[event.type];
      list.forEach((handler) => handler(event, target.node));
    });
    eventQueue.length = 0;
  };

  const updateMaxId = () => {
    maxId = Math.max(...Object.keys(leaves).map(Number));
  };

  const listen = (node: AnyVectorNode) => {
    if (node.id in leaves) return;
    leaves[node.id] = node;
    constructTree(node);
    updateMaxId();
  };

  const unlisten = (node: AnyVectorNode) => {
    if (!(node.id in leaves)) return;
    delete leaves[node.id];
    unmount(node);
    updateMaxId();
  };

  const unmount = (() => {
    const queue: number[] = [];
    const cleanQueue: (() => void)[] = [];
    return (node: GeneralVectorNode) => {
      queue.push(node.id);
      while (queue.length) {
        const curr = queue.shift()!;
        const instance = nodeInstances[curr];

        const outputs = Object.values(instance.outputs);
        const shouldDelete = outputs.every(({ id }) => {
          const connection = VectorConnections[id];
          return !connection || !connection.targets.length;
        });

        if (shouldDelete) {
          if (cleanupCallbacks[curr]) {
            cleanQueue.push(cleanupCallbacks[curr]);
            delete nodeInstances[curr];
          }
          delete cleanupCallbacks[curr];
          outputs.forEach(({ id }) => {
            delete VectorConnections[id];
            delete vectorInstances[id];
          });
          Object.values(instance.inputs).forEach(({ id }) => {
            const { targets, source } = VectorConnections[id];
            targets.splice(targets.indexOf(id), 1);
            delete VectorConnections[id];
            delete vectorInstances[id];
            const next = vectorInstances[source].nodeId;
            if (!queue.includes(next)) queue.push(next);
          });
        }
      }
      queue.length = 0;
      cleanQueue.forEach((callback) => callback());
    };
  })();

  const RootComponent = defineNode({ inputs: {}, events: {}, outputs: schema }, () => () => {})({});
  const rootNode = RootComponent({}, {});
  const rootInstance = createVectorInstance(rootNode);

  const update = (callback: (o: Readonly<VectorsOf<O>>) => void) => {
    callback(rootInstance.io.o as Readonly<VectorsOf<O>>);
    updateAllInstances();
  };
  return { rootNode, listen, update, unlisten };
};

export default createTree;
