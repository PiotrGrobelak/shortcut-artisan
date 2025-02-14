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
import { invoke } from "@tauri-apps/api/core";

const ActionType = {
  OpenFolder: "OpenFolder",
  OpenFile: "OpenFile",
  OpenApplication: "OpenApplication",
  RunShellScript: "RunShellScript",
};

export default function ManageShortcuts() {
  const [shortcut, setShortcut] = useState<string[]>([]);
  const [savedShortcut, setSavedShortcut] = useState("");
  const [name, setName] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [actionType, setActionType] = useState(ActionType.OpenFolder);
  const [actionParams, setActionParams] = useState({
    path: "",
    app_name: "",
    script: "",
  });

  const divRef = useRef<HTMLDivElement>(null);

  const handleActionTypeChange = (value: string) => {
    setActionType(value);
  };

  const handleParamChange = (param: string, value: string) => {
    setActionParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const sendShortcut = async () => {
    const action = {
      action_type: actionType,
      parameters: actionParams,
    };

    const payload = {
      shortcut: savedShortcut,
      name: name,
      description: "Custom shortcut configuration",
      actions: [action],
    };

    try {
      console.log("Shortcut configuration:", payload);
      // Here you would typically send the data to your backend
      // For now we'll just log it
      const response = await invoke("save_shortcut", {
        payload,
      });
      console.log("response", response);
      alert("Shortcut configuration saved (mock)");
    } catch (error) {
      console.error("Error configuring shortcut:", error);
      alert("Error saving shortcut: " + error);
    }
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
    setActionType(ActionType.OpenFolder);
    setActionParams({
      path: "",
      app_name: "",
      script: "",
    });
  };

  const confirmShortcut = () => {
    if (shortcut.length === 0 || name.trim() === "") {
      alert("Please set a shortcut and enter a name");
      return;
    }

    if (
      actionType === ActionType.OpenFolder ||
      actionType === ActionType.OpenFile
    ) {
      if (!actionParams.path) {
        alert("Please enter a path");
        return;
      }
    } else if (
      actionType === ActionType.OpenApplication &&
      !actionParams.app_name
    ) {
      alert("Please enter an application name");
      return;
    } else if (
      actionType === ActionType.RunShellScript &&
      !actionParams.script
    ) {
      alert("Please enter a shell script");
      return;
    }

    sendShortcut();
  };

  useEffect(() => {
    setSavedShortcut(shortcut.join("+"));
  }, [shortcut]);

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Shortcut Configuration
        </h1>

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
                    value={actionParams.path}
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
                    value={actionParams.app_name}
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
                    value={actionParams.script}
                    onChange={(e) =>
                      handleParamChange("script", e.target.value)
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={clearShortcut}>
              Clear All
            </Button>
            <Button onClick={confirmShortcut}>Save Shortcut</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
