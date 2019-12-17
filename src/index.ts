import defineNode from './node';
import createTree from './tree';

const vn = { createTree, defineNode };

export * from './decls';
export { defineNode, createTree };
export default vn;
