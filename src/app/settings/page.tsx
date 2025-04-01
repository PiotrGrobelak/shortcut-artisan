"use client";

import ThemeSelector from "@/shared/components/ThemeSelector";

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-lg shadow">
          {/* General Settings Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">General</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2 mb-6">
                <span className="font-medium">Theme</span>
                <p className="text-sm text-muted-foreground mb-2">
                  Customize the application appearance
                </p>
                <ThemeSelector />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span>Auto-start application</span>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Configure
                </button>
              </div>
            </div>
          </div>

          {/* Shortcuts Section */}
          <div className="mb-6 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Shortcuts</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Import shortcuts</span>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Import
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>Export shortcuts</span>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
