//#region Imports
import { QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { queryClient } from "@/queries";
import { useCurrentUserQuery } from "@/queries/users/useCurrentUserQuery";
import { initWebSocketSubscriptions } from "@/services/websocket/subscriptions";
//#endregion

//#region Types
type IStateProviderContext = {
  isHydrated: boolean;
};

type IProps = {
  children: React.ReactNode;
};
//#endregion

//#region Context
const StateProviderContext = createContext<IStateProviderContext>({
  isHydrated: false,
});
//#endregion

//#region Hooks
export function useStateProvider(): IStateProviderContext {
  return useContext(StateProviderContext);
}
//#endregion

//#region WebSocket Initializer

/**
 * Internal component to initialize WebSocket subscriptions.
 * Must be inside QueryClientProvider to use queries.
 * Waits for currentUser before initializing subscriptions.
 */
function WebSocketInitializer({ children }: { children: React.ReactNode }) {
  const cleanupRef = useRef<(() => void) | null>(null);
  const { data: currentUser } = useCurrentUserQuery({
    // Don't fail if not authenticated yet
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    // Only initialize when user is authenticated
    if (!currentUser?.id) {
      return;
    }

    // Clean up previous subscriptions if any
    cleanupRef.current?.();

    // Initialize WebSocket subscriptions
    cleanupRef.current = initWebSocketSubscriptions(queryClient, {
      currentUserId: currentUser.id,
      currentTeamId: null, // TODO: Get from route/store when available
    });

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [currentUser?.id]);

  return children;
}

//#endregion WebSocket Initializer

//#region Component
export function StateProvider({ children }: IProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after mount (persisted stores rehydrate on mount)
    setIsHydrated(true);
  }, []);

  return (
    <StateProviderContext.Provider value={{ isHydrated }}>
      <QueryClientProvider client={queryClient}>
        <WebSocketInitializer>{children}</WebSocketInitializer>
      </QueryClientProvider>
    </StateProviderContext.Provider>
  );
}
//#endregion
