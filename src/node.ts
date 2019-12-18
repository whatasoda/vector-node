import {
  VectorNodeDescriptor,
  VectorNode,
  VectorSchemaMap,
  EventCreatorRecord,
  VectorComponentFactory,
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
  (utility: LogicUtility<any>, iProps: any) => (io: VectorNodeIO<any, any>) => void
>();

let nodeCount = 0;

const defineNode = <
  I extends VectorSchemaMap,
  O extends VectorSchemaMap,
  E extends EventCreatorRecord,
  U extends object,
  A extends object
>(
  { inputs, outputs, events }: VectorNodeDescriptor<I, O, E>,
  logic: VectorComponentLogicCreator<I, O, E, U, A>,
): VectorComponentFactory<I, O, E, U, A> => {
  const characterize = (uniforms: U) => {
    const Component = <CB extends NodeConnectionBase<I>>(attributes: A, connections: CB & NodeConnection<I, CB>) => {
      const node: VectorNode<I, O, E, U, A, NodeConnection<I, CB>> = {
        id: nodeCount++,
        type: Component,
        attributes,
        connections,
        addEventListener: (...args) => addVectorEventListener(node, ...args),
      };
      return node;
    };

    Component.events = events;
    Component.inputs = inputs;
    Component.outputs = outputs;
    Component.uniforms = uniforms;
    ComponentToLogicMap.set(Component, (utility, attributes) => logic(utility, uniforms, attributes));
    return Component;
  };
  characterize.events = events;
  characterize.inputs = inputs;
  characterize.outputs = outputs;

  return characterize;
};

export default defineNode;
