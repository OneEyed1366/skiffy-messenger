import { useMemo } from "react";

//#region Types
type ISuffixMap = Record<string, unknown>;

type IPrefixedIds<S extends ISuffixMap> = {
  [K in keyof S]: string;
};
//#endregion Types

//#region Hook
export function usePrefixedIds<S extends ISuffixMap>(
  prefix: string,
  suffixes: S,
): IPrefixedIds<S> {
  return useMemo(() => {
    const result = {} as IPrefixedIds<S>;
    for (const key of Object.keys(suffixes) as (keyof S)[]) {
      result[key] = `${prefix}-${String(key)}`;
    }
    return result;
  }, [prefix, suffixes]);
}
//#endregion Hook

//#region Utility
export function joinIds(...ids: (string | undefined | null)[]): string {
  return ids.filter(Boolean).join(" ");
}
//#endregion Utility

//#region Unique ID Generation
let idCounter = 0;

export function generateUniqueId(prefix: string = "id"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}
//#endregion Unique ID Generation
