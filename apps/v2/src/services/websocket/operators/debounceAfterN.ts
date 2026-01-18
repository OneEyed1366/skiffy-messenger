// apps/v2/src/services/websocket/operators/debounceAfterN.ts

import { Observable, OperatorFunction } from "rxjs";

//#region debounceAfterN Operator

/**
 * Emits first N items immediately as single-item arrays.
 * After N items, buffers and flushes after `wait` ms of silence.
 * Resets count after each flush (matching vendor behavior).
 *
 * This operator matches vendor debouncePostEvent from:
 * vendor/desktop/webapp/channels/src/actions/websocket_actions.jsx:730-767
 *
 * @param n - Number of items to emit immediately before buffering (vendor: 5)
 * @param wait - Buffer flush delay in ms after silence (vendor: 100)
 * @param maxQueueSize - Max queue size before dropping (vendor: 200)
 * @returns OperatorFunction that emits arrays of T
 *
 * @example
 * ```typescript
 * source$.pipe(
 *   debounceAfterN(5, 100, 200),
 *   mergeMap(batch => of(...batch)),
 * )
 * ```
 */
export function debounceAfterN<T>(
  n: number,
  wait: number,
  maxQueueSize = 200,
): OperatorFunction<T, T[]> {
  return (source$: Observable<T>) =>
    new Observable<T[]>((subscriber) => {
      let count = 0;
      let queue: T[] = [];
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const clearTimer = () => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      const flush = () => {
        timeoutId = null;
        if (queue.length > 0) {
          subscriber.next([...queue]);
          queue = [];
        }
        count = 0; // Reset for next batch (matches vendor)
      };

      const subscription = source$.subscribe({
        next: (value) => {
          clearTimer();

          if (count < n) {
            // First N items: emit immediately as single-item batch
            count++;
            subscriber.next([value]);
            timeoutId = setTimeout(flush, wait);
          } else {
            // After N: queue for batch
            if (queue.length < maxQueueSize) {
              queue.push(value);
            } else {
              // Overflow protection (vendor: "channel broken")
              console.warn(
                "[debounceAfterN] Queue overflow (%d items), dropping queued events",
                maxQueueSize,
              );
              queue = [];
            }
            timeoutId = setTimeout(flush, wait);
          }
        },
        error: (err) => {
          clearTimer();
          subscriber.error(err);
        },
        complete: () => {
          clearTimer();
          // Flush remaining queue on complete
          if (queue.length > 0) {
            subscriber.next(queue);
          }
          subscriber.complete();
        },
      });

      // Cleanup on unsubscribe
      return () => {
        clearTimer();
        subscription.unsubscribe();
      };
    });
}

//#endregion
