import React, {
  useState,
  useRef,
  KeyboardEventHandler,
  useEffect,
} from "react";
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
  BaseParameters,
  ActionType,
} from "@/services/shortcuts/shortcuts.model";
import { actionParameterRequirements } from "./ShortcutForm.model";
export interface ShortcutFormValues {
  shortcut: string;
  name: string;
  description: string;
  actionType: ActionType;
  actionParams: BaseParameters;
}

interface ShortcutFormProps {
  initialValues?: Partial<ShortcutFormValues>;
  onSubmit: (values: ShortcutFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ShortcutForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Save Shortcut",
}: ShortcutFormProps) {
  const [shortcut, setShortcut] = useState<string[]>([]);
  const [savedShortcut, setSavedShortcut] = useState(
    initialValues?.shortcut || ""
  );
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(
    initialValues?.description || ""
  );
  const [isFocused, setIsFocused] = useState(false);
  const [actionType, setActionType] = useState<ActionType>(
    initialValues?.actionType || ActionType.OpenFolder
  );

  const [actionParams, setActionParams] = useState<BaseParameters>({
    path: "",
    app_name: "",
    script: "",
    ...initialValues?.actionParams,
  });

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialValues?.shortcut) {
      setShortcut(initialValues.shortcut.split("+"));
      setSavedShortcut(initialValues.shortcut);
    }
  }, [initialValues?.shortcut]);

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

  const handleActionTypeChange = (value: ActionType) => {
    setActionType(value);
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

    const values = {
      shortcut: savedShortcut,
      name,
      description,
      actionType,
      actionParams,
    };

    await onSubmit(values);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Shortcut Name</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter shortcut name"
        />
      </div>

      <div className="space-y-2">
        <Label>Shortcut Description</Label>
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter shortcut description"
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

      <Card className="w-full">
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
            <Select value={actionType} onValueChange={handleActionTypeChange}>
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
                onChange={(e) => handleParamChange("app_name", e.target.value)}
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
                onChange={(e) => handleParamChange("script", e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button variant="outline" onClick={clearForm} disabled={isLoading}>
          Clear All
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
