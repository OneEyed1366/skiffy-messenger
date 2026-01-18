// apps/v2/src/services/websocket/operators/debounceAfterN.spec.ts

import { Subject, of, firstValueFrom } from "rxjs";
import { toArray } from "rxjs/operators";
import { debounceAfterN } from "./debounceAfterN";

describe("debounceAfterN", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  //#region immediate emission (first N items)
  describe("immediate emission (first N items)", () => {
    it("emits first N items immediately as single-item arrays", () => {
      const results: number[][] = [];
      const subject = new Subject<number>();

      subject.pipe(debounceAfterN(5, 100)).subscribe((batch) => {
        results.push(batch);
      });

      // Emit 5 items
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      subject.next(5);

      // All 5 should be emitted immediately
      expect(results).toEqual([[1], [2], [3], [4], [5]]);
    });

    it("does not wait for timeout for first N items", () => {
      const results: string[][] = [];
      const subject = new Subject<string>();

      subject.pipe(debounceAfterN(3, 100)).subscribe((batch) => {
        results.push(batch);
      });

      subject.next("a");
      expect(results).toEqual([["a"]]);

      subject.next("b");
      expect(results).toEqual([["a"], ["b"]]);

      subject.next("c");
      expect(results).toEqual([["a"], ["b"], ["c"]]);
    });
  });
  //#endregion

  //#region buffering (after N items)
  describe("buffering (after N items)", () => {
    it("queues items after N and flushes after wait time", () => {
      const results: number[][] = [];
      const subject = new Subject<number>();

      subject.pipe(debounceAfterN(3, 100)).subscribe((batch) => {
        results.push(batch);
      });

      // First 3: immediate
      subject.next(1);
      subject.next(2);
      subject.next(3);
      expect(results).toEqual([[1], [2], [3]]);

      // Next 3: queued
      subject.next(4);
      subject.next(5);
      subject.next(6);
      expect(results).toEqual([[1], [2], [3]]); // Still only first 3

      // After timeout: batch emitted
      jest.advanceTimersByTime(100);
      expect(results).toEqual([[1], [2], [3], [4, 5, 6]]);
    });

    it("resets timer on each new item in queue", () => {
      const results: number[][] = [];
      const subject = new Subject<number>();

      subject.pipe(debounceAfterN(2, 100)).subscribe((batch) => {
        results.push(batch);
      });

      subject.next(1);
      subject.next(2); // Now queuing starts

      subject.next(3);
      jest.advanceTimersByTime(50); // 50ms

      subject.next(4);
      jest.advanceTimersByTime(50); // 50ms more (100ms total from item 3, but timer reset)

      // Should not have flushed yet
      expect(results).toEqual([[1], [2]]);

      jest.advanceTimersByTime(50); // 100ms from last item
      expect(results).toEqual([[1], [2], [3, 4]]);
    });
  });
  //#endregion

  //#region count reset after flush
  describe("count reset after flush", () => {
    it("resets count to 0 after flush, allowing immediate emission again", () => {
      const results: string[][] = [];
      const subject = new Subject<string>();

      subject.pipe(debounceAfterN(2, 100)).subscribe((batch) => {
        results.push(batch);
      });

      // First batch: a, b immediate, c queued
      subject.next("a");
      subject.next("b");
      subject.next("c");

      jest.advanceTimersByTime(100); // Flush
      expect(results).toEqual([["a"], ["b"], ["c"]]);

      // After flush, count reset - d, e should be immediate
      subject.next("d");
      expect(results).toEqual([["a"], ["b"], ["c"], ["d"]]);

      subject.next("e");
      expect(results).toEqual([["a"], ["b"], ["c"], ["d"], ["e"]]);
    });
  });
  //#endregion

  //#region overflow protection
  describe("overflow protection", () => {
    it("clears queue when maxQueueSize exceeded", () => {
      const results: number[][] = [];
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      const subject = new Subject<number>();

      subject.pipe(debounceAfterN(2, 100, 3)).subscribe((batch) => {
        results.push(batch);
      });

      // First 2: immediate
      subject.next(1);
      subject.next(2);

      // Next 3: fill queue
      subject.next(3);
      subject.next(4);
      subject.next(5);

      // This triggers overflow (queue had 3, adding 4th > maxQueueSize)
      subject.next(6);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Queue overflow"),
        3,
      );

      // After timeout: queue was cleared, so nothing batched
      jest.advanceTimersByTime(100);
      expect(results).toEqual([[1], [2]]);

      consoleSpy.mockRestore();
    });
  });
  //#endregion

  //#region completion handling
  describe("completion handling", () => {
    it("flushes remaining queue on complete", async () => {
      const result = await firstValueFrom(
        of(1, 2, 3, 4, 5).pipe(debounceAfterN(3, 100), toArray()),
      );

      // First 3 immediate, last 2 flushed on complete
      expect(result).toEqual([[1], [2], [3], [4, 5]]);
    });

    it("completes without emission if queue empty", async () => {
      const result = await firstValueFrom(
        of(1, 2).pipe(debounceAfterN(5, 100), toArray()),
      );

      expect(result).toEqual([[1], [2]]);
    });
  });
  //#endregion

  //#region error handling
  describe("error handling", () => {
    it("clears timer and propagates error", () => {
      const results: number[][] = [];
      let receivedError: Error | null = null;
      const subject = new Subject<number>();

      subject.pipe(debounceAfterN(2, 100)).subscribe({
        next: (batch) => results.push(batch),
        error: (err) => {
          receivedError = err;
        },
      });

      subject.next(1);
      subject.next(2);
      subject.next(3); // Queued

      const testError = new Error("Test error");
      subject.error(testError);

      expect(receivedError).toBe(testError);
      expect(results).toEqual([[1], [2]]); // Queued item not flushed on error
    });
  });
  //#endregion

  //#region unsubscription
  describe("unsubscription", () => {
    it("clears timer on unsubscribe", () => {
      const subject = new Subject<number>();
      const subscription = subject
        .pipe(debounceAfterN(2, 100))
        .subscribe(() => {});

      subject.next(1);
      subject.next(2);
      subject.next(3); // Queued, timer started

      subscription.unsubscribe();

      // Should not throw or cause issues
      jest.advanceTimersByTime(100);
    });
  });
  //#endregion
});
