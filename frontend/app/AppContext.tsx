import { createContext, useContext } from "react";

export const AppContext = createContext({
  openChatFromTab: (_chatId: number, _tripId: number) => {},
});

export const useRootNavigation = () => useContext(AppContext);
