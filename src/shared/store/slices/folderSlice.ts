import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FolderService } from "@/services/shortcuts/folder.service";
import { Folder, FolderPayload } from "@/services/shortcuts/folder.model";

interface FoldersState {
  folders: Folder[];
  foldersLoading: boolean;
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
  folders: [],
  foldersLoading: false,
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
      /**
       * Fetch All Folders
       */
      .addCase(fetchFolders.pending, (state) => {
        state.foldersLoading = true;
        state.error = null;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.folders = action.payload;
        state.foldersLoading = false;
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.foldersLoading = false;
        state.error = action.error.message || "Failed to fetch folders";
      })

      /**
       * Create Folder
       */
      .addCase(createFolder.pending, (state) => {
        state.foldersLoading = true;
        state.error = null;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.folders.push(action.payload);
        state.foldersLoading = false;
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.foldersLoading = false;
        state.error = action.payload as string;
      })

      /**
       * Delete Folder
       */
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = state.folders.filter(
          (item) => item.id !== action.payload
        );
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete folder";
      })

      /**
       * Update Folder
       */
      .addCase(updateFolder.pending, (state) => {
        state.foldersLoading = true;
        state.error = null;
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        const index = state.folders.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.folders[index] = action.payload;
        }
        state.currentFolder = action.payload;
        state.foldersLoading = false;
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.foldersLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFolderError } = folderSlice.actions;
export default folderSlice.reducer;
