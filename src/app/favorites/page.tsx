"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/shared/store";
import {
  fetchShortcuts,
  deleteShortcut,
} from "@/shared/store/slices/shortcutsSlice";

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
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add Shortcut
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">{shortcut.command_name}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {shortcut.key_combination}
                  </span>
                  <button className="text-gray-500 hover:text-gray-700">
                    <span className="sr-only">Menu</span>⋮
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {shortcut.description}
              </p>
              <div className="flex justify-end space-x-2">
                <button className="text-sm text-blue-500 hover:text-blue-600">
                  Edit
                </button>
                <button
                  className="text-sm text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(shortcut.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
