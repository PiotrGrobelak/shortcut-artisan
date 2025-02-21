import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invoke } from "@tauri-apps/api/core";

interface Shortcut {
  id: string;
  name: string;
  combination: string;
  description?: string;
}

interface ShortcutsState {
  items: Shortcut[];
  loading: boolean;
  error: string | null;
}

export const fetchShortcuts = createAsyncThunk(
  "shortcuts/fetch-all",
  async () => {
    return await invoke<Shortcut[]>("get_shortcuts");
  }
);

export const createShortcut = createAsyncThunk(
  "shortcuts/create",
  async (shortcut: Omit<Shortcut, "id">) => {
    return await invoke<Shortcut>("save_shortcut", { shortcut });
  }
);

export const deleteShortcut = createAsyncThunk(
  "shortcuts/delete",
  async (id: string) => {
    await invoke("delete_shortcut", { id });
    return id;
  }
);

const initialState: ShortcutsState = {
  items: [],
  loading: false,
  error: null,
};

const shortcutsSlice = createSlice({
  name: "shortcuts",
  initialState,
  reducers: {
    clearError: (state: ShortcutsState) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchShortcuts.pending, (state: ShortcutsState) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchShortcuts.fulfilled,
      (state: ShortcutsState, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      }
    );
    builder.addCase(
      fetchShortcuts.rejected,
      (state: ShortcutsState, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch shortcuts";
      }
    );

    builder.addCase(
      createShortcut.fulfilled,
      (state: ShortcutsState, action) => {
        state.items.push(action.payload);
        state.loading = false;
        state.error = null;
      }
    );
    builder.addCase(createShortcut.pending, (state: ShortcutsState) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createShortcut.rejected,
      (state: ShortcutsState, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create shortcut";
      }
    );

    builder.addCase(
      deleteShortcut.fulfilled,
      (state: ShortcutsState, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.loading = false;
        state.error = null;
      }
    );
    builder.addCase(deleteShortcut.pending, (state: ShortcutsState) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      deleteShortcut.rejected,
      (state: ShortcutsState, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete shortcut";
      }
    );
  },
});

export const { clearError } = shortcutsSlice.actions;
export default shortcutsSlice.reducer;
