// apps/v2/src/types/utility.ts

/**
 * Utility type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/utilities.ts
 */

//#region Entity Constraint

/**
 * Base constraint for entities with an ID field
 */
export type IEntity = { id: string };

//#endregion

//#region Relation Types

/**
 * Maps entity IDs to values of type T
 * Example: { [userId]: UserPreferences }
 */
export type IRelationOneToOne<E extends IEntity, T> = {
  [x in E["id"]]: T;
};

/**
 * Maps entity IDs to arrays of related entity IDs
 * Example: { [teamId]: [userId1, userId2, ...] }
 */
export type IRelationOneToMany<E1 extends IEntity, E2 extends IEntity> = {
  [x in E1["id"]]: E2["id"][];
};

/**
 * Maps entity IDs to unique sets of related entity IDs
 * Example: { [channelId]: Set<userId> }
 */
export type IRelationOneToManyUnique<E1 extends IEntity, E2 extends IEntity> = {
  [x in E1["id"]]: Set<E2["id"]>;
};

//#endregion

//#region ID Mapped Collections

/**
 * Maps entity IDs to entities of the same type
 * Shorthand for IRelationOneToOne<E, E>
 */
export type IIDMappedObjects<E extends IEntity> = IRelationOneToOne<E, E>;

/**
 * Collection with data map, order array, and optional errors/warnings
 */
export type IIDMappedCollection<T extends IEntity> = {
  data: IIDMappedObjects<T>;
  order: T["id"][];
  errors?: IRelationOneToOne<T, Error>;
  warnings?: IRelationOneToOne<T, { [Key in keyof T]?: string }>;
};

//#endregion

//#region Deep Partial

/**
 * Recursively makes all properties optional
 * Preserves Set and Map types without recursion
 */
export type IDeepPartial<T> = {
  [K in keyof T]?: T[K] extends Set<unknown>
    ? T[K]
    : T[K] extends Map<unknown, unknown>
      ? T[K]
      : T[K] extends object
        ? IDeepPartial<T[K]>
        : T[K] extends object | undefined
          ? IDeepPartial<T[K]>
          : T[K];
};

//#endregion

//#region Type-Level Utilities

/**
 * Extracts the value type from an object type
 */
export type IValueOf<T> = T[keyof T];

/**
 * Requires exactly one of the specified keys
 * Based on https://stackoverflow.com/a/49725198
 */
export type IRequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

/**
 * Gets the intersection of two types (only shared properties)
 */
export type IIntersection<T1, T2> = Omit<
  Omit<T1 & T2, keyof Omit<T1, keyof T2>>,
  keyof Omit<T2, keyof T1>
>;

/**
 * Helper for IEither - makes T's props required and U's props never
 */
type IOnly<T, U> = { [P in keyof T]: T[P] } & { [P in keyof U]?: never };

/**
 * Exclusive OR - either T or U but not both
 * Based on https://stackoverflow.com/a/66605669
 */
export type IEither<T, U> = IOnly<T, U> | IOnly<U, T>;

/**
 * Makes all properties partial except the specified keys
 */
export type IPartialExcept<
  T extends Record<string, unknown>,
  TKeysNotPartial extends keyof T,
> = Partial<T> & Pick<T, TKeysNotPartial>;

//#endregion

//#region Type Guards

/**
 * Type guard to check if value is an array where all elements pass the check
 */
export function isArrayOf<T>(
  v: unknown,
  check: (e: unknown) => boolean,
): v is T[] {
  if (!Array.isArray(v)) {
    return false;
  }
  return v.every(check);
}

/**
 * Type guard to check if value is a string array
 */
export function isStringArray(v: unknown): v is string[] {
  return isArrayOf(v, (e) => typeof e === "string");
}

/**
 * Type guard to check if value is a record with string keys
 */
export function isRecordOf<T>(
  v: unknown,
  check: (e: unknown) => boolean,
): v is Record<string, T> {
  if (typeof v !== "object" || !v) {
    return false;
  }
  if (!Object.keys(v).every((k) => typeof k === "string")) {
    return false;
  }
  if (!Object.values(v).every(check)) {
    return false;
  }
  return true;
}

//#endregion

//#region Collection Helpers

/**
 * Creates an IIDMappedCollection from an array of entities
 */
export const collectionFromArray = <T extends IEntity>(
  arr: T[] = [],
): IIDMappedCollection<T> => {
  return arr.reduce(
    (current, item) => {
      current.data = { ...current.data, [item.id]: item };
      current.order.push(item.id);
      return current;
    },
    { data: {} as IIDMappedObjects<T>, order: [] as string[] },
  );
};

/**
 * Converts an IIDMappedCollection back to an array, preserving order
 */
export const collectionToArray = <T extends IEntity>({
  data,
  order,
}: IIDMappedCollection<T>): T[] => {
  return order.map((id) => data[id]);
};

/**
 * Replaces items in a collection (updates data, keeps order)
 */
export const collectionReplaceItem = <T extends IEntity>(
  collection: IIDMappedCollection<T>,
  ...items: T[]
) => {
  return {
    ...collection,
    data: idMappedObjectsFromArr(items, collection.data),
  };
};

/**
 * Adds items to a collection (updates data and appends to order)
 */
export const collectionAddItem = <T extends IEntity>(
  collection: IIDMappedCollection<T>,
  ...items: T[]
) => {
  return {
    ...collectionReplaceItem(collection, ...items),
    order: [...collection.order, ...items.map(({ id }) => id)],
  };
};

/**
 * Removes an item from a collection
 */
export const collectionRemoveItem = <T extends IEntity>(
  collection: IIDMappedCollection<T>,
  item: T,
) => {
  const data = { ...collection.data };
  Reflect.deleteProperty(data, item.id);
  const order = collection.order.filter((id) => id !== item.id);
  return { ...collection, data, order };
};

/**
 * Creates an IIDMappedObjects from an array, optionally merging with existing
 */
export const idMappedObjectsFromArr = <T extends IEntity>(
  items: T[],
  current?: IIDMappedObjects<T>,
) => {
  return items.reduce((r, item) => ({ ...r, [item.id]: item }), {
    ...current,
  } as IIDMappedObjects<T>);
};

//#endregion
