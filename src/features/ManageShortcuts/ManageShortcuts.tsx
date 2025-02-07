"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
// import { register, ShortcutEvent } from "@tauri-apps/plugin-global-shortcut";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { ShortcutRequestPayload } from "./model/ShortcutRequestPayload.model";
import { ActionType } from "./model/ShortcutAction.model";

export default function ManageShortcuts() {
  const [shortcut, setShortcut] = useState<string[]>([]);
  const [savedShortcut, setSavedShortcut] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement>(null);

  const sendShortcut = async () => {
    const payload: ShortcutRequestPayload = {
      shortcut: savedShortcut,
      name: name,
      description: "Shortcut to open the artisan console",
      actions: [
        {
          action_type: ActionType.OpenFolder,
          parameters: {
            path: "/dev/shortcut-artisan",
          },
        },
      ],
    };

    try {
      console.log("Sending shortcut:", payload);

      const response = await invoke("save_shortcut", {
        payload,
      });
      console.log("response", response);
    } catch (error) {
      console.error("Error setting shortcut", error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key;
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
  };

  const confirmShortcut = (): void => {
    if (shortcut.length === 0 || name.trim() === "") {
      alert("Please set a shortcut and enter a name");
    } else {
      sendShortcut();
      alert("Shortcut set successfully!");
    }
  };

  useEffect(() => {
    setSavedShortcut(shortcut.join("+"));
    console.log("Shortcut set to:", savedShortcut);
  }, [shortcut, savedShortcut]);

  useEffect(() => {
    let unlistenFn: UnlistenFn | undefined;

    const handleShortcut = async () => {
      console.log("Setting up shortcut listener");
      try {
        unlistenFn = await listen("shortcut-triggered", (event) => {
          console.log("Shortcut triggered:", event);
        });
      } catch (error) {
        console.error("Error setting up shortcut listener:", error);
      }
    };

    handleShortcut();

    // Cleanup function
    return () => {
      console.log("Cleaning up shortcut listener");
      unlistenFn?.();
    };
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <p>Application is under construction 👷‍♀️🚧</p>
        <p>Stay tuned for more updates! 🔃</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          className="border p-2"
        />
        <div
          ref={divRef}
          tabIndex={0}
          className={`border p-4 ${isFocused ? "border-blue-500" : "border-gray-300"}`}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          Click here and press keys to set shortcut
        </div>
        <Button onClick={clearShortcut}>Clear Shortcut</Button>
        {savedShortcut && <p>Saved Shortcut: {savedShortcut}</p>}
        <br />
        <Button onClick={confirmShortcut}>Confirm</Button>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p>Powered by Tauri 🏗️</p>
      </footer>
    </div>
  );
}
