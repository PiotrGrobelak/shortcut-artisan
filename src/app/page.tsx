"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

export default function Main() {
  const [shortcut, setShortcut] = useState<string[]>([]);
  const [savedShortcut, setSavedShortcut] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement>(null);

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
  };

  useEffect(() => {
    setSavedShortcut(shortcut.join("+"));
    console.log("Shortcut set to:", savedShortcut);
  }, [shortcut, savedShortcut]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <p>Application is under construction 👷‍♀️🚧</p>
        <p>Stay tuned for more updates! 🔃</p>
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
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p>Powered by Tauri 🏗️</p>
      </footer>
    </div>
  );
}
