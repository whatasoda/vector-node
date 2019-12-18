/* eslint-disable no-console */
import vn from '../src';

console.log('start');
const Hoge = vn.defineNode(
  {
    events: {
      hoge: (count: number) => ({ count }),
    },
    inputs: {
      input: 'f32-1',
      input2: 'f32-1',
    },
    outputs: {
      out: 'f32-1',
    },
  },
  ({ cleanup, dispatch }, { threshold }: { threshold: number }, { coef }: { coef: number }) => {
    cleanup(() => console.log(count));
    let count = -1;
    return ({ i: { input }, o: { out } }) => {
      if (input[0] * coef > threshold) {
        dispatch('hoge', ++count);
      }
      out[0] = count * 0.1;
    };
  },
)({ threshold: 0.3 });

const tree = vn.createTree({ scalar: 'f32-1' });
const A = Hoge({ coef: 1 }, { input: [tree.rootNode, 'scalar'], input2: [tree.rootNode, 'scalar'] });
A.addEventListener('hoge', (event) => console.log(`A: ${event.value.count}`));

const B = Hoge({ coef: 1 }, { input: [A, 'out'], input2: [tree.rootNode, 'scalar'] });
B.addEventListener('hoge', (event) => console.log(`B: ${event.value.count}`));

tree.listen(B);

setInterval(() => {
  tree.update(({ scalar: hoge }) => {
    hoge[0] = Math.random();
  });
}, 100);

setTimeout(() => {
  tree.unlisten(B);
}, 3000);
