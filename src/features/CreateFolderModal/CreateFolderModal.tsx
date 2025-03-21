import React, { useState, useCallback } from "react";
import { FolderForm } from "@/shared/components/FolderForm/FolderForm";
import { Folder, FolderPayload } from "@/services/shortcuts/folder.model";
import { FolderService } from "@/services/shortcuts/folder.service";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated?: (folder: Folder) => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  open,
  onOpenChange,
  onFolderCreated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (values: FolderPayload) => {
      try {
        setIsSubmitting(true);
        const newFolder = await FolderService.create(values);

        toast.success("Folder created", {
          description: `Folder "${values.name}" has been created successfully.`,
        });

        if (onFolderCreated) {
          onFolderCreated(newFolder);
        }

        onOpenChange(false);
      } catch (error) {
        console.error("Failed to create folder:", error);
        toast.error("Error", {
          description: "Failed to create folder. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [onOpenChange, onFolderCreated]
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const initialValues = {
    name: "",
    icon: "",
    color: "#2563eb",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="folder-modal-description"
      >
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription id="folder-modal-description">
            Create a new folder to organize your shortcuts.
          </DialogDescription>
        </DialogHeader>
        <FolderForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};
