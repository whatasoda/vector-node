export const ARRAY_TYPE_MAP = {
  i8: Int8Array,
  u8: Uint8Array,
  i16: Int16Array,
  u16: Uint16Array,
  f32: Float32Array,
  f64: Float64Array,
};
export const DIMENSIONS = [1, 2, 3, 4, 6, 9, 16] as const;
export const LIFETIME_MAP: LifetimeApplicationMap = {
  moment: (c, d) => new c(d),
  // TODO: implement sequence
  sequence: (c, d, _ = 1) => new c(d),
};

const arrayTypeEntries = Object.entries(ARRAY_TYPE_MAP) as [OneOfArrayType, OneOfArrayConstructor][];
const lifetimeEntries = Object.entries(LIFETIME_MAP) as [OneOfLifetime, LifetimeApplicationFunc<AnyVector['value']>][];
export const VectorCreators = arrayTypeEntries.reduce<Record<string, AnyVectorCreator>>(
  (acc, [arrayType, constructor]) => {
    DIMENSIONS.forEach((dimension) => {
      lifetimeEntries.forEach(([lifetime, fn]) => {
        const type = `${arrayType}-${dimension}-${lifetime}`;
        const schema = { arrayType, dimension, lifetime };
        const creator: AnyVectorCreator = (length) => {
          const value = fn(constructor, dimension, length);
          return { value, type, schema };
        };
        creator.type = type;
        creator.schema = schema;
        acc[creator.type] = creator;
      });
    });
    return acc;
  },
  {},
);

const Vector = <T extends OneOfVectorType>(type: T, length?: number): VectorMap[T] => {
  return VectorCreators[type](length) as VectorMap[T];
};

export default Vector;
