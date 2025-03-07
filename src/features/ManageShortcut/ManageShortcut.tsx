import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/shared/store";
import {
  createShortcut,
  fetchShortcutById,
  updateShortcut,
} from "@/shared/store/slices/shortcutsSlice";
import {
  ShortcutForm,
  ShortcutFormValues,
} from "@/shared/components/ShortcutForm/ShortcutForm";
import { ActionType } from "@/services/shortcuts/shortcuts.model";

interface ManageShortcutsProps {
  selectedShortcutId?: string | null;
}

export default function ManageShortcuts({
  selectedShortcutId,
}: ManageShortcutsProps = {}) {
  const dispatch = useDispatch<AppDispatch>();
  const { detailLoading, createLoading, error, currentShortcut } = useSelector(
    (state: RootState) => state.shortcuts
  );

  useEffect(() => {
    if (selectedShortcutId) {
      dispatch(fetchShortcutById(selectedShortcutId));
    }
  }, [selectedShortcutId, dispatch]);

  const handleSubmit = async (values: ShortcutFormValues) => {
    const payload = {
      shortcut: values.shortcut,
      name: values.name,
      description: values.description,
      actions: [
        {
          action_type: values.actionType,
          parameters: values.actionParams,
        },
      ],
    };

    try {
      if (selectedShortcutId) {
        await dispatch(
          updateShortcut({ id: selectedShortcutId, payload })
        ).unwrap();
      } else {
        await dispatch(createShortcut(payload)).unwrap();
      }
    } catch (error) {
      console.error("Error configuring shortcut:", error);
    }
  };

  const initialValues = currentShortcut
    ? {
        shortcut: currentShortcut.key_combination,
        name: currentShortcut.command_name,
        description: currentShortcut.description || "",
        actionType:
          currentShortcut.actions[0]?.action_type || ActionType.OpenFolder,
        actionParams: currentShortcut.actions[0]?.parameters || {},
      }
    : undefined;

  if (detailLoading) {
    return <div className="p-4">Loading shortcut...</div>;
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-red-500 p-4">Error: {error}</div>}

      <ShortcutForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isLoading={createLoading}
        submitLabel={selectedShortcutId ? "Update Shortcut" : "Create Shortcut"}
      />
    </div>
  );
}
