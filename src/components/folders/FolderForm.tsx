import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPayload } from "@/services/shortcuts/folder.model";
import { CirclePicker } from "react-color";

interface FolderFormProps {
  initialValues?: {
    name: string;
    icon?: string;
    color?: string;
  };
  onSubmit: (values: FolderPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const FolderForm: React.FC<FolderFormProps> = ({
  initialValues = { name: "", icon: "", color: "#2563eb" },
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [values, setValues] = useState<FolderPayload>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: any) => {
    setValues((prev) => ({ ...prev, color: color.hex }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const colors = [
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Folder Name</Label>
        <Input
          id="name"
          name="name"
          value={values.name}
          onChange={handleChange}
          required
          placeholder="My Folder"
        />
      </div>

      <div>
        <Label htmlFor="icon">Icon (optional)</Label>
        <Input
          id="icon"
          name="icon"
          value={values.icon || ""}
          onChange={handleChange}
          placeholder="folder"
        />
      </div>

      <div>
        <Label>Color</Label>
        <div className="mt-2">
          <CirclePicker
            color={values.color}
            onChange={handleColorChange}
            colors={colors}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Folder"}
        </Button>
      </div>
    </form>
  );
};
