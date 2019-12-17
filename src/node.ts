import {
  VectorNodeDescriptor,
  VectorNode,
  VectorSchemaMap,
  EventCreatorRecord,
  VectorComponentFactory,
  VectorComponent,
  NodeConnectionBase,
  NodeConnection,
  VectorComponentLogicCreator,
  AnyVectorComponent,
  LogicUtility,
  VectorNodeIO,
} from './decls';
import { addVectorEventListener } from './event';

export const ComponentToLogicMap = new Map<
  AnyVectorComponent,
  (utils: LogicUtility<any>) => (io: VectorNodeIO<any, any>) => void
>();

let nodeCount = 0;

const defineNode = <
  I extends VectorSchemaMap,
  O extends VectorSchemaMap,
  E extends EventCreatorRecord,
  GP extends object,
  IP extends object
>(
  descriptor: VectorNodeDescriptor<I, O, E>,
  logic: VectorComponentLogicCreator<I, O, E, GP, IP>,
): VectorComponentFactory<I, O, E, GP, IP> => {
  const characterize = (gProps: GP) => (iProps: IP) => {
    const Component: VectorComponent<I, O, E> = <CU extends NodeConnectionBase<I>>(
      connection: CU & NodeConnection<I, CU>,
    ) => {
      const node: VectorNode<I, O, E, NodeConnection<I, CU>> = {
        id: nodeCount++,
        type: Component,
        connection,
        addEventListener: (...args) => addVectorEventListener(node, ...args),
      };
      return node;
    };

    Component.events = descriptor.events;
    Component.inputs = descriptor.inputs;
    Component.outputs = descriptor.outputs;
    ComponentToLogicMap.set(Component, (utility) => logic(utility, gProps, iProps));
    return Component;
  };

  return { ...descriptor, characterize };
};

export default defineNode;
