"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const useShortcut = (shortcutKeys: string[], callback: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keysPressed = new Set(shortcutKeys.map((key) => key.toLowerCase()));
      if (keysPressed.has("control") && event.ctrlKey) {
        keysPressed.delete("control");
      }
      if (keysPressed.has("shift") && event.shiftKey) {
        keysPressed.delete("shift");
      }
      if (keysPressed.has("alt") && event.altKey) {
        keysPressed.delete("alt");
      }
      if (keysPressed.has("meta") && event.metaKey) {
        keysPressed.delete("meta");
      }
      if (keysPressed.has(event.key.toLowerCase())) {
        keysPressed.delete(event.key.toLowerCase());
      }
      if (keysPressed.size === 0) {
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcutKeys, callback]);
};

export default function Main() {
  const [shortcut, setShortcut] = useState<string[]>([]);

  const onClickButton = () => {
    console.log("This is a native console log for test shadcn/ui!");
    alert("This is a native popup for test shadcn/ui!");
  };

  useShortcut(shortcut, onClickButton);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShortcut(event.target.value.split("+"));
    console.log("shortcut", shortcut);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <p>Application is under construction 👷‍♀️🚧</p>
        <p>Stay tuned for more updates! 🔃</p>
        <Input
          type="text"
          placeholder="Enter shortcut (e.g., Ctrl+S)"
          onChange={handleInputChange}
        />
        <Button onClick={onClickButton}>Click and check: shadcn/ui</Button>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p>Powered by Tauri 🏗️</p>
      </footer>
    </div>
  );
}
