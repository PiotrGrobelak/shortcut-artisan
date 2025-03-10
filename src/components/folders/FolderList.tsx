import React from "react";
import { Folder } from "@/services/shortcuts/folder.model";
import { Button } from "@/components/ui/button";
import { PlusIcon, FolderIcon, EditIcon, TrashIcon } from "lucide-react";

interface FolderListProps {
  folders: Folder[];
  onAddFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onSelectFolder: (folderId: string) => void;
  selectedFolderId?: string;
}

export const FolderList: React.FC<FolderListProps> = ({
  folders,
  onAddFolder,
  onEditFolder,
  onDeleteFolder,
  onSelectFolder,
  selectedFolderId,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Folders</h2>
        <Button onClick={onAddFolder} size="sm" variant="outline">
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Folder
        </Button>
      </div>

      <div className="space-y-2">
        {folders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No folders created yet. Create your first folder to organize your
            shortcuts.
          </div>
        ) : (
          folders.map((folder) => (
            <div
              key={folder.id}
              className={`flex items-center justify-between p-3 rounded-md ${
                selectedFolderId === folder.id
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-muted"
              }`}
              onClick={() => onSelectFolder(folder.id)}
            >
              <div className="flex items-center">
                <div
                  className="h-8 w-8 flex items-center justify-center rounded-md mr-3"
                  style={{ backgroundColor: folder.color || "#e2e8f0" }}
                >
                  <FolderIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">{folder.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {folder.shortcut_ids.length} shortcuts
                  </div>
                </div>
              </div>

              <div className="flex space-x-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditFolder(folder);
                  }}
                >
                  <EditIcon className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.id);
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
