// apps/v2/src/queries/emojis/useEmojiAutocompleteQuery.ts

/**
 * Query hook for emoji autocomplete
 *
 * @module queries/emojis/useEmojiAutocompleteQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";

import { autocompleteEmojis } from "@/api";
import { queryKeys } from "../keys";

//#endregion

//#region Types

export type IUseEmojiAutocompleteQueryOptions = {
  /** Search term for autocomplete */
  term: string;
  /** Whether the query is enabled */
  enabled?: boolean;
};

//#endregion

//#region Hook

/**
 * Query hook for emoji autocomplete
 *
 * @param options - Query options including search term
 * @returns Query result with matching emojis
 *
 * @example
 * ```typescript
 * const { data } = useEmojiAutocompleteQuery({
 *   term: "thu",
 *   enabled: term.length >= 2
 * });
 * ```
 */
export function useEmojiAutocompleteQuery({
  term,
  enabled = true,
}: IUseEmojiAutocompleteQueryOptions) {
  return useQuery({
    queryKey: queryKeys.emojis.autocomplete(term),
    queryFn: () => autocompleteEmojis(term),
    enabled: enabled && term.length >= 2,
    staleTime: 30_000, // 30 seconds
  });
}

//#endregion
