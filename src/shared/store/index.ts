import { configureStore } from "@reduxjs/toolkit";
import shortcutsReducer from "./slices/shortcutsSlice";
import folderReducer from "./slices/folderSlice";

export const store = configureStore({
  reducer: {
    shortcuts: shortcutsReducer,
    folders: folderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
