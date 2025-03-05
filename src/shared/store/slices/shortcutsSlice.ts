import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invoke } from "@tauri-apps/api/core";
import { ShortcutAction } from "@/features/ManageShortcuts/model/ShortcutAction.model";

interface Shortcut {
  id: string;
  key_combination: string;
  command_name: string;
  description?: string;
  enabled: boolean;
  actions: ShortcutAction[];
}

interface CreateShortcutPayload {
  shortcut: string;
  name: string;
  description?: string;
  actions: ShortcutAction[];
}

interface ShortcutsState {
  items: Shortcut[];
  listLoading: boolean;
  detailLoading: boolean;
  saveLoading: boolean;
  deleteLoading: boolean;
  error: string | null;
  currentShortcut?: Shortcut;
}

export const fetchShortcuts = createAsyncThunk(
  "shortcuts/fetch-all",
  async (_, { rejectWithValue }) => {
    try {
      return await invoke<Shortcut[]>("get_shortcuts");
    } catch (error) {
      console.error("Failed to fetch shortcuts:", error);
      return rejectWithValue(error);
    }
  }
);

export const createShortcut = createAsyncThunk(
  "shortcuts/create",
  async (payload: CreateShortcutPayload, { rejectWithValue }) => {
    try {
      const response = await invoke<Shortcut>("save_shortcut", { payload });
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteShortcut = createAsyncThunk(
  "shortcuts/delete",
  async (id: string) => {
    await invoke("delete_shortcut", { id });
    return id;
  }
);

export const fetchShortcutById = createAsyncThunk(
  "shortcuts/fetch-by-id",
  async (id: string, { rejectWithValue }) => {
    try {
      return await invoke<Shortcut>("get_shortcut_by_id", { id });
    } catch (error) {
      console.error(`Failed to fetch shortcut with id ${id}:`, error);
      return rejectWithValue(error);
    }
  }
);

export const updateShortcut = createAsyncThunk(
  "shortcuts/update",
  async (
    { id, payload }: { id: string; payload: CreateShortcutPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await invoke<Shortcut>("update_shortcut", {
        id,
        payload,
      });
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState: ShortcutsState = {
  items: [],
  listLoading: false,
  detailLoading: false,
  saveLoading: false,
  deleteLoading: false,
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
      state.listLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchShortcuts.fulfilled,
      (state: ShortcutsState, action) => {
        state.items = action.payload;
        state.listLoading = false;
        state.error = null;
      }
    );
    builder.addCase(
      fetchShortcuts.rejected,
      (state: ShortcutsState, action) => {
        state.listLoading = false;
        state.error = action.error.message || "Failed to fetch shortcuts";
      }
    );

    builder.addCase(createShortcut.pending, (state: ShortcutsState) => {
      state.saveLoading = true;
      state.error = null;
    });
    builder.addCase(
      createShortcut.fulfilled,
      (state: ShortcutsState, action) => {
        if (action.payload) {
          state.items.push(action.payload);
        }
        state.saveLoading = false;
      }
    );
    builder.addCase(
      createShortcut.rejected,
      (state: ShortcutsState, action) => {
        state.saveLoading = false;
        state.error = action.payload as string;
      }
    );

    builder.addCase(
      deleteShortcut.fulfilled,
      (state: ShortcutsState, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.deleteLoading = false;
        state.error = null;
      }
    );
    builder.addCase(deleteShortcut.pending, (state: ShortcutsState) => {
      state.deleteLoading = true;
      state.error = null;
    });
    builder.addCase(
      deleteShortcut.rejected,
      (state: ShortcutsState, action) => {
        state.deleteLoading = false;
        state.error = action.error.message || "Failed to delete shortcut";
      }
    );

    builder.addCase(fetchShortcutById.pending, (state: ShortcutsState) => {
      state.detailLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchShortcutById.fulfilled,
      (state: ShortcutsState, action) => {
        state.currentShortcut = action.payload;
        state.detailLoading = false;
        state.error = null;
      }
    );
    builder.addCase(
      fetchShortcutById.rejected,
      (state: ShortcutsState, action) => {
        state.detailLoading = false;
        state.error = action.error.message || "Failed to fetch shortcut";
      }
    );

    builder.addCase(updateShortcut.pending, (state: ShortcutsState) => {
      state.saveLoading = true;
      state.error = null;
    });
    builder.addCase(
      updateShortcut.fulfilled,
      (state: ShortcutsState, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.currentShortcut = action.payload;
        state.saveLoading = false;
      }
    );
  },
});

export const { clearError } = shortcutsSlice.actions;
export default shortcutsSlice.reducer;
