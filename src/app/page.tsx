"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/shared/store";
import {
  fetchShortcuts,
  deleteShortcut,
} from "@/shared/store/slices/shortcutsSlice";
import { ShortcutCard } from "@/shared/components/ShortcutCard";
import ManageShortcuts from "@/features/ManageShortcut/ManageShortcut";
import CreateNewShortcutModal from "@/features/CreateShortcutModal/CreateShortcutModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, Folder, X } from "lucide-react";

interface ShortcutFolder {
  id: string;
  name: string;
  shortcuts: string[];
}

export default function Main() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: shortcuts,
    listLoading,
    error,
  } = useSelector((state: RootState) => state.shortcuts);

  const [folders, setFolders] = useState<ShortcutFolder[]>([
    { id: "1", name: "Work", shortcuts: [] },
    { id: "2", name: "Personal", shortcuts: [] },
    { id: "3", name: "Development", shortcuts: [] },
  ]);

  const [selectedFolder, setSelectedFolder] = useState<string | null>("1");
  const [selectedShortcut, setSelectedShortcut] = useState<string | null>(null);

  useEffect(() => {
    console.log("fetching shortcuts");
    dispatch(fetchShortcuts());
  }, [dispatch]);

  useEffect(() => {
    if (shortcuts.length > 0) {
      const updatedFolders = [...folders];
      updatedFolders[0] = {
        ...updatedFolders[0],
        shortcuts: shortcuts.map((s) => s.id),
      };
      setFolders(updatedFolders);
    }
  }, [shortcuts]);

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

  if (error) {
    return <div className="min-h-screen p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-12 h-[calc(100vh-64px)]">
        <div className="col-span-3 border-r p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Folders</h2>
            <Button size="sm" variant="ghost">
              <PlusCircle className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>

          <div className="space-y-2">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className={`p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedFolder === folder.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200"
                    : ""
                }`}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <div className="flex items-center">
                  <Folder className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{folder.name}</span>
                </div>
              </Card>
            ))}
          </div>
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

          {listLoading ? (
            <div>Loading shortcuts...</div>
          ) : (
            <div className="space-y-3">
              {shortcuts.map((shortcut) => (
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

              {shortcuts.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No shortcuts available
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
