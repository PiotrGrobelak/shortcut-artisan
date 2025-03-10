import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FolderService } from "@/services/shortcuts/folder.service";
import { Folder, FolderPayload } from "@/services/shortcuts/folder.model";

interface FoldersState {
  items: Folder[];
  loading: boolean;
  error: string | null;
  currentFolder?: Folder;
}

export const fetchFolders = createAsyncThunk(
  "folders/fetch-all",
  async (_, { rejectWithValue }) => {
    try {
      return await FolderService.getAll();
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      return rejectWithValue(error);
    }
  }
);

export const createFolder = createAsyncThunk(
  "folders/create",
  async (payload: FolderPayload, { rejectWithValue }) => {
    try {
      return await FolderService.create(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteFolder = createAsyncThunk(
  "folders/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await FolderService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchFolderById = createAsyncThunk(
  "folders/fetch-by-id",
  async (id: string, { rejectWithValue }) => {
    try {
      return await FolderService.getById(id);
    } catch (error) {
      console.error(`Failed to fetch folder with id ${id}:`, error);
      return rejectWithValue(error);
    }
  }
);

export const updateFolder = createAsyncThunk(
  "folders/update",
  async (
    { id, payload }: { id: string; payload: FolderPayload },
    { rejectWithValue }
  ) => {
    try {
      return await FolderService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState: FoldersState = {
  items: [],
  loading: false,
  error: null,
};

const folderSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    clearFolderError: (state: FoldersState) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all folders
      .addCase(fetchFolders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch folders";
      })

      // Create folder
      .addCase(createFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete folder
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete folder";
      })

      // Fetch folder by ID
      .addCase(fetchFolderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFolderById.fulfilled, (state, action) => {
        state.currentFolder = action.payload;
        state.loading = false;
      })
      .addCase(fetchFolderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch folder";
      })

      // Update folder
      .addCase(updateFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.currentFolder = action.payload;
        state.loading = false;
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFolderError } = folderSlice.actions;
export default folderSlice.reducer;
