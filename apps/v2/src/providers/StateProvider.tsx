//#region Imports
import { QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "@/queries";
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

//#region Component
export function StateProvider({ children }: IProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after mount (persisted stores rehydrate on mount)
    setIsHydrated(true);
  }, []);

  return (
    <StateProviderContext.Provider value={{ isHydrated }}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </StateProviderContext.Provider>
  );
}
//#endregion
