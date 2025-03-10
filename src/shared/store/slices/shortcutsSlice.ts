import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ShortcutsService } from "@/services/shortcuts/shortcuts.service";
import {
  Shortcut,
  CreateShortcutPayload,
} from "@/services/shortcuts/shortcuts.model";

interface ShortcutsState {
  items: Shortcut[];
  listLoading: boolean;
  detailLoading: boolean;
  createLoading: boolean;
  deleteLoading: boolean;
  error: string | null;
  currentShortcut?: Shortcut;
}

export const fetchShortcuts = createAsyncThunk(
  "shortcuts/fetch-all",
  async (_, { rejectWithValue }) => {
    try {
      return await ShortcutsService.getAll();
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
      return await ShortcutsService.create(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteShortcut = createAsyncThunk(
  "shortcuts/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await ShortcutsService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchShortcutById = createAsyncThunk(
  "shortcuts/fetch-by-id",
  async (id: string, { rejectWithValue }) => {
    try {
      return await ShortcutsService.getById(id);
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
      return await ShortcutsService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState: ShortcutsState = {
  items: [],
  listLoading: false,
  detailLoading: false,
  createLoading: false,
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
      state.createLoading = true;
      state.error = null;
    });
    builder.addCase(
      createShortcut.fulfilled,
      (state: ShortcutsState, action) => {
        if (action.payload) {
          state.items.push(action.payload);
        }
        state.createLoading = false;
      }
    );
    builder.addCase(
      createShortcut.rejected,
      (state: ShortcutsState, action) => {
        state.createLoading = false;
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
      state.createLoading = true;
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
        state.createLoading = false;
      }
    );
  },
});

export const { clearError } = shortcutsSlice.actions;
export default shortcutsSlice.reducer;
