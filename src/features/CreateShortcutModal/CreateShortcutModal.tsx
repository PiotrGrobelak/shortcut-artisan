"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/shared/store";
import { createShortcut } from "@/shared/store/slices/shortcutsSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ShortcutForm,
  ShortcutFormValues,
} from "@/shared/components/ShortcutForm/ShortcutForm";

interface CreateNewShortcutModalProps {
  trigger?: React.ReactNode;
  onSuccess?: (shortcutId: string) => void;
}

export default function CreateNewShortcutModal({
  trigger,
  onSuccess,
}: CreateNewShortcutModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: ShortcutFormValues) => {
    setIsLoading(true);

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
      const newShortcut = await dispatch(createShortcut(payload)).unwrap();
      setIsOpen(false);

      if (onSuccess) {
        onSuccess(newShortcut.id);
      }
    } catch (error) {
      console.error("Failed to create shortcut:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add Shortcut
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Shortcut</DialogTitle>
        </DialogHeader>

        <ShortcutForm
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
          isLoading={isLoading}
          submitLabel="Create Shortcut"
        />
      </DialogContent>
    </Dialog>
  );
}
