import React, { useState, useCallback, useEffect } from "react";
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

export type FolderModalVariant = "CREATE" | "UPDATE";

interface ManageFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: FolderModalVariant;
  folder?: Folder | null; // Required for UPDATE variant
  onFolderCreated?: (folder: Folder) => void; // For CREATE variant
  onFolderUpdated?: (folder: Folder) => void; // For UPDATE variant
}

export const ManageFolderModal: React.FC<ManageFolderModalProps> = ({
  open,
  onOpenChange,
  variant,
  folder,
  onFolderCreated,
  onFolderUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FolderPayload>({
    name: "",
    icon: "",
    color: "#2563eb",
  });

  const isUpdateVariant = variant === "UPDATE";

  // For UPDATE variant, set initial values from the folder prop
  useEffect(() => {
    if (isUpdateVariant && folder) {
      setInitialValues({
        name: folder.name || "",
        icon: folder.icon || "",
        color: folder.color || "#2563eb",
      });
    } else if (!isUpdateVariant) {
      // Reset to defaults for CREATE variant
      setInitialValues({
        name: "",
        icon: "",
        color: "#2563eb",
      });
    }
  }, [folder, isUpdateVariant, open]);

  const handleSubmit = useCallback(
    async (values: FolderPayload) => {
      try {
        setIsSubmitting(true);

        if (isUpdateVariant) {
          // Update existing folder
          if (!folder) return;

          const updatedFolder = await FolderService.update(folder.id, values);

          toast.success("Folder updated", {
            description: `Folder "${values.name}" has been updated successfully.`,
          });

          if (onFolderUpdated) {
            onFolderUpdated(updatedFolder);
          }
        } else {
          // Create new folder
          const newFolder = await FolderService.create(values);

          toast.success("Folder created", {
            description: `Folder "${values.name}" has been created successfully.`,
          });

          if (onFolderCreated) {
            onFolderCreated(newFolder);
          }
        }

        onOpenChange(false);
      } catch (error) {
        console.error(
          `Failed to ${isUpdateVariant ? "update" : "create"} folder:`,
          error
        );
        toast.error("Error", {
          description: `Failed to ${isUpdateVariant ? "update" : "create"} folder. Please try again.`,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [folder, isUpdateVariant, onFolderCreated, onFolderUpdated, onOpenChange]
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // For UPDATE variant, don't render if no folder is provided
  if (isUpdateVariant && !folder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="folder-modal-description"
      >
        <DialogHeader>
          <DialogTitle>
            {isUpdateVariant ? "Edit Folder" : "Create New Folder"}
          </DialogTitle>
          <DialogDescription id="folder-modal-description">
            {isUpdateVariant
              ? "Update your folder details."
              : "Create a new folder to organize your shortcuts."}
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
