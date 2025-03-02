"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/shared/store";
import {
  fetchShortcuts,
  deleteShortcut,
} from "@/shared/store/slices/shortcutsSlice";
import { CreateNewShortcutModal } from "@/shared/components/CreateNewShortcutModal";
import { ShortcutCard } from "@/shared/components/ShortcutCard";

export default function FavoritesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: shortcuts,
    loading,
    error,
  } = useSelector((state: RootState) => state.shortcuts);

  useEffect(() => {
    dispatch(fetchShortcuts());
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteShortcut(id)).unwrap();
    } catch (error) {
      console.error("Failed to delete shortcut:", error);
    }
  };

  const handleEdit = (id: string) => {
    console.log("Edit shortcut:", id);
    // TODO: Implement edit functionality
  };

  if (loading) {
    return <div className="min-h-screen p-8">Loading shortcuts...</div>;
  }

  if (error) {
    return <div className="min-h-screen p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Favorite Shortcuts</h1>
          <CreateNewShortcutModal
            onSuccess={() => dispatch(fetchShortcuts())}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shortcuts.map((shortcut) => (
            <ShortcutCard
              key={shortcut.id}
              id={shortcut.id}
              commandName={shortcut.command_name}
              description={shortcut.description}
              keyCombination={shortcut.key_combination}
              onDelete={handleDelete}
              onEdit={() => handleEdit(shortcut.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
