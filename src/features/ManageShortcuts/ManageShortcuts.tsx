import React, {
  useEffect,
  useState,
  useRef,
  KeyboardEventHandler,
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
  ActionType,
  BaseParameters,
  actionParameterRequirements,
} from "./model/ShortcutAction.model";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/shared/store";
import { createShortcut } from "@/shared/store/slices/shortcutsSlice";

export default function ManageShortcuts() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.shortcuts);

  const [shortcut, setShortcut] = useState<string[]>([]);
  const [savedShortcut, setSavedShortcut] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [actionType, setActionType] = useState<ActionType>(
    ActionType.OpenFolder
  );

  const [actionParams, setActionParams] = useState<BaseParameters>({
    path: "",
    app_name: "",
    script: "",
  });

  const divRef = useRef<HTMLDivElement>(null);

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

  const sendShortcut = async () => {
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
      await dispatch(createShortcut(payload)).unwrap();
      clearShortcut();
    } catch (error) {
      console.error("Error configuring shortcut:", error);
    }
  };

  const handleActionTypeChange = (value: ActionType) => {
    setActionType(value);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const key = event.key.toUpperCase();
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
    setName("");
    setDescription("");
    setActionType(ActionType.OpenFolder);
    setActionParams({
      path: "",
      app_name: "",
      script: "",
    });
  };

  useEffect(() => {
    setSavedShortcut(shortcut.join("+"));
  }, [shortcut]);

  return (
    <div className="min-h-screen p-8">
      <div className="grid grid-cols-2 gap-24 mt-8 relative">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Shortcuts List</h2>
          <ul className="space-y-4">
            <li>Shortcut Item</li>
          </ul>
        </div>
        {/* Vertical divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black"></div>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Shortcut Configuration
          </h2>

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
              <Label>Keyboard Shortcut</Label>
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
                {savedShortcut || "Click here and press keys to set shortcut"}
              </div>
            </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>Action Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select
                    value={actionType}
                    onValueChange={handleActionTypeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ActionType.OpenFolder}>
                        Open Folder
                      </SelectItem>
                      <SelectItem value={ActionType.OpenFile}>
                        Open File
                      </SelectItem>
                      <SelectItem value={ActionType.OpenApplication}>
                        Open Application
                      </SelectItem>
                      <SelectItem value={ActionType.RunShellScript}>
                        Run Shell Script
                      </SelectItem>
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
                      onChange={(e) =>
                        handleParamChange("path", e.target.value)
                      }
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

            {loading && <div>Saving shortcut...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={clearShortcut}
                disabled={loading}
              >
                Clear All
              </Button>
              <Button onClick={sendShortcut} disabled={loading}>
                {loading ? "Saving..." : "Save Shortcut"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
