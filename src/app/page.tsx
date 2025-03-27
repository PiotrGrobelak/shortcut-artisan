"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/shared/store";
import {
  fetchShortcutsByFolderId,
  deleteShortcut,
  clearFolderShortcuts,
} from "@/shared/store/slices/shortcutsSlice";
import { fetchFolders } from "@/shared/store/slices/folderSlice";
import { ShortcutCard } from "@/shared/components/ShortcutCard";
import { FolderCard } from "@/shared/components/FolderCard";
import ManageShortcuts from "@/features/ManageShortcut/ManageShortcut";
import CreateNewShortcutModal from "@/features/CreateShortcutModal/CreateShortcutModal";
import { CreateFolderModal } from "@/features/CreateFolderModal";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { Folder } from "@/services/shortcuts/folder.model";

export default function Main() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    shortcutsLoading,
    shortcuts,
    error: shortcutsError,
  } = useSelector((state: RootState) => state.shortcuts);

  const {
    folders,
    foldersLoading,
    error: foldersError,
  } = useSelector((state: RootState) => state.folders);

  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedShortcut, setSelectedShortcut] = useState<string | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchFolders());
  }, [dispatch]);

  useEffect(() => {
    if (folders.length > 0 && !selectedFolder) {
      setSelectedFolder(folders[0]);
    }
  }, [folders, selectedFolder]);

  useEffect(() => {
    if (selectedFolder) {
      dispatch(fetchShortcutsByFolderId(selectedFolder.id));
    } else {
      dispatch(clearFolderShortcuts());
    }
  }, [selectedFolder, dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteShortcut(id)).unwrap();
      if (selectedShortcut === id) {
        setSelectedShortcut(null);
      }

      if (selectedFolder) {
        dispatch(fetchFolders());
        dispatch(fetchShortcutsByFolderId(selectedFolder.id));
      }
    } catch (error) {
      console.error("Failed to delete shortcut:", error);
    }
  };

  const handleEdit = (id: string) => {
    setSelectedShortcut(id);
  };

  const handleClearSelection = () => {
    setSelectedShortcut(null);
  };

  const handleFolderCreated = (folder: Folder) => {
    setSelectedFolder(folder);
    setIsCreateFolderModalOpen(false);
    dispatch(fetchShortcutsByFolderId(folder.id));
  };

  const handleModalOpenChange = (open: boolean) => {
    setIsCreateFolderModalOpen(open);
  };

  const getCurrentFolderName = () => {
    if (!selectedFolder) return "All Shortcuts";
    const currentFolder = folders.find((f) => f.id === selectedFolder.id);
    return currentFolder ? `${currentFolder.name} Shortcuts` : "Shortcuts";
  };

  const isLoading = foldersLoading || shortcutsLoading;
  const error = foldersError || shortcutsError;

  if (error) {
    return <div className="min-h-screen p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-12 h-[calc(100vh-64px)]">
        <div className="col-span-3 border-r p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Folders</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCreateFolderModalOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>

          {foldersLoading ? (
            <div>Loading folders...</div>
          ) : (
            <div className="space-y-2">
              {folders.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No folders available. Create your first folder.
                </div>
              ) : (
                folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    isSelected={selectedFolder?.id === folder.id}
                    onClick={() => setSelectedFolder(folder)}
                    onEdit={() => {
                      // Handle edit folder (could open an edit modal)
                    }}
                    onDelete={() => {
                      // Handle delete folder
                    }}
                  />
                ))
              )}
            </div>
          )}

          <CreateFolderModal
            open={isCreateFolderModalOpen}
            onOpenChange={handleModalOpenChange}
            onFolderCreated={handleFolderCreated}
          />
        </div>

        <div className="col-span-3 border-r p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{getCurrentFolderName()}</h2>
            <CreateNewShortcutModal
              folderId={selectedFolder?.id || null}
              onSuccess={(id) => {
                dispatch(fetchFolders());
                setSelectedShortcut(id);
                if (selectedFolder) {
                  dispatch(fetchShortcutsByFolderId(selectedFolder.id));
                }
              }}
              trigger={
                <Button size="sm" variant="ghost">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              }
            />
          </div>

          {isLoading ? (
            <div>Loading shortcuts...</div>
          ) : (
            <div className="space-y-3">
              {shortcuts.length > 0 ? (
                shortcuts.map((shortcut) => (
                  <ShortcutCard
                    key={shortcut.id}
                    id={shortcut.id}
                    commandName={shortcut.command_name}
                    description={shortcut.description}
                    keyCombination={shortcut.key_combination}
                    onEdit={() => handleEdit(shortcut.id)}
                    onDelete={(id) => {
                      handleDelete(id);
                      if (selectedShortcut === id) {
                        setSelectedShortcut(null);
                      }
                    }}
                    isSelected={selectedShortcut === shortcut.id}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No shortcuts in this folder
                </div>
              )}
            </div>
          )}
        </div>

        <div className="col-span-6 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {selectedShortcut
                ? "Edit Shortcut"
                : "Select a shortcut or create a new one"}
            </h2>
            {selectedShortcut && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearSelection}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            )}
          </div>

          {selectedShortcut && selectedFolder ? (
            <ManageShortcuts
              selectedShortcutId={selectedShortcut}
              folder_id={selectedFolder.id}
            />
          ) : (
            <div className="text-center text-gray-500 p-12 border border-dashed rounded-lg">
              No shortcut selected. Select a shortcut from the list or create a
              new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
