import React from "react";
import { Folder } from "@/services/shortcuts/folder.model";
import { FolderIcon, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FolderCardProps {
  folder: Folder;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  className?: string;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onClick,
  onEdit,
  onDelete,
  isSelected = false,
  className = "",
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-muted transition-colors duration-200 ${
        isSelected ? "bg-primary/10 border border-primary/30" : ""
      } ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div
          className="h-9 w-9 flex items-center justify-center rounded-md mr-3"
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

      {(onEdit || onDelete) && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  Edit folder
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={onDelete}
                >
                  Delete folder
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
