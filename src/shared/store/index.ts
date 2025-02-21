import { configureStore } from "@reduxjs/toolkit";
import shortcutsReducer from "./slices/shortcutsSlice";

export const store = configureStore({
  reducer: {
    shortcuts: shortcutsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
