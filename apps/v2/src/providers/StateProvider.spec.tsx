import { render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { StateProvider, useStateProvider } from "./StateProvider";

//#region Test Components

function TestChild() {
  return <Text testID="test-child">Child Content</Text>;
}

function QueryClientConsumer() {
  const queryClient = useQueryClient();
  const isQueryClient = queryClient instanceof QueryClient;
  return (
    <Text testID="query-client-status">
      {isQueryClient ? "has-query-client" : "no-query-client"}
    </Text>
  );
}

//#endregion

//#region Rendering Tests

describe("<StateProvider />", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      const { getByTestId, getByText } = render(
        <StateProvider>
          <TestChild />
        </StateProvider>,
      );

      expect(getByTestId("test-child")).toBeTruthy();
      expect(getByText("Child Content")).toBeTruthy();
    });

    it("renders multiple children", () => {
      const { getByText } = render(
        <StateProvider>
          <Text>First</Text>
          <Text>Second</Text>
        </StateProvider>,
      );

      expect(getByText("First")).toBeTruthy();
      expect(getByText("Second")).toBeTruthy();
    });

    it("renders nested elements", () => {
      const { getByTestId } = render(
        <StateProvider>
          <Text testID="outer">
            <Text testID="inner">Nested</Text>
          </Text>
        </StateProvider>,
      );

      expect(getByTestId("outer")).toBeTruthy();
      expect(getByTestId("inner")).toBeTruthy();
    });
  });

  //#endregion Rendering Tests

  //#region QueryClient Provider Tests

  describe("QueryClientProvider", () => {
    it("provides QueryClient to children via useQueryClient", () => {
      const { getByTestId } = render(
        <StateProvider>
          <QueryClientConsumer />
        </StateProvider>,
      );

      expect(getByTestId("query-client-status").props.children).toBe(
        "has-query-client",
      );
    });

    it("provides access to queryClient via useQueryClient hook", () => {
      let capturedClient: QueryClient | null = null;

      function CaptureClient() {
        capturedClient = useQueryClient();
        return null;
      }

      render(
        <StateProvider>
          <CaptureClient />
        </StateProvider>,
      );

      expect(capturedClient).toBeInstanceOf(QueryClient);
    });

    it("allows query operations through provided client", () => {
      let queryClient: QueryClient | null = null;

      function QueryTester() {
        queryClient = useQueryClient();
        return null;
      }

      render(
        <StateProvider>
          <QueryTester />
        </StateProvider>,
      );

      // Verify queryClient has expected methods
      expect(queryClient).not.toBeNull();
      expect(typeof queryClient!.getQueryData).toBe("function");
      expect(typeof queryClient!.setQueryData).toBe("function");
      expect(typeof queryClient!.invalidateQueries).toBe("function");
    });
  });

  //#endregion QueryClient Provider Tests

  //#region Error Boundary Tests

  describe("error handling", () => {
    it("throws error when useQueryClient is called outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      function ComponentOutsideProvider() {
        useQueryClient();
        return null;
      }

      expect(() => {
        render(<ComponentOutsideProvider />);
      }).toThrow();

      consoleSpy.mockRestore();
    });
  });

  //#endregion Error Boundary Tests

  //#region Hydration Tests

  describe("hydration", () => {
    it("isHydrated starts false and becomes true after mount", async () => {
      const hydrationStates: boolean[] = [];

      function HydrationObserver() {
        const { isHydrated } = useStateProvider();
        hydrationStates.push(isHydrated);
        return (
          <Text testID="hydration-status">
            {isHydrated ? "hydrated" : "not-hydrated"}
          </Text>
        );
      }

      const { getByTestId } = render(
        <StateProvider>
          <HydrationObserver />
        </StateProvider>,
      );

      // After useEffect runs, should be hydrated
      await waitFor(() => {
        expect(getByTestId("hydration-status").props.children).toBe("hydrated");
      });

      // First render should have been false
      expect(hydrationStates[0]).toBe(false);
    });

    it("useStateProvider returns context value", () => {
      let capturedContext: { isHydrated: boolean } | null = null;

      function ContextCapture() {
        capturedContext = useStateProvider();
        return null;
      }

      render(
        <StateProvider>
          <ContextCapture />
        </StateProvider>,
      );

      expect(capturedContext).not.toBeNull();
      expect(capturedContext).toHaveProperty("isHydrated");
      expect(typeof capturedContext!.isHydrated).toBe("boolean");
    });

    it("useStateProvider returns default value outside provider", () => {
      let capturedContext: { isHydrated: boolean } | null = null;

      function ContextCapture() {
        capturedContext = useStateProvider();
        return null;
      }

      render(<ContextCapture />);

      // Should return default context value (isHydrated: false)
      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.isHydrated).toBe(false);
    });
  });

  //#endregion Hydration Tests
});
