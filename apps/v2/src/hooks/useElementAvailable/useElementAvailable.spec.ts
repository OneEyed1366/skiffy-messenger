import { renderHook, act } from "@testing-library/react-native";

import { useElementAvailable } from "./useElementAvailable";

//#region Mock Document
type IGetElementByIdMock = jest.Mock<HTMLElement | null, [string]>;

const mockElements = new Map<string, HTMLElement>();

const mockDocument = {
  getElementById: jest.fn(
    (id: string) => mockElements.get(id) ?? null,
  ) as IGetElementByIdMock,
};

// Set up document mock before any tests run
// @ts-expect-error - mocking document in RN environment
globalThis.document = mockDocument;
//#endregion Mock Document

//#region Test Setup
beforeEach(() => {
  mockElements.clear();
  mockDocument.getElementById.mockClear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

function addMockElement(id: string): void {
  mockElements.set(id, { id } as HTMLElement);
}

function removeMockElement(id: string): void {
  mockElements.delete(id);
}
//#endregion Test Setup

//#region useElementAvailable tests
describe("useElementAvailable", () => {
  it("returns true immediately when all elements exist", () => {
    addMockElement("element-1");
    addMockElement("element-2");

    const { result } = renderHook(() =>
      useElementAvailable(["element-1", "element-2"]),
    );

    expect(result.current).toBe(true);
  });

  it("returns false initially when elements do not exist", () => {
    const { result } = renderHook(() =>
      useElementAvailable(["missing-element"]),
    );

    expect(result.current).toBe(false);
  });

  it("returns true after polling finds elements", () => {
    const { result } = renderHook(() =>
      useElementAvailable(["delayed-element"], { intervalMs: 100 }),
    );

    expect(result.current).toBe(false);

    // Add element to mock DOM
    addMockElement("delayed-element");

    // Advance timer to trigger poll
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe(true);
  });

  it("stops polling after all elements are found", () => {
    const { result } = renderHook(() =>
      useElementAvailable(["test-element"], { intervalMs: 100 }),
    );

    expect(result.current).toBe(false);

    // Add element
    addMockElement("test-element");

    // First poll finds element
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe(true);

    // Remove element to verify polling stopped
    removeMockElement("test-element");

    // Advance more time — should NOT change result bc polling stopped
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe(true);
  });

  it("cleans up interval on unmount", () => {
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");

    const { unmount } = renderHook(() =>
      useElementAvailable(["never-exists"], { intervalMs: 100 }),
    );

    // Polling should be active
    act(() => {
      jest.advanceTimersByTime(100);
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
//#endregion useElementAvailable tests
