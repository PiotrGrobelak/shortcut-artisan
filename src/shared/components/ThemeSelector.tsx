"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useEffect, useState } from "react";

type ThemeOption = {
  label: string;
  value: string;
  icon: React.ElementType;
  description: string;
};

const themeOptions: ThemeOption[] = [
  {
    label: "System",
    value: "system",
    icon: Monitor,
    description: "Follow system theme preference",
  },
  {
    label: "Light",
    value: "light",
    icon: Sun,
    description: "Light theme for bright environments",
  },
  {
    label: "Dark",
    value: "dark",
    icon: Moon,
    description: "Dark theme for low light",
  },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const Icon = option.icon;

            return (
              <div
                key={option.value}
                className="relative flex flex-col items-center gap-2 rounded-md border-2 border-border bg-background p-4"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;

          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-md border-2 bg-background p-4 transition-all hover:border-primary",
                isActive ? "border-primary" : "border-border"
              )}
              type="button"
            >
              {isActive && (
                <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              )}

              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />

              <div className="text-sm font-medium">{option.label}</div>

              <div className="text-xs text-muted-foreground">
                {option.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
