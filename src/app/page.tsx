"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/shared/store";
import {
  fetchShortcutsByFolderId,
  deleteShortcut,
  clearFolderShortcuts,
} from "@/shared/store/slices/shortcutsSlice";
import { fetchFolders, deleteFolder } from "@/shared/store/slices/folderSlice";
import { ShortcutCard } from "@/shared/components/ShortcutCard";
import { FolderCard } from "@/shared/components/FolderCard";
import ManageShortcuts from "@/features/ManageShortcut/ManageShortcut";
import CreateNewShortcutModal from "@/features/CreateShortcutModal/CreateShortcutModal";
import {
  ManageFolderModal,
  FolderModalVariant,
} from "@/features/ManageFolderModal";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { Folder } from "@/services/shortcuts/folder.model";
import { DeleteConfirmationDialog } from "@/shared/components/DeleteConfirmationDialog";

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
  const [selectedShortcutId, setSelectedShortcutId] = useState<string | null>(
    null
  );
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderModalVariant, setFolderModalVariant] =
    useState<FolderModalVariant>("CREATE");
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: "shortcut" | "folder";
  } | null>(null);

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
      setSelectedShortcutId(null);
      dispatch(fetchShortcutsByFolderId(selectedFolder.id));
    } else {
      dispatch(clearFolderShortcuts());
    }
  }, [selectedFolder, dispatch]);

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);

      if (itemToDelete.type === "shortcut") {
        await dispatch(deleteShortcut(itemToDelete.id)).unwrap();

        if (selectedShortcutId === itemToDelete.id) {
          setSelectedShortcutId(null);
        }

        if (selectedFolder) {
          dispatch(fetchShortcutsByFolderId(selectedFolder.id));
        }
      } else {
        await dispatch(deleteFolder(itemToDelete.id)).unwrap();

        if (selectedFolder && selectedFolder.id === itemToDelete.id) {
          setSelectedFolder(null);
          dispatch(clearFolderShortcuts());
        }
      }

      dispatch(fetchFolders());
    } catch (error) {
      console.error(`Failed to delete ${itemToDelete.type}:`, error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (id: string) => {
    setSelectedShortcutId(id);
  };

  const handleClearSelection = () => {
    setSelectedShortcutId(null);
  };

  const openCreateFolderModal = () => {
    setFolderModalVariant("CREATE");
    setFolderToEdit(null);
    setFolderModalOpen(true);
  };

  const openEditFolderModal = (folder: Folder) => {
    setFolderModalVariant("UPDATE");
    setFolderToEdit(folder);
    setFolderModalOpen(true);
  };

  const handleFolderModalOpenChange = (open: boolean) => {
    setFolderModalOpen(open);
    if (!open && folderModalVariant === "UPDATE") {
      setFolderToEdit(null);
    }
  };

  const handleFolderCreated = (folder: Folder) => {
    setSelectedFolder(folder);
    dispatch(fetchFolders());
    dispatch(fetchShortcutsByFolderId(folder.id));
  };

  const handleFolderUpdated = (updatedFolder: Folder) => {
    dispatch(fetchFolders());

    if (selectedFolder && selectedFolder.id === updatedFolder.id) {
      setSelectedFolder(updatedFolder);
    }
  };

  const getCurrentFolderName = () => {
    if (!selectedFolder) return "All Shortcuts";
    const currentFolder = folders.find((f) => f.id === selectedFolder.id);
    return currentFolder ? `${currentFolder.name} Shortcuts` : "Shortcuts";
  };

  const isLoading = foldersLoading || shortcutsLoading;
  const error = foldersError || shortcutsError;

  const confirmDeleteShortcut = (id: string, name: string) => {
    setItemToDelete({ id, name, type: "shortcut" });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteFolder = (id: string, name: string) => {
    setItemToDelete({ id, name, type: "folder" });
    setIsDeleteDialogOpen(true);
  };

  if (error) {
    return <div className="min-h-screen p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen">
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteItem}
        title={`Delete ${itemToDelete?.type === "folder" ? "Folder" : "Shortcut"}`}
        description={
          itemToDelete?.type === "folder"
            ? "You're about to delete this folder and all its contents."
            : "You're about to delete this shortcut."
        }
        itemName={itemToDelete?.name || ""}
        isDeleting={isDeleting}
        type={itemToDelete?.type || "shortcut"}
      />

      <div className="grid grid-cols-12 h-[calc(100vh-64px)]">
        <div className="col-span-3 border-r p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Folders</h2>
            <Button size="sm" variant="ghost" onClick={openCreateFolderModal}>
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
                    onEdit={() => openEditFolderModal(folder)}
                    onDelete={() => confirmDeleteFolder(folder.id, folder.name)}
                  />
                ))
              )}
            </div>
          )}

          <ManageFolderModal
            open={folderModalOpen}
            onOpenChange={handleFolderModalOpenChange}
            variant={folderModalVariant}
            folder={folderToEdit}
            onFolderCreated={handleFolderCreated}
            onFolderUpdated={handleFolderUpdated}
          />
        </div>

        <div className="col-span-3 border-r p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{getCurrentFolderName()}</h2>
            <CreateNewShortcutModal
              folderId={selectedFolder?.id || null}
              onSuccess={(id) => {
                dispatch(fetchFolders());
                setSelectedShortcutId(id);
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
                      confirmDeleteShortcut(id, shortcut.command_name);
                    }}
                    isSelected={selectedShortcutId === shortcut.id}
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
              {selectedShortcutId
                ? "Edit Shortcut"
                : "Select a shortcut or create a new one"}
            </h2>
            {selectedShortcutId && (
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

          {selectedShortcutId && selectedFolder ? (
            <ManageShortcuts
              selectedShortcutId={selectedShortcutId}
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
