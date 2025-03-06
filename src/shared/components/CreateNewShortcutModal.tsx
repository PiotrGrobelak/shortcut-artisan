"use client";

import * as React from "react";
import { useState, useRef, KeyboardEventHandler, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ActionType,
  BaseParameters,
  actionParameterRequirements,
} from "@/features/ManageShortcuts/model/ShortcutAction.model";

interface CreateNewShortcutModalProps {
  trigger?: React.ReactNode;
  onSuccess?: (shortcut: string) => void;
}

export function CreateNewShortcutModal({
  trigger,
  onSuccess,
}: CreateNewShortcutModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  const [shortcut, setShortcut] = useState<string[]>([]);
  const [savedShortcut, setSavedShortcut] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [actionType, setActionType] = useState<ActionType>(
    ActionType.OpenFolder
  );
  const divRef = useRef<HTMLDivElement>(null);

  const [actionParams, setActionParams] = useState<BaseParameters>({
    path: "",
    app_name: "",
    script: "",
  });

  useEffect(() => {
    setSavedShortcut(shortcut.join("+"));
  }, [shortcut]);

  const handleParamChange = <T extends keyof BaseParameters>(
    param: T,
    value: BaseParameters[T]
  ) => {
    setActionParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const validateShortcut = (): boolean => {
    if (shortcut.length === 0 || name.trim() === "") {
      alert("Please set a shortcut and enter a name");
      return false;
    }
    return true;
  };

  const validateActionParams = (type: ActionType): boolean => {
    const requiredParams = actionParameterRequirements[type].required;
    const isValid = requiredParams.every(
      (param) => actionParams[param] !== undefined && actionParams[param] !== ""
    );

    if (!isValid) {
      const required = actionParameterRequirements[type].required.join(", ");
      alert(`Please fill in required parameters: ${required}`);
      return false;
    }

    return true;
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();

    // Handle special keys
    const keyMap: { [key: string]: string } = {
      Control: "CTRL",
      Alt: "ALT",
      Shift: "SHIFT",
      Meta: "CMD",
    };

    const key = keyMap[event.key] || event.key.toUpperCase();

    if (!shortcut.includes(key)) {
      setShortcut((prev) => [...prev, key]);
    }
  };

  const handleKeyUp = () => {
    if (divRef.current) {
      divRef.current.blur();
    }
    setIsFocused(false);
  };

  const clearShortcut = () => {
    setShortcut([]);
    setSavedShortcut("");
  };

  const clearForm = () => {
    setShortcut([]);
    setSavedShortcut("");
    setName("");
    setDescription("");
    setActionType(ActionType.OpenFolder);
    setActionParams({
      path: "",
      app_name: "",
      script: "",
    });
  };

  const handleSubmit = async () => {
    if (!validateShortcut() || !validateActionParams(actionType)) {
      return;
    }

    const payload = {
      shortcut: savedShortcut,
      name,
      description,
      actions: [
        {
          action_type: actionType,
          parameters: actionParams,
        },
      ],
    };

    try {
      const newShortcut = await dispatch(createShortcut(payload)).unwrap();
      setIsOpen(false);

      if (onSuccess) {
        onSuccess(newShortcut);
      }
    } catch (error) {
      console.error("Failed to create shortcut:", error);
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
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Shortcut Name</Label>
              <Button variant="ghost" size="sm" onClick={() => setName("")}>
                Clear
              </Button>
            </div>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter shortcut name"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Description</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDescription("")}
              >
                Clear
              </Button>
            </div>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Keyboard Shortcut</Label>
              <Button variant="ghost" size="sm" onClick={clearShortcut}>
                Clear
              </Button>
            </div>
            <div
              ref={divRef}
              tabIndex={0}
              className={`border rounded-md p-4 min-h-[40px] cursor-pointer
                ${isFocused ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}
                ${savedShortcut ? "text-black" : "text-gray-400"}`}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            >
              {savedShortcut ? (
                <div className="flex items-center gap-2">
                  {shortcut.map((key, index) => (
                    <React.Fragment key={index}>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                        {key}
                      </span>
                      {index < shortcut.length - 1 && (
                        <span className="text-gray-500">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                "Click here and press keys to set shortcut"
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Action Configuration</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setActionParams({
                      path: "",
                      app_name: "",
                      script: "",
                    })
                  }
                >
                  Clear Parameters
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select
                  value={actionType}
                  onValueChange={(value) => setActionType(value as ActionType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ActionType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(actionType === ActionType.OpenFolder ||
                actionType === ActionType.OpenFile) && (
                <div className="space-y-2">
                  <Label>Path</Label>
                  <Input
                    type="text"
                    placeholder="Enter path"
                    value={actionParams?.path}
                    onChange={(e) => handleParamChange("path", e.target.value)}
                  />
                </div>
              )}

              {actionType === ActionType.OpenApplication && (
                <div className="space-y-2">
                  <Label>Application Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter application name"
                    value={actionParams?.app_name}
                    onChange={(e) =>
                      handleParamChange("app_name", e.target.value)
                    }
                  />
                </div>
              )}

              {actionType === ActionType.RunShellScript && (
                <div className="space-y-2">
                  <Label>Shell Script</Label>
                  <Input
                    type="text"
                    placeholder="Enter shell script"
                    value={actionParams?.script}
                    onChange={(e) =>
                      handleParamChange("script", e.target.value)
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                clearForm();
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button variant="outline" onClick={clearForm}>
              Clear All
            </Button>
            <Button onClick={handleSubmit}>Create Shortcut</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
