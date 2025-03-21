import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ShortcutsService } from "@/services/shortcuts/shortcut.service";
import { Shortcut, ShortcutPayload } from "@/services/shortcuts/shortcut.model";

interface ShortcutsState {
  shortcuts: Shortcut[];
  shortcutsLoading: boolean;
  currentShortcut?: Shortcut;
  currentShortcutLoading: boolean;
  error: string | null;
}

export const fetchShortcutsByFolderId = createAsyncThunk(
  "shortcuts/fetch-by-folder",
  async (folderId: string, { rejectWithValue }) => {
    try {
      return await ShortcutsService.getAllByFolderId(folderId);
    } catch (error) {
      console.error(`Failed to fetch shortcuts for folder ${folderId}:`, error);
      return rejectWithValue(error);
    }
  }
);

export const createShortcut = createAsyncThunk(
  "shortcuts/create",
  async (payload: ShortcutPayload, { rejectWithValue }) => {
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
    { id, payload }: { id: string; payload: ShortcutPayload },
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
  currentShortcutLoading: false,
  error: null,
  shortcuts: [],
  shortcutsLoading: false,
};

const shortcutsSlice = createSlice({
  name: "shortcuts",
  initialState,
  reducers: {
    clearError: (state: ShortcutsState) => {
      state.error = null;
    },
    clearFolderShortcuts: (state: ShortcutsState) => {
      state.shortcuts = [];
    },
  },
  extraReducers: (builder) => {
    /**
     * Create Shortcut
     */
    builder.addCase(createShortcut.pending, (state: ShortcutsState) => {
      state.currentShortcutLoading = true;
      state.error = null;
    });
    builder.addCase(
      createShortcut.fulfilled,
      (state: ShortcutsState, action) => {
        if (action.payload) {
          state.shortcuts.push(action.payload);
        }
        state.currentShortcutLoading = false;
      }
    );
    builder.addCase(
      createShortcut.rejected,
      (state: ShortcutsState, action) => {
        state.currentShortcutLoading = false;
        state.error = action.payload as string;
      }
    );

    /**
     * Delete Shortcut
     */
    builder.addCase(
      deleteShortcut.fulfilled,
      (state: ShortcutsState, action) => {
        state.shortcuts = state.shortcuts.filter(
          (item) => item.id !== action.payload
        );
        state.currentShortcutLoading = false;
        state.error = null;
      }
    );
    builder.addCase(deleteShortcut.pending, (state: ShortcutsState) => {
      state.currentShortcutLoading = true;
      state.error = null;
    });
    builder.addCase(
      deleteShortcut.rejected,
      (state: ShortcutsState, action) => {
        state.currentShortcutLoading = false;
        state.error = action.error.message || "Failed to delete shortcut";
      }
    );

    /**
     * Fetch Shortcut by ID
     */
    builder.addCase(fetchShortcutById.pending, (state: ShortcutsState) => {
      state.currentShortcutLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchShortcutById.fulfilled,
      (state: ShortcutsState, action) => {
        state.currentShortcut = action.payload;
        state.currentShortcutLoading = false;
        state.error = null;
      }
    );
    builder.addCase(
      fetchShortcutById.rejected,
      (state: ShortcutsState, action) => {
        state.currentShortcutLoading = false;
        state.error = action.error.message || "Failed to fetch shortcut";
      }
    );

    /**
     * Update Shortcut
     */
    builder.addCase(updateShortcut.pending, (state: ShortcutsState) => {
      state.currentShortcutLoading = true;
      state.error = null;
    });
    builder.addCase(
      updateShortcut.fulfilled,
      (state: ShortcutsState, action) => {
        const index = state.shortcuts.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.shortcuts[index] = action.payload;
        }
        state.currentShortcut = action.payload;
        state.currentShortcutLoading = false;
      }
    );
    builder.addCase(
      updateShortcut.rejected,
      (state: ShortcutsState, action) => {
        state.currentShortcutLoading = false;
        state.error = action.error.message || "Failed to update shortcut";
      }
    );

    /**
     * Fetch Shortcuts by Folder ID
     */
    builder.addCase(
      fetchShortcutsByFolderId.pending,
      (state: ShortcutsState) => {
        state.shortcutsLoading = true;
        state.error = null;
      }
    );
    builder.addCase(
      fetchShortcutsByFolderId.fulfilled,
      (state: ShortcutsState, action) => {
        state.shortcuts = action.payload;
        state.shortcutsLoading = false;
        state.error = null;
      }
    );
    builder.addCase(
      fetchShortcutsByFolderId.rejected,
      (state: ShortcutsState, action) => {
        state.shortcutsLoading = false;
        state.error =
          action.error.message || "Failed to fetch folder shortcuts";
      }
    );
  },
});

export const { clearError, clearFolderShortcuts } = shortcutsSlice.actions;
export default shortcutsSlice.reducer;
