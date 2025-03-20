import React, { useState, useCallback } from "react";
import { FolderForm } from "@/shared/components/FolderForm/FolderForm";
import { FolderPayload } from "@/services/shortcuts/folder.model";
import { FolderService } from "@/services/shortcuts/folder.service";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated?: (folderId: string) => void;
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
          onFolderCreated(newFolder.id);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
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
