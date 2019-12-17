import { EventCreatorRecord, VectorEvent, VectorNode } from './decls';

export const EventListenersMap: Record<number, HandlerMap> = Object.create(null);

type HandlerMap = Record<string, VectorEventHandler<any, any, any>[]>;
type VectorEventHandler<
  N extends VectorNode<any, any, E, any>,
  E extends EventCreatorRecord,
  T extends Extract<keyof E, string>
> = (event: VectorEvent<T, ReturnType<E[T]>>, target: N) => void;

export const addVectorEventListener = <
  N extends VectorNode<any, any, E, any>,
  E extends EventCreatorRecord,
  T extends Extract<keyof E, string>
>(
  { id }: N,
  type: T,
  callback: VectorEventHandler<N, E, T>,
) => {
  const listeners = EventListenersMap[id] || (EventListenersMap[id] = {});
  const list = (listeners[type] = listeners[type] || []);
  if (list.includes(callback)) return;
  list.push(callback);
};
