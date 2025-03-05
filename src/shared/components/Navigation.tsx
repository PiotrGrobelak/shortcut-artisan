"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, BarChart, Code } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/analytics", label: "Analytics", icon: BarChart },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/developer", label: "Developer", icon: Code },
  ];

  return (
    <nav className="h-full w-16 bg-white dark:bg-gray-800 border-r fixed left-0 top-0 flex flex-col items-center p-6">
      <div className="flex flex-col space-y-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg p-2 transition-all duration-200 ${
              isActive(item.path)
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm"
                : "text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
            title={item.label}
          >
            <item.icon
              className={`h-5 w-5 ${isActive(item.path) ? "stroke-[2.5px]" : ""}`}
            />
            <span
              className={`text-xs mt-1.5 font-medium ${isActive(item.path) ? "font-semibold" : ""}`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
