import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ShortcutCardProps {
  id: string;
  commandName: string;
  description?: string;
  keyCombination: string;
  onEdit?: () => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
}

export function ShortcutCard({
  id,
  commandName,
  description,
  keyCombination,
  onEdit,
  onDelete,
  isSelected = false,
}: ShortcutCardProps) {
  return (
    <Card
      className={`bg-white dark:bg-gray-800 p-4 ${isSelected ? "border-2 border-blue-500" : ""}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium">{commandName}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {keyCombination}
          </span>
          <button className="text-gray-500 hover:text-gray-700">
            <span className="sr-only">Menu</span>⋮
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      <div className="flex justify-end space-x-2">
        {onEdit && (
          <Button
            variant="ghost"
            className="text-blue-500 hover:text-blue-600"
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-600"
            onClick={() => onDelete(id)}
          >
            Remove
          </Button>
        )}
      </div>
    </Card>
  );
}
