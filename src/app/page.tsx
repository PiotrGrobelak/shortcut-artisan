"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/shared/store";
import {
  fetchShortcuts,
  deleteShortcut,
} from "@/shared/store/slices/shortcutsSlice";
import { fetchFolders } from "@/shared/store/slices/folderSlice";
import { ShortcutCard } from "@/shared/components/ShortcutCard";
import { FolderCard } from "@/shared/components/FolderCard";
import ManageShortcuts from "@/features/ManageShortcut/ManageShortcut";
import CreateNewShortcutModal from "@/features/CreateShortcutModal/CreateShortcutModal";
import { CreateFolderModal } from "@/features/CreateFolderModal";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";

export default function Main() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: shortcuts,
    listLoading: shortcutsLoading,
    error: shortcutsError,
  } = useSelector((state: RootState) => state.shortcuts);

  const {
    items: folders,
    loading: foldersLoading,
    error: foldersError,
  } = useSelector((state: RootState) => state.folders);

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedShortcut, setSelectedShortcut] = useState<string | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchShortcuts());
    dispatch(fetchFolders());
  }, [dispatch]);

  // Set first folder as selected when folders are loaded
  useEffect(() => {
    if (folders.length > 0 && !selectedFolder) {
      setSelectedFolder(folders[0].id);
    }
  }, [folders, selectedFolder]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteShortcut(id)).unwrap();
      if (selectedShortcut === id) {
        setSelectedShortcut(null);
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

  const handleFolderCreated = (folderId: string) => {
    setSelectedFolder(folderId);
  };

  // Get shortcuts for selected folder
  const getFilteredShortcuts = () => {
    if (!selectedFolder) return shortcuts;

    const currentFolder = folders.find((f) => f.id === selectedFolder);
    if (!currentFolder) return shortcuts;

    return shortcuts.filter(
      (shortcut) =>
        currentFolder.shortcut_ids.includes(shortcut.id) ||
        shortcut.folder_id === selectedFolder
    );
  };

  const filteredShortcuts = getFilteredShortcuts();
  const error = shortcutsError || foldersError;

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
                    isSelected={selectedFolder === folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
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
            onOpenChange={setIsCreateFolderModalOpen}
            onFolderCreated={handleFolderCreated}
          />
        </div>

        <div className="col-span-3 border-r p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {selectedFolder
                ? folders.find((f) => f.id === selectedFolder)?.name +
                  " Shortcuts"
                : "Shortcuts"}
            </h2>
            <CreateNewShortcutModal
              onSuccess={(id) => {
                setSelectedShortcut(id);
              }}
              trigger={
                <Button size="sm" variant="ghost">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              }
            />
          </div>

          {shortcutsLoading ? (
            <div>Loading shortcuts...</div>
          ) : (
            <div className="space-y-3">
              {filteredShortcuts.map((shortcut) => (
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
              ))}

              {filteredShortcuts.length === 0 && (
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

          {selectedShortcut ? (
            <ManageShortcuts selectedShortcutId={selectedShortcut} />
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
